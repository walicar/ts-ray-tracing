import { defineConfig } from "@rsbuild/core";

export default defineConfig({
  html: {
    template: "index.html",
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  }
});
