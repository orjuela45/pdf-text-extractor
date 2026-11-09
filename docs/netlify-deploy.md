# Desplegar en Netlify con tu dominio propio

Esta app es un sitio estático: `pnpm build` genera `dist/` y eso es todo lo que hay que
publicar. No necesita backend, ni funciones, ni base de datos, ni variables de entorno.

Tu portfolio ya vive en un sitio Netlify. **Este va a ser un sitio Netlify nuevo**, y lo
publicamos como **subdominio** de tu dominio, así que no toca nada del portfolio.

---

## Paso 1 — Crear el sitio en Netlify

1. Entrá a https://app.netlify.com y hacé clic en **Add new site** → **Import an existing project**.
2. Elegí **GitHub** y autorizá si te lo pide. Es la cuenta `orjuela45`.
3. Seleccioná el repositorio **`pdf-text-extractor`**.
4. En la rama: elegí la rama que querés publicar.
   - Si querés publicar ya, elegí **`feat/pdf-text-extractor`**, que es donde está todo el trabajo.
   - Si preferís que primero pase por `main`, tenés que mergear la rama a `main` vos mismo
     (yo no hago merges) y elegir `main` acá.
5. Configuración de build — debería detectarla sola, pero verificá que diga:

   | Campo             | Valor        |
   | ----------------- | ------------ |
   | Build command     | `pnpm build` |
   | Publish directory | `dist`       |

   Si Netlify no detecta pnpm solo, agregá una variable de entorno `NODE_VERSION` con el valor
   `26` en **Site configuration → Environment variables**. El `netlify.toml` ya la declara.

6. **Deploy site**. El primer build tarda uno o dos minutos.

Cuando termina te da una URL tipo `https://algo-random.netlify.app`. **Abrila y probala ahí
primero**, antes de tocar el dominio.

## Paso 2 — Probar que funciona de verdad

En la URL de Netlify, sobre un PDF tuyo:

1. Que cargue y se vea la primera página.
2. Que al hacer clic sobre un párrafo te diga que lo copió.
3. Que al pegarlo en un editor de texto las palabras estén **separadas**.
4. Que el panel lateral liste secciones y que "copiar todo" funcione.
5. Que un PDF escaneado (solo imágenes) te avise que no tiene texto.

Si algo falla acá, no sigas con el dominio todavía: avisame con lo que viste.

## Paso 3 — Ponerle tu dominio

Elegí un subdominio libre, por ejemplo `pdf.tudominio.com`. Va a ser **independiente** del
portfolio: mismo dominio raíz, sitio distinto.

1. En el sitio nuevo: **Domain management** → **Add a domain**.
2. Escribí el subdominio completo, por ejemplo `pdf.tudominio.com`, y confirmá.
3. Netlify te va a ofrecer dos caminos:

   **Si tu dominio usa los nameservers de Netlify** (es lo más probable, porque el portfolio
   ya está ahí), Netlify crea el registro solo. No tenés que hacer nada más que esperar la
   propagación, que suele ser de minutos.

   **Si el DNS lo manejás en otro proveedor**, elegí la opción de DNS manual y creá en tu
   proveedor:

   | Tipo    | Nombre | Valor                                                            |
   | ------- | ------ | ---------------------------------------------------------------- |
   | `CNAME` | `pdf`  | el valor que Netlify te muestre, algo como `<sitio>.netlify.app` |

   El nombre es solo la parte delante del dominio: si querés `pdf.tudominio.com`, el nombre
   del registro es `pdf`.

4. **No toques los registros del dominio raíz ni el registro del portfolio.** Si algo de esto
   te genera dudas, pará y preguntame antes de guardar: un error acá puede tumbar el portfolio.

5. Netlify emite el certificado HTTPS automáticamente. Esperá a que el candado aparezca y
   verificá que https://pdf.tudominio.com cargue.

## Paso 4 — Verificar el despliegue de verdad

Ya con el dominio andando, repetí las cinco pruebas del Paso 2 **en el dominio propio**. El
`https` importa: el portapapeles del navegador solo funciona en contexto seguro, así que en
`http://` la app cae a su respaldo (un cuadro de texto seleccionable) en lugar de copiar
directo.

---

## Alternativa: publicarlo en `/tools` de tu dominio (subpath)

