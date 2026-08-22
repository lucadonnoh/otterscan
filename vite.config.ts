import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import viteCompression from "vite-plugin-compression";

const cspSafeBmtSource = fileURLToPath(
  new URL(
    "./node_modules/@fairdatasociety/bmt-js/src/index.ts",
    import.meta.url,
  ),
);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // The package's published bundle uses webpack's eval-source-map output,
    // which cannot run under a CSP that omits unsafe-eval. Bundle its source
    // instead; Sourcify only uses it to calculate Swarm metadata hashes.
    alias: {
      "@fairdatasociety/bmt-js": cspSafeBmtSource,
    },
  },
  plugins: [
    react(),
    viteCompression(),
    viteCompression({ algorithm: "brotliCompress" }),
    imagetools(),
    tailwindcss(),
  ],
});
