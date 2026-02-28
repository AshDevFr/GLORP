import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  base: "/GLORP/",
  test: {
    environment: "node",
    setupFiles: ["./src/test-setup.ts"],
  },
});
