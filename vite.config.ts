import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

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
    ],
    esbuildOptions: {
      target: "es2020",
    },
  },
  build: {
    target: "es2020",
    minify: "terser",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
        },
      },
      external: [],
    },
  },
  plugins: [react(), tempo()],
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
