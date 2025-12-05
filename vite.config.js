// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".", // normalmente não é necessário mudar
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "./index.html",
    },
  },
  server: {
    host: true,
    port: 3000,
    // desactiva a overlay HMR (o painel grande do Vite com erros)
    hmr: {
      overlay: false,
    },
  },
});
