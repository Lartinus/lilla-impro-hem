
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Simplified chunking for better CDN caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Essential chunks only
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@tanstack/react-query', 'lucide-react', 'clsx', 'tailwind-merge'],
          'supabase': ['@supabase/supabase-js'],
        },
        // CDN-friendly file naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500,
    target: 'es2020',
    cssCodeSplit: false, // Bundle CSS for better caching
    sourcemap: true, // Enable sourcemaps for better debugging and SEO audits
  },
  
  // Minimal dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@stripe/stripe-js', 'recharts', 'embla-carousel-react']
  },
  
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
