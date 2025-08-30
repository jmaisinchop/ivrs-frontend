import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // Carga las variables de entorno del archivo .env
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        // Redirige las peticiones /api al backend
        '/api': {
          target: env.VITE_API_URL, // <-- Usa la variable de entorno
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''), // Quita /api de la ruta final
        },
      },
    },
  });
};