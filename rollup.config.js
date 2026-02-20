const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const typescript = require('@rollup/plugin-typescript').default;
const terser = require('@rollup/plugin-terser').default;

const basePlugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: './tsconfig.json' })
];

const baseOutput = {
  name: 'robotcha',
  sourcemap: true
};

const watch = {
  clearScreen: false,
  include: 'src/**',
  exclude: 'node_modules/**',
  chokidar: {
    usePolling: true,
    interval: 200
  }
};

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/robotcha.js', format: 'umd', exports: 'named', ...baseOutput },
      { file: 'dist/robotcha.esm.js', format: 'es', sourcemap: true },
      { file: 'dist/robotcha.cjs.js', format: 'cjs', exports: 'named', sourcemap: true }
    ],
    plugins: basePlugins,
    watch
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/robotcha.min.js', format: 'umd', exports: 'named', ...baseOutput },
    plugins: [...basePlugins, terser()],
    watch
  }
];
