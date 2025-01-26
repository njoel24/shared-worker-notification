import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        main: resolve(__dirname, 'src/index.ts'), // Main entry point
      },
      output: {
        dir: 'dist',           // Output directory
        format: 'es',          // Use ES module format
        preserveModules: true, // Preserve the module structure
        preserveModulesRoot: 'src', // Keep paths relative to the `src` folder
        systemNullSetters: false,
        entryFileNames: '[name].js', // Output file naming
      },
    },
    outDir: 'dist',             // Output directory for the build
    target: 'es2020',           // Target ES2020
  },
  worker: {
    format: 'es', // Use ES module format for workers
    rollupOptions: {
      output: {
        preserveModules: true, // Preserve the module structure
        preserveModulesRoot: 'src', // Keep paths relative to the `src` folder
        entryFileNames: '[name].js', // Keep worker files separate
        systemNullSetters: false,
        dir: 'dist/workers',         // Place workers in a subfolder
      },
    },
  },
});
