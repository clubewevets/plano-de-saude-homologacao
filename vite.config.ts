import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// Plugin to defer CSS loading (convert render-blocking stylesheet to preload)
function deferCssPlugin(): Plugin {
  return {
    name: "defer-css-plugin",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        // Replace render-blocking stylesheets with preload version
        return html.replace(
          /<link\s+rel="stylesheet"\s+href="([^"]+\.css)"/g,
          (match, href) => {
            return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" /><noscript><link rel="stylesheet" href="${href}" /></noscript>`;
          },
        );
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    minify: "esbuild",
    sourcemap: false,
    reportCompressedSize: false,
    target: "es2020",
    rollupOptions: {
      output: {
        entryFileNames: "[name]-[hash].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash][extname]",
        // Aggressive code splitting to reduce initial bundle
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react"],
        },
      },
      // Tree-shake aggressively
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Optimize minification
    esbuild: {
      minify: true,
    },
  },
  plugins: [react(), deferCssPlugin(), expressPlugin()],
  base: "/plano-de-saude-pet/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
