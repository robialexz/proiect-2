import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { mimeTypesPlugin } from "./src/plugins/mime-types";

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
      "@splinetool/runtime",
      "@splinetool/react-spline",
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
    assetsInlineLimit: 0, // Dezactivăm inlining-ul pentru a asigura că toate fișierele sunt servite corect
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
        format: "es", // Folosim ES modules pentru compatibilitate
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        // Am eliminat manualChunks pentru a evita conflictul cu inlineDynamicImports
      },
      external: [
        // Excludeăm pachetele care cauzează probleme la build
      ],
    },
  },
  plugins: [react(), tempo(), mimeTypesPlugin()],
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
      overlay: false, // Disable error overlay for better performance
    },
    watch: {
      usePolling: false,
      // Reduce file system watching overhead
      ignored: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.git/**",
        "**/reports/**",
      ],
    },
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
