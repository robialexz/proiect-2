import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { mimeTypesPlugin } from "./src/plugins/mime-types";
import fs from "fs";
import { resolve } from "path";

// Suprimăm avertismentul CommonJS/ES Module
process.env.NODE_NO_WARNINGS = "1";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx"],
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "framer-motion",
      "@tanstack/react-query",
      "zustand",
      "zustand/middleware",
    ],
    esbuildOptions: {
      target: "es2020",
    },
  },
  build: {
    target: "es2020",
    minify: "terser",
    cssMinify: true,
    assetsInlineLimit: 4096, // Optimizat: Inline pentru fișiere mici (4KB)
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development", // Sourcemap doar în dezvoltare
    reportCompressedSize: false, // Dezactivăm pentru build-uri mai rapide
    chunkSizeWarningLimit: 1000, // Creștem limita de avertizare pentru chunk-uri
    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
        format: "es", // Folosim ES modules pentru compatibilitate
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/chunks/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          // Organizăm fișierele în foldere separate în funcție de tip
          const extType = assetInfo.name.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return "assets/images/[name].[hash][extname]";
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return "assets/fonts/[name].[hash][extname]";
          }
          if (/css/i.test(extType)) {
            return "assets/css/[name].[hash][extname]";
          }
          return "assets/[name].[hash][extname]";
        },
        // Optimizăm chunk-urile pentru a reduce numărul de cereri HTTP
        manualChunks: (id) => {
          // Grupăm bibliotecile comune în chunk-uri separate
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("framer-motion")) {
              return "vendor-animations";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }
            if (
              id.includes("lucide-react") ||
              id.includes("tailwind") ||
              id.includes("shadcn")
            ) {
              return "vendor-ui";
            }
            // Restul bibliotecilor în chunk-ul vendor
            return "vendor";
          }
          // Grupăm componentele UI comune
          if (id.includes("/components/ui/")) {
            return "ui-components";
          }
          // Grupăm paginile în funcție de secțiune
          if (id.includes("/pages/")) {
            if (id.includes("/pages/inventory/")) {
              return "page-inventory";
            }
            if (id.includes("/pages/projects/")) {
              return "page-projects";
            }
            if (id.includes("/pages/reports/")) {
              return "page-reports";
            }
            if (id.includes("/pages/settings/")) {
              return "page-settings";
            }
          }
        },
      },
      external: [
        // Excludeăm pachetele care cauzează probleme la build
      ],
    },
  },
  plugins: [
    react(),
    tempo(),
    mimeTypesPlugin(),
    {
      name: "generate-service-worker",
      closeBundle() {
        try {
          // Copiem service worker-ul în directorul de build
          const serviceWorkerPath = resolve(__dirname, "src/service-worker.ts");
          const outputDir = resolve(__dirname, "dist");
          const outputPath = resolve(outputDir, "service-worker.js");

          // Verificăm dacă directorul dist există
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          if (fs.existsSync(serviceWorkerPath)) {
            const content = fs.readFileSync(serviceWorkerPath, "utf-8");
            // Transpunem TypeScript în JavaScript
            const jsContent = content
              .replace(/: any/g, "")
              .replace(/export \{\};/g, "");

            fs.writeFileSync(outputPath, jsContent);
            console.log("Service worker generat cu succes!");
          } else {
            console.warn(
              "Nu s-a găsit fișierul service-worker.ts, se creează unul gol"
            );
            // Creăm un service worker gol pentru a evita eroarea
            fs.writeFileSync(outputPath, "// Service worker gol");
          }
        } catch (error) {
          console.error("Eroare la generarea service worker-ului:", error);
        }
      },
    },
  ],
  // Opțiuni pentru commonjs
  commonjsOptions: {
    include: [/node_modules/],
    transformMixedEsModules: true,
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
    hmr: {
      overlay: false, // Dezactivăm overlay-ul de erori pentru performanță mai bună
    },
    watch: {
      usePolling: false,
      // Reducem overhead-ul de monitorizare a sistemului de fișiere
      ignored: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.git/**",
        "**/reports/**",
        "**/coverage/**",
        "**/.vscode/**",
      ],
    },
    // Optimizăm serverul de dezvoltare
    fs: {
      strict: true, // Creștem securitatea
    },
    // Creștem performanța serverului
    middlewareMode: false,
  },
  // Disable constant dependency pre-bundling
  cacheDir: ".vite",
  // Disable constant file analysis
  esbuild: {
    logOverride: {
      "this-is-undefined-in-esm": "silent",
    },
  },
});
