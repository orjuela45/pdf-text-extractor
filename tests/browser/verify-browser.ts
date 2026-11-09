import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { type Server, createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { type Browser, type Page, launch } from 'puppeteer-core';

import { PdfFixtureFactory } from '../fixtures/PdfFixtureFactory.ts';
import { NetlifyHeaderReader } from './NetlifyHeaderReader.ts';

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
};

const QPDF = '/usr/bin/qpdf';
const NETLIFY_CONFIG = resolve(import.meta.dirname, '../../netlify.toml');

class StaticServer {
  private readonly headers = new NetlifyHeaderReader(readFileSync(NETLIFY_CONFIG, 'utf8'));
  private server: Server | null = null;

  async start(root: string): Promise<number> {
    const rootPath = resolve(root);
    const fallback = join(rootPath, 'index.html');

    this.server = createServer((request, response) => {
      const rawUrl = request.url ?? '/';
      const pathname = decodeURIComponent(rawUrl.split('?')[0] ?? '/');
      const candidate = normalize(join(rootPath, pathname === '/' ? 'index.html' : pathname));
      const filePath =
        candidate.startsWith(rootPath) && existsSync(candidate) && statSync(candidate).isFile()
          ? candidate
          : fallback;

      response.writeHead(200, {
        'content-type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream',
        ...this.headers.valuesFor(pathname === '/' ? '/index.html' : pathname),
      });
      response.end(readFileSync(filePath));
    });

    return await new Promise<number>((resolvePort, reject) => {
      this.server?.once('error', reject);
      this.server?.listen(0, '127.0.0.1', () => {
        const address = this.server?.address();
        resolvePort(typeof address === 'object' && address !== null ? address.port : 0);
      });
    });
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolveClose) => this.server?.close(() => resolveClose()));
    this.server = null;
  }
}

class BrowserFixtures {
  readonly directory = mkdtempSync(join(tmpdir(), 'pdf-browser-'));
  private readonly factory = new PdfFixtureFactory();

  async normal(): Promise<string> {
    return this.save('normal.pdf', await this.factory.paragraphs());
  }

  async bold(): Promise<string> {
    return this.save('bold.pdf', await this.factory.boldHeadings());
  }

  async headingParagraphs(): Promise<string> {
    return this.save('heading-paragraphs.pdf', await this.factory.headingWithParagraphs());
  }

  async rotated(): Promise<string> {
    return this.save('rotated.pdf', await this.factory.rotatedPage());
  }

  async empty(): Promise<string> {
    return this.save('empty.pdf', await this.factory.noTextLayer());
  }

  async encrypted(): Promise<string | null> {
    if (!existsSync(QPDF)) {
      return null;
    }

    const plain = this.save('plain.pdf', await this.factory.separatedWords());
    const encrypted = join(this.directory, 'encrypted.pdf');

    execFileSync(QPDF, ['--encrypt', 'user', 'owner', '256', '--', plain, encrypted]);

    return encrypted;
  }

  private save(name: string, bytes: Uint8Array): string {
    const path = join(this.directory, name);

    writeFileSync(path, bytes);

    return path;
  }
}

class BrowserVerifier {
  private readonly fixtures = new BrowserFixtures();
  private readonly results: string[] = [];
  private readonly consoleErrors: string[] = [];

