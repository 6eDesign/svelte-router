import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import browsersync from "rollup-plugin-browsersync";
import buble from "rollup-plugin-buble";

const production = !process.env.ROLLUP_WATCH;

const test = {
  input: "src/app.js",
  output: {
    sourcemap: true,
    format: "es",
    dir: 'docs/module'
  },
  plugins: [
    svelte({
      // opt in to v3 behaviour today
      // skipIntroByDefault: true,
      // nestedTransitions: true,

      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write("docs/app.css");
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),
    buble({ objectAssign: true }),

    !production && browsersync({ 
      server: { 
        baseDir: "docs", 
        routes: { 
          "/svelte-router": "docs"
        }, 
      },
      startPath: '/svelte-router',
    }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ]
};

export default [test];
