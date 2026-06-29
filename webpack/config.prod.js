const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const fs = require("fs");

const line = "---------------------------------------------------------";
const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
process.stdout.write(`${line}\n${msg}\n${line}\n`);

// Build version: auto-incremented by the `prebuild` hook (scripts/bump-version.cjs) into version.json,
// then injected below as __VERSION__ so the bundle shows the freshly-bumped number.
let VERSION = 'v0.0.0';
try { VERSION = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'version.json'), 'utf8')).version || VERSION; } catch (e) {}

module.exports = (env = {}) => ({
    mode: "production",
    entry: "./src/main.ts",
    output: {
        // Release builds (`npm run build:prod`, --env release) emit to dist_final/ (gitignored) so the
        // watch/upload pipeline — which uploads dist/ to the gamestest test server — never ships them.
        path: path.resolve(process.cwd(), env.release ? 'dist_final' : 'dist'),
        filename: "./bundle.min.js"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    devtool: false,
    performance: {
        maxEntrypointSize: 2500000,
        maxAssetSize: 1200000
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "ts-loader"

            },
            {
                test: [/\.vert$/, /\.frag$/],
                use: "raw-loader"
            },
            {
                test: /\.(gif|png|jpe?g|svg|xml|glsl)$/i,
                use: "file-loader"
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                }
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            "typeof CANVAS_RENDERER": JSON.stringify(true),
            "typeof WEBGL_RENDERER": JSON.stringify(true),
            "typeof WEBGL_DEBUG": JSON.stringify(false),
            "typeof EXPERIMENTAL": JSON.stringify(false),
            "typeof PLUGIN_3D": JSON.stringify(false),
            "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
            "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
            "typeof FEATURE_SOUND": JSON.stringify(true),
            // True for dev/test builds, false for the production RELEASE bundle (`npm run build:prod` passes
            // `--env release`). The everyday `build` (which `watch` runs) leaves it ON so the gamestest upload
            // keeps the version tag + cheats for testing. Gates all dev-only features; terser DCEs them when false.
            "__DEV_BUILD__": JSON.stringify(!env.release),
            "__VERSION__": JSON.stringify(VERSION)
        }),
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public/assets', to: 'assets' },
                { from: 'public/favicon.png', to: 'favicon.png' },
                { from: 'public/style.css', to: 'style.css' },
                { from: 'public/language-spider.xml', to: 'language-spider.xml' }
            ],
        }),
    ]
});
