import { defineConfig } from 'vite';
import path from 'path';
import { terser } from 'rollup-plugin-terser';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';

function checkLogsAndDebuggers() {
  return {
    name: 'check-logs-debuggers',
    generateBundle(_, bundle) {
      for (const fileName of Object.keys(bundle)) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk') {
          if (/console\.log\s*\(/.test(chunk.code) || /\bdebugger\b/.test(chunk.code)) {
            throw new Error(`🚫 Found console.log or debugger in: ${fileName}`);
          }
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [
    checkLogsAndDebuggers(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/css/main.css',
          dest: '../styles',
          rename: 'fg-grid.css'
        }
      ]
    }),
    {
      name: 'simple-css-minify',
      closeBundle() {
        const cssPath = 'src/css/main.css';
        const distDir = 'styles';
        const outputPath = path.join(distDir, 'fg-grid.min.css');

        // Create the output directory if it doesn't exist
        fs.mkdirSync(distDir, { recursive: true });

        // Read the original CSS file
        const css = fs.readFileSync(cssPath, 'utf-8');

        // Perform simple CSS minification:
        // - remove comments
        // - remove unnecessary whitespace, tabs, and newlines
        // - tighten up spacing around { } : ;
        const minified = css
          .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* comments */
          .replace(/\s{2,}/g, ' ')         // collapse multiple spaces into one
          .replace(/\n/g, '')              // remove all line breaks
          .replace(/\s*{\s*/g, '{')        // remove space around {
          .replace(/\s*}\s*/g, '}')        // remove space around }
          .replace(/\s*;\s*/g, ';')        // remove space around ;
          .replace(/\s*:\s*/g, ':')        // remove space around :
          .trim();                         // remove leading/trailing spaces

        // Write the minified CSS to the output file
        fs.writeFileSync(outputPath, minified);

        console.log('✅ Simple CSS minified to ' + outputPath);
      }
    }
  ],
  build: {
    outDir: 'dist',
    target: 'es2015',
    minify: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/js/index.js'),
      output: [{
        format: 'cjs',
        name: 'Fancy',
        entryFileNames: 'fg-grid.cjs.js',
        dir: 'dist',
        strict: false,
        banner: ``,
        footer: `
module.exports = {
  Fancy: (function() {
    try {
      return (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
        (typeof window !== 'undefined' ? window.Fancy : 
          (typeof global !== 'undefined' ? global.Fancy : undefined)));
    } catch(e) {
      return undefined;
    }
  })(),
  Grid: (function() {
    try {
      var FancyRef = (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
        (typeof window !== 'undefined' ? window.Fancy : 
          (typeof global !== 'undefined' ? global.Fancy : undefined)));
      return FancyRef ? FancyRef.Grid : undefined;
    } catch(e) {
      return undefined;
    }
  })()
};`
      },{
        format: 'cjs',
        name: 'Fancy',
        entryFileNames: 'fg-grid.cjs.min.js',
        dir: 'dist',
        strict: false,
        banner: ``,
        footer: `
module.exports = {
  Fancy: (function() {
    try {
      return (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
        (typeof window !== 'undefined' ? window.Fancy : 
          (typeof global !== 'undefined' ? global.Fancy : undefined)));
    } catch(e) {
      return undefined;
    }
  })(),
  Grid: (function() {
    try {
      var FancyRef = (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
        (typeof window !== 'undefined' ? window.Fancy : 
          (typeof global !== 'undefined' ? global.Fancy : undefined)));
      return FancyRef ? FancyRef.Grid : undefined;
    } catch(e) {
      return undefined;
    }
  })()
};`,
        plugins: [terser()]
      }, {
        format: 'es',
        name: 'Fancy',
        entryFileNames: 'fg-grid.esm.js',
        dir: 'dist',
        strict: false,
        banner: ``,
        footer: `
const FancyExport = (function() {
  try {
    return (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
      (typeof window !== 'undefined' ? window.Fancy : 
        (typeof global !== 'undefined' ? global.Fancy : 
          (typeof self !== 'undefined' ? self.Fancy : undefined))));
  } catch(e) {
    return undefined;
  }
})();

const GridExport = FancyExport ? FancyExport.Grid : undefined;

export {
  FancyExport as Fancy,
  GridExport as Grid
}`,
      },{
        format: 'es',
        name: 'Fancy',
        entryFileNames: 'fg-grid.esm.min.js',
        dir: 'dist',
        strict: false,
        banner: ``,
        footer: `
const FancyExport = (function() {
  try {
    return (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
      (typeof window !== 'undefined' ? window.Fancy : 
        (typeof global !== 'undefined' ? global.Fancy : 
          (typeof self !== 'undefined' ? self.Fancy : undefined))));
  } catch(e) {
    return undefined;
  }
})();

const GridExport = FancyExport ? FancyExport.Grid : undefined;

export {
  FancyExport as Fancy,
  GridExport as Grid
}`,
        plugins: [terser()]
      },{
        format: 'umd',
        name: 'Fancy',
        entryFileNames: 'fg-grid.js',
        dir: 'dist',
        strict: false,
        banner: `(function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof exports === 'object') {
    // CommonJS-like environments
    exports["Fancy"] = factory();
  } else {
    // Browser globals (root is window)
    var globalObj = (function() {
      try {
        return globalThis || self || window || global || this || {};
      } catch(e) {
        return {};
      }
    })();
    root = root || globalObj;
    root["Fancy"] = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {`,
        footer: `
  return (function() {
    try {
      return (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
        (typeof window !== 'undefined' ? window.Fancy : 
          (typeof global !== 'undefined' ? global.Fancy : 
            (typeof self !== 'undefined' ? self.Fancy : Fancy))));
    } catch(e) {
      return Fancy;
    }
  })();
});`,
        globals: {
          window: 'globalThis'
        }
      },{
        format: 'umd',
        name: 'Fancy',
        entryFileNames: 'fg-grid.min.js',
        dir: 'dist',
        strict: false,
        banner: `(function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    exports["Fancy"] = factory();
  } else {
    var globalObj = (function() {
      try {
        return globalThis || self || window || global || this || {};
      } catch(e) {
        return {};
      }
    })();
    root = root || globalObj;
    root["Fancy"] = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {`,
        footer: `
  return (function() {
    try {
      return (typeof globalThis !== 'undefined' ? globalThis.Fancy : 
        (typeof window !== 'undefined' ? window.Fancy : 
          (typeof global !== 'undefined' ? global.Fancy : 
            (typeof self !== 'undefined' ? self.Fancy : Fancy))));
    } catch(e) {
      return Fancy;
    }
  })();
});`,
        globals: {
          window: 'globalThis'
        },
        plugins: [terser()]
      }]
    }
  }
});