Si en vez de un subdominio lo querés en `tudominio.com/tools`, el sitio del extractor sigue
siendo un sitio Netlify aparte, pero el portfolio lo **proxea**. Netlify no monta un sitio en
un subpath por sí solo: se hace con un rewrite `200`.

1. En el sitio del extractor, seteá la variable de entorno `VITE_BASE=./`
   (Site configuration → Environment variables) y volvé a desplegar. Con base **relativa** los
   assets se resuelven al lado del HTML, así que el **mismo build** anda tanto en la URL propia
   del sitio como proxeado en `/tools/`. Sin esto los assets se piden en `/assets/...` y los
   termina sirviendo el portfolio, no la app.
2. En el `netlify.toml` del **portfolio**, agregá estas dos reglas **antes** del catch-all del
   SPA:

   ```toml
   [[redirects]]
     from = "/tools"
     to = "/tools/"
     status = 301

   [[redirects]]
     from = "/tools/*"
     to = "https://<sitio-del-extractor>.netlify.app/:splat"
     status = 200
   ```

   Si tu portfolio usa un archivo `_redirects`, las mismas dos líneas van ahí, en ese orden:

   ```
   /tools    /tools/   301
   /tools/*  https://<sitio-del-extractor>.netlify.app/:splat  200
   ```

3. **Cabeceras de seguridad.** El portfolio aplica sus propias `[[headers]]` al subpath. Si ya
   tenés una CSP en el portfolio, agregá para `/tools/*` las mismas cabeceras que este repo
   define para `/*`, o vas a ver errores de `Content-Security-Policy` en la consola.
4. Probá `https://tudominio.com/tools`: tiene que redirigir a `/tools/` y cargar la app.

El **subdominio** (`pdf.tudominio.com`) no necesita nada de esto: es el camino simple y el
que deja las cabeceras intactas.

---

## Lo que ya está configurado y no tenés que tocar

`netlify.toml` en el repo define:

- el comando de build y el directorio de publicación;
- un redirect de SPA hacia `index.html`;
- las cabeceras de seguridad, incluida una **Content Security Policy**;
- caché larga para `/assets/*` (los archivos llevan hash) y sin caché para `index.html`.

**Sobre la CSP, con honestidad:** está espejada también en la configuración de `preview`, así
que el chequeo con navegador real (`pnpm test:browser`) la ejercita y pasa con ella puesta. Eso
verifica que no rompe la app **en local**. El despliegue real en Netlify es la última
verificación, y es justo el tipo de cosa que conviene mirar con la consola del navegador
abierta: si ves errores de CSP, avisame con el mensaje exacto y lo ajusto.

## Si algo sale mal

- **El build falla en Netlify pero anda en tu máquina**: casi siempre es la versión de Node.
  Fijate que `NODE_VERSION=26` esté en las variables de entorno del sitio.
- **El dominio queda en "Awaiting external DNS"**: la propagación puede tardar hasta un par
  de horas. No borres ni recrees el registro mientras espera.
- **Cargaste un PDF y no pasó nada**: mirá la consola del navegador y avisame el error.

---

## Corrección: sobre la CSP y lo que está verificado

Una versión anterior de esta guía decía que `pnpm test:browser` ejercitaba la CSP, porque las
cabeceras están espejadas en la configuración de `preview` de Vite. **Eso era falso y lo corrijo
acá.** El script de navegador levanta su propio servidor estático, que solo define `content-type`,
así que las cabeceras de seguridad **no se aplican** y el chequeo no las prueba. La verificación
independiente lo comprobó: la respuesta no traía CSP ni `X-Frame-Options`.

Qué significa para vos, en concreto:

- El `netlify.toml` define las cabeceras y `pnpm build` funciona, pero **nadie las ejerció
  todavía**. La primera vez que se apliquen de verdad va a ser en el despliegue.
- Por eso, cuando despliegues, **abrí la consola del navegador antes de dar por bueno el sitio**.
  Si ves errores de `Content-Security-Policy`, pegame el mensaje exacto y lo ajusto.
- `pnpm preview` a mano sí las aplica; el script de test, no.

Lo dejo anotado como lo que es: una parte de la entrega **sin verificar**, no una parte verificada.
