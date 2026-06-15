import mdx from "@mdx-js/rollup";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    { enforce: "pre", ...mdx() },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
  server: {
    allowedHosts: ["silvergalde.qilin-mintaka.ts.net"],
  },
});
