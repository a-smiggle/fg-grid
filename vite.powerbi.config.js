import { defineConfig } from 'vite';
import path from 'path';
import { terser } from 'rollup-plugin-terser';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/css/main.css',
          dest: '../styles',
          rename: 'fg-grid.css'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2015',
    minify: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/js/index.js'),
      output: [{
        // Power BI compatible UMD build
        format: 'umd',
        name: 'FancyGrid',
        entryFileNames: 'fg-grid.powerbi.js',
        dir: 'dist',
        strict: false,
        banner: `/*!
 * FG-Grid Power BI Compatible Version
 * Browser-safe version for Power BI Custom Visuals
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser globals - compatible with Power BI sandbox
    var globalObj = (function() {
      try {
        return globalThis || self || window || global || this || {};
      } catch(e) {
        return {};
      }
    })();
    root = root || globalObj;
    root.FancyGrid = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {`,
        footer: `
  // Return the main exports for Power BI compatibility
  var globalObj = (function() {
    try {
      return globalThis || self || window || global || this || {};
    } catch(e) {
      return {};
    }
  })();
  
  var FancyExport = globalObj.Fancy || Fancy;
  
  return {
    Fancy: FancyExport,
    Grid: FancyExport && FancyExport.Grid
  };
});`,
        globals: {
          window: 'globalThis',
          document: 'globalThis.document'
        }
      }, {
        // Power BI compatible minified UMD build
        format: 'umd',
        name: 'FancyGrid',
        entryFileNames: 'fg-grid.powerbi.min.js',
        dir: 'dist',
        strict: false,
        banner: `/*!
 * FG-Grid Power BI Compatible Version (Minified)
 * Browser-safe version for Power BI Custom Visuals
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    var globalObj = (function() {
      try {
        return globalThis || self || window || global || this || {};
      } catch(e) {
        return {};
      }
    })();
    root = root || globalObj;
    root.FancyGrid = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {`,
        footer: `
  var globalObj = (function() {
    try {
      return globalThis || self || window || global || this || {};
    } catch(e) {
      return {};
    }
  })();
  
  var FancyExport = globalObj.Fancy || Fancy;
  
  return {
    Fancy: FancyExport,
    Grid: FancyExport && FancyExport.Grid
  };
});`,
        globals: {
          window: 'globalThis',
          document: 'globalThis.document'
        },
        plugins: [terser()]
      }]
    }
  }
});
