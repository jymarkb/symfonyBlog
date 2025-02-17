const Encore = require('@symfony/webpack-encore');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer'); // Optional for bundle analysis

if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore.setOutputPath('public/dist')
  .setPublicPath('/dist')
  .addEntry('app', './assets/app.js')

  // Home
  .addEntry('home/home', './app/Resources/js/home/home.tsx')
  .addEntry('home/home_style', './app/Resources/css/home/home.css')

  // Account
  // .addEntry('account/account', './app/Resources/js/account/account.tsx')
  .addEntry('account/account_style', './app/Resources/css/account/account.css')

  .splitEntryChunks() // Split common dependencies for smaller bundles
  .enableSingleRuntimeChunk()
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications()
  .enableSourceMaps(!Encore.isProduction())
  .enableVersioning(Encore.isProduction())
  .configureManifestPlugin(() => false)
  .configureBabelPresetEnv((config) => {
    config.useBuiltIns = 'usage';
    config.corejs = '3.38';
  })
  .enableTypeScriptLoader()
  .enableReactPreset()
  .enablePostCssLoader((options) => {
    options.postcssOptions = {
      config: './postcss.config.js',
    };
  });

// Check the environment and conditionally apply minification
const isProduction = process.env.APP_ENV === 'production';

if (isProduction) {
  // Enable TerserPlugin for minification
  Encore.configureTerserPlugin((options) => {
    options.terserOptions = {
      compress: {
        drop_console: true, // Removes console logs
        drop_debugger: true, // Removes debugger statements
      },
      mangle: true, // Minify variable and function names
    };
  });
}

// Optional: Add bundle analysis
if (isProduction) {
  const prodConfig = Encore.getWebpackConfig();
  prodConfig.plugins.push(new BundleAnalyzerPlugin());
}

// Get the generated Webpack configuration
const config = Encore.getWebpackConfig();

// Add TypeScript and JSX extensions
config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx'];

// Enhanced alias configuration
config.resolve.alias = {
  '@': path.resolve(__dirname, 'assets'),
  css: path.resolve(__dirname, 'app/Resources/css'),
  js: path.resolve(__dirname, 'app/Resources/js'),
  '~': path.resolve(__dirname, 'node_modules'), // Alias for node_modules
};

// Improve module resolution
config.resolve.modules = [
  path.resolve(__dirname, 'node_modules'),
  'node_modules',
];

// Custom stats for cleaner output
config.stats = {
  assets: true,
  modules: false,
  entrypoints: false,
  colors: true,
  children: false,
  version: false,
  builtAt: false,
  timings: false,
};

module.exports = config;
