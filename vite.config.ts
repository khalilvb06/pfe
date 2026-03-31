import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/qdrant': {
        target: 'https://6aa25697-b7f9-4908-8bb1-ca2d4eaee2d9.europe-west3-0.gcp.cloud.qdrant.io:6333',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/qdrant/, '')
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.png", "robots.txt"],
      manifest: {
        name: "القسطاس - مساعدك القانوني",
        short_name: "القسطاس",
        description: "مساعد ذكي متخصص في القانون الجزائري",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        dir: "rtl",
        lang: "ar",
        icons: [
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));