  async run(): Promise<void> {
    const browser = await launch({
      executablePath: this.resolveChrome(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const server = new StaticServer();
    const port = await server.start('dist');
    const origin = `http://127.0.0.1:${port}`;
    const page = await browser.newPage();

    page.on('console', (message) => {
      if (message.type() === 'error') {
        this.consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => this.consoleErrors.push(String(error)));

    try {
      await this.verify(browser, page, origin);
    } finally {
      await server.stop();
      await browser.close();
    }

    for (const result of this.results) {
      process.stdout.write(`${result}\n`);
    }

    process.exitCode = this.results.some((result) => result.startsWith('FAIL')) ? 1 : 0;
  }

  private async verify(browser: Browser, page: Page, origin: string): Promise<void> {
    await browser
      .defaultBrowserContext()
      .overridePermissions(origin, [
        'clipboard-read',
        'clipboard-write',
        'clipboard-sanitized-write',
      ]);

    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(origin, { waitUntil: 'networkidle0' });

    await this.check('the served document carries the security headers', async () => {
      const response = await page.goto(origin, { waitUntil: 'domcontentloaded' });
      assert.ok(response !== null, 'no response for the document');
      const headers = response.headers();

      assert.ok(
        (headers['content-security-policy'] ?? '').includes("default-src 'self'"),
        `content-security-policy missing or unexpected: ${headers['content-security-policy'] ?? 'absent'}`,
      );
      assert.equal(headers['x-content-type-options'], 'nosniff');
      assert.equal(headers['x-frame-options'], 'DENY');
      assert.equal(headers['referrer-policy'], 'no-referrer');
      assert.equal(headers['cross-origin-opener-policy'], 'same-origin');
    });

    await this.check('the app loads with the product name and no console errors', async () => {
      const name = await page.evaluate(() =>
        Array.from(document.querySelectorAll('span')).some(
          (element) => element.textContent === 'Extractor de texto PDF',
        ),
      );
      assert.ok(name, 'the product name is not shown');
      assert.deepEqual(this.consoleErrors, []);
    });

    await this.check('a PDF loads, paints the canvas and builds a real text layer', async () => {
      await this.upload(page, await this.fixtures.normal());
      await page.waitForFunction(() => document.querySelectorAll('.textLayer span').length > 0, {
        timeout: 30000,
      });

      const painted = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!(canvas instanceof HTMLCanvasElement)) {
          return null;
        }
        const context = canvas.getContext('2d');
        if (context === null) {
          return null;
        }
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let dark = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          if ((pixels[index] ?? 255) < 200) {
            dark += 1;
          }
        }
        return { width: canvas.width, height: canvas.height, dark };
      });

      assert.ok(painted !== null, 'no canvas found');
      assert.ok(painted.width > 0 && painted.height > 0, 'canvas has no size');
      assert.ok(painted.dark > 0, 'canvas is blank');

      const text = await page.$eval('.textLayer', (element) => element.textContent ?? '');
      assert.ok(text.includes('Primera linea indentada'), 'the text layer has no real text');
    });

    await this.check(
      'clicking a paragraph writes the corrected text to the clipboard',
      async () => {
        await this.clickText(page, 'Primera linea indentada');

        const expected = 'Primera linea indentada segunda linea del parrafo';

        await page.waitForFunction(
          (wanted) => navigator.clipboard.readText().then((text) => text === wanted),
          { timeout: 10000 },
          expected,
        );

        const clipboard = await page.evaluate(() => navigator.clipboard.readText());

        assert.equal(clipboard, expected);
      },
    );

    await this.check(
      'the side panel lists the section without mounting its text and copies the whole document',
      async () => {
        const panel = await page.$eval(
          'aside[aria-label="Secciones detectadas"]',
          (element) => element.textContent ?? '',
        );

        assert.ok(panel.includes('Sin título'), 'the panel does not list the section heading');

        const bodyMounted = await page.evaluate(() =>
          Array.from(document.querySelectorAll('aside p')).some((element) =>
            (element.textContent ?? '').includes('Segundo parrafo'),
          ),
        );

        assert.equal(bodyMounted, false, 'the section body was mounted while collapsed');

        await this.clickButton(page, 'Copiar todo el documento');

        const expected = 'Primera linea indentada segunda linea del parrafo\n\nSegundo parrafo';

        await page.waitForFunction(
          (wanted) => navigator.clipboard.readText().then((text) => text === wanted),
          { timeout: 10000 },
          expected,
        );

        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
      },
    );

    await this.check(
      'the side panel lists a heading that only differs from the body by its font',
      async () => {
        await this.upload(page, await this.fixtures.bold());
        await page.waitForFunction(
          () =>
            (
              document.querySelector('aside[aria-label="Secciones detectadas"]')?.textContent ?? ''
            ).includes('Resultados del ejercicio'),
          { timeout: 30000 },
        );

        const panel = await page.$eval(
          'aside[aria-label="Secciones detectadas"]',
          (element) => element.textContent ?? '',
        );

        assert.ok(panel.includes('Resultados del ejercicio'), 'the bold heading is missing');
        assert.ok(panel.includes('Metodologia'), 'the second bold heading is missing');
      },
    );

    await this.check(
      'selecting a section highlights only its heading, not every paragraph',
      async () => {
        await this.upload(page, await this.fixtures.headingParagraphs());
        await page.waitForFunction(
          () =>
            (
              document.querySelector('aside[aria-label="Secciones detectadas"]')?.textContent ?? ''
            ).includes('Seccion uno'),
          { timeout: 30000 },
        );

        await this.clickSectionCard(page, 'Seccion uno');
        await page.waitForFunction(
          () => document.querySelectorAll('.pdf-page span[aria-hidden="true"]').length === 1,
          { timeout: 10000 },
        );

        const boxes = await page.evaluate(
          () => document.querySelectorAll('.pdf-page span[aria-hidden="true"]').length,
        );
        assert.equal(boxes, 1, 'the highlight is not limited to the heading');

        const label = await page.$eval(
          '.pdf-page [role="status"]',
          (element) => element.textContent ?? '',
        );
        assert.ok(label.includes('Seccion uno'), 'the floating label names the selected section');
      },
    );

    await this.check(
      'a rotated page renders sideways-turned and still copies the right text',
      async () => {
        await this.upload(page, await this.fixtures.rotated());
        await page.waitForFunction(() => document.querySelectorAll('.textLayer span').length > 0, {
          timeout: 30000,
        });

        const size = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (!(canvas instanceof HTMLCanvasElement)) {
            return null;
          }
          return { width: canvas.width, height: canvas.height };
        });

        assert.ok(size !== null, 'no canvas found');
        assert.ok(size.width > size.height, 'the page kept its portrait orientation');

        await this.clickText(page, 'parrafo rotado');
        await page.waitForFunction(
          (wanted) => navigator.clipboard.readText().then((text) => text === wanted),
          { timeout: 10000 },
          'parrafo rotado',
        );

        const copied = await page.evaluate(() => navigator.clipboard.readText());
        assert.equal(copied, 'parrafo rotado');
      },
    );

