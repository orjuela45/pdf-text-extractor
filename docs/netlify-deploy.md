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
