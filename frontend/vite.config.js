import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// CORS가 5173만 허용하므로 포트를 고정한다.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
