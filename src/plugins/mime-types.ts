import type { Plugin } from "vite";

/**
 * Plugin pentru a asigura că fișierele sunt servite cu tipurile MIME corecte
 */
export function mimeTypesPlugin(): Plugin {
  return {
    name: "mime-types-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Verificăm dacă cererea este pentru un fișier JavaScript
        if (
          req.url?.endsWith(".js") ||
          req.url?.endsWith(".mjs") ||
          req.url?.endsWith(".jsx") ||
          req.url?.endsWith(".ts") ||
          req.url?.endsWith(".tsx")
        ) {
          res.setHeader(
            "Content-Type",
            "application/javascript; charset=utf-8"
          );
          res.setHeader("X-Content-Type-Options", "nosniff");
        }
        // Verificăm dacă cererea este pentru un fișier CSS
        else if (req.url?.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        }
        // Verificăm dacă cererea este pentru un fișier SVG
        else if (req.url?.endsWith(".svg")) {
          res.setHeader("Content-Type", "image/svg+xml");
        }
        // Verificăm dacă cererea este pentru un fișier PNG
        else if (req.url?.endsWith(".png")) {
          res.setHeader("Content-Type", "image/png");
        }
        // Verificăm dacă cererea este pentru un fișier JPEG
        else if (req.url?.endsWith(".jpg") || req.url?.endsWith(".jpeg")) {
          res.setHeader("Content-Type", "image/jpeg");
        }
        // Verificăm dacă cererea este pentru un fișier WEBP
        else if (req.url?.endsWith(".webp")) {
          res.setHeader("Content-Type", "image/webp");
        }
        // Verificăm dacă cererea este pentru un fișier WOFF
        else if (req.url?.endsWith(".woff")) {
          res.setHeader("Content-Type", "font/woff");
        }
        // Verificăm dacă cererea este pentru un fișier WOFF2
        else if (req.url?.endsWith(".woff2")) {
          res.setHeader("Content-Type", "font/woff2");
        }

        next();
      });
    },
    transformIndexHtml(html) {
      // Adăugăm un meta tag pentru a specifica tipul de conținut
      return html.replace(
        "<head>",
        `<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`
      );
    },
  };
}