    await this.check('an image-only PDF states that there is no text layer', async () => {
      await this.upload(page, await this.fixtures.empty());
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('h2')).some(
            (element) => element.textContent === 'Este PDF no tiene texto extraíble',
          ),
        { timeout: 30000 },
      );

      const heading = await page.$eval('h2', (element) => element.textContent);
      assert.equal(heading, 'Este PDF no tiene texto extraíble');
    });

    await this.check('an encrypted PDF shows the password message', async () => {
      const encrypted = await this.fixtures.encrypted();

      if (encrypted === null) {
        throw new Error(`qpdf is not installed at ${QPDF}; encrypted path not observed`);
      }

      await this.upload(page, encrypted);
      await page.waitForFunction(
        () => {
          const alert = document.querySelector('[role="alert"]');
          return alert !== null && (alert.textContent ?? '').includes('protegido con contraseña');
        },
        { timeout: 30000 },
      );

      const alert = await page.$eval('[role="alert"]', (element) => element.textContent ?? '');

      assert.ok(alert.includes('protegido con contraseña'));
      assert.ok(alert.includes('No intentamos descifrarlo'));
    });

    if (this.consoleErrors.length > 0) {
      process.stdout.write(
        `INFO console errors during the run: ${this.consoleErrors.join(' | ')}\n`,
      );
    }
  }

  private async check(name: string, run: () => Promise<void>): Promise<void> {
    try {
      await run();
      this.results.push(`PASS ${name}`);
    } catch (error) {
      this.results.push(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async upload(page: Page, path: string): Promise<void> {
    const input = await page.$('input[type=file]');

    assert.ok(input !== null, 'file input not found');
    await input.uploadFile(path);
  }

  private async clickText(page: Page, needle: string): Promise<void> {
    const point = await page.evaluate((text) => {
      const spans = Array.from(document.querySelectorAll('.textLayer span'));
      const span = spans.find((element) => (element.textContent ?? '').includes(text));

      if (span === null || span === undefined) {
        return null;
      }

      span.scrollIntoView({ block: 'center' });
      const rect = span.getBoundingClientRect();

      return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.75 };
    }, needle);

    assert.ok(point !== null, `no text layer span containing "${needle}"`);
    await page.mouse.click(point.x, point.y);
  }

  private async clickSectionCard(page: Page, heading: string): Promise<void> {
    const point = await page.evaluate((text) => {
      const button = Array.from(document.querySelectorAll('button')).find(
        (element) =>
          (element.textContent ?? '').includes(text) && !element.hasAttribute('aria-label'),
      );

      if (button === undefined) {
        return null;
      }

      button.scrollIntoView({ block: 'center' });
      const rect = button.getBoundingClientRect();

      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, heading);

    assert.ok(point !== null, `no section card containing "${heading}"`);
    await page.mouse.click(point.x, point.y);
  }

  private async clickButton(page: Page, label: string): Promise<void> {
    const point = await page.evaluate((text) => {
      const button = Array.from(document.querySelectorAll('button')).find(
        (element) => element.textContent === text,
      );

      if (button === undefined) {
        return null;
      }

      button.scrollIntoView({ block: 'center' });
      const rect = button.getBoundingClientRect();

      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, label);

    assert.ok(point !== null, `no button labelled "${label}"`);
    await page.mouse.click(point.x, point.y);
  }

  private resolveChrome(): string {
    const candidates = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      '/usr/bin/google-chrome-stable',
      '/usr/bin/brave',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ].filter((candidate): candidate is string => typeof candidate === 'string' && candidate !== '');

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    throw new Error('No Chrome/Chromium executable found');
  }
}

await new BrowserVerifier().run();
