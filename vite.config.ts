
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
    // Advanced bundle optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
          
          // UI library chunks
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          'ui-components': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
          ],
          
          // Feature-specific chunks
          'charts': ['recharts'],
          'carousel': ['embla-carousel-react'],
          'stripe': ['@stripe/stripe-js'],
          'icons': ['lucide-react'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'dates': ['date-fns', 'react-day-picker'],
          
          // Database and auth
          'supabase': ['@supabase/supabase-js'],
          
          // Utilities
          'utils': [
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'cmdk',
            'sonner',
            'vaul',
            'input-otp',
            'marked',
            'dompurify'
          ],
        },
      },
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 600,
    
    // Enable modern browser optimizations
    target: 'es2020',
    
    // Minimize CSS
    cssCodeSplit: true,
    
    // Source maps for production debugging
    sourcemap: mode === 'production' ? false : true,
  },
  
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      '@stripe/stripe-js', // Load dynamically
      'recharts', // Lazy loaded
      'embla-carousel-react' // Lazy loaded
    ]
  },
  
  // Performance optimizations
  esbuild: {
    // Drop console and debugger in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
