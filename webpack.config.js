const Encore = require("@symfony/webpack-encore");
const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer"); // Optional for bundle analysis

if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || "dev");
}

Encore.setOutputPath("public/dist")
  .setPublicPath("/dist")
  .addEntry("app", "./assets/app.js")

  // home
  .addEntry("home/home", "./app/Resources/js/home/home.tsx")
  .addEntry("home/home_style", "./app/Resources/css/home/home.css")

  //account
  .addEntry("account/account_style", "./app/Resources/css/account/account.css")

  .splitEntryChunks() // Split common dependencies for smaller bundles
  .enableSingleRuntimeChunk()
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications()
  .enableSourceMaps(!Encore.isProduction())
  .enableVersioning(Encore.isProduction())
  .configureManifestPlugin(() => false)
  .configureBabelPresetEnv((config) => {
    config.useBuiltIns = "usage";
    config.corejs = "3.38";
  })
  .enableTypeScriptLoader()
  .enableReactPreset()
  .enablePostCssLoader((options) => {
    options.postcssOptions = {
      config: "./postcss.config.js",
    };
  });

// Check the environment and conditionally apply minification
const isProduction = process.env.APP_ENV === "production";

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
  const config = Encore.getWebpackConfig();
  config.plugins.push(new BundleAnalyzerPlugin());
}

const config = Encore.getWebpackConfig();

// Add TypeScript and JSX extensions
config.resolve.extensions = [".tsx", ".ts", ".js", ".jsx"];

// Add alias for `@` to point to the `assets` directory
config.resolve.alias = {
  "@": path.resolve(__dirname, "assets"),
  "css": path.resolve(__dirname, "app/Resources/css"),
};

module.exports = config;
