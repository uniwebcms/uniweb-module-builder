const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { URL } = require('url');
const postpresetenv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
// const chalk = require('chalk');
const CompressionPlugin = require('compression-webpack-plugin');
// const AssetsPlugin = require('assets-webpack-plugin');
const YamlSchemaPlugin = require('./yamlSchemaPlugin');
const ManifestGeneratorPlugin = require('./manifestGeneratorPlugin');
const CleanAndLogPlugin = require('./cleanAndLogPlugin');
const generateExports = require('./generateExports');
const { ModuleFederationPlugin } = webpack.container;

function validUrl(url) {
    if (!url) return '';

    try {
        url = new URL(url);
    } catch (error) {
        console.log(`Invalid URL '${url}'`);
        console.log(error);
        return false;
    }

    const href = `${url.protocol}//${url.hostname}${url.pathname}`;

    return href.endsWith('/') ? href.slice(0, -1) : href;
}

function findTailwindConfigFiles(rootDir) {
    const configFiles = fs.readdirSync(rootDir);

    const tailwindConfigPaths = configFiles
        .filter((file) => /^tailwind(?:\.(.+))?\.config\.js$/.test(file))
        .map((file) => {
            const match = file.match(/^tailwind(?:\.(.+))?\.config\.js$/);
            return match ? { path: path.resolve(rootDir, file), kind: match[1] || '' } : null;
        })
        .filter(Boolean);

    return tailwindConfigPaths;
}

function getWebpackPlugins(props) {
    const { federateModuleName, exposes, publicUrl, uuid, mode, moduleName, outputPath } = props;

    const plugins = [
        new ModuleFederationPlugin({
            name: federateModuleName,
            filename: 'remoteEntry.js',
            exposes, //  For Module Federation Plugin to expose modules
            shared: {
                react: { singleton: true, requiredVersion: '^18.2.0' },
                'react-dom': {
                    singleton: true,
                    requiredVersion: '^18.2.0',
                },
                'react-router-dom': {
                    singleton: true,
                    requiredVersion: '^6.4.2',
                },
            },
        }),
        new YamlSchemaPlugin({
            srcDir: '../src/' + moduleName,
            output: 'schema.json',
        }),
        new CleanAndLogPlugin({
            outputPath,
            publicUrl,
            currentBuildUuid: uuid, // Make sure this is set in your build process
            keepBuilds: 2, // Adjust this number as needed
        }),
        // Prod-mode needs manifest / Dev-mode needs compression
        mode !== 'development'
            ? new ManifestGeneratorPlugin({ srcDir: '../src/' + moduleName })
            : new CompressionPlugin({
                  filename: '[path][base].gzip',
                  algorithm: 'gzip',
                  test: /\.(js|css|html|svg)$/,
                  threshold: 10240,
                  minRatio: 0.8,
                  deleteOriginalAssets: false,
              }),
    ];

    return plugins;
}

function getTailwindCssLoader(tailwindPath) {
    return {
        loader: 'postcss-loader',
        options: {
            postcssOptions: {
                plugins: [
                    postpresetenv,
                    require('@tailwindcss/nesting'),
                    autoprefixer,
                    require('tailwindcss')(require(tailwindPath)),
                ],
            },
        },
    };
}

function constructWebpackConfig(props) {
    const {
        mode,
        rootDir,
        outputPath,
        publicPath,
        DEV_SERVER_PORT,
        tailwindCssLoader,
        plugins,
        moduleName,
    } = props;

    return {
        mode,
        entry: path.resolve(rootDir, `../src/${moduleName}/index.js`), //path.resolve(rootDir, 'entry.js'),
        resolve: {
            extensions: ['.jsx', '.js', '.json'],
            // alias: {
            //     '@': path.resolve(rootDir, '../src'),
            //     // './dynamicExports': path.resolve(rootDir, '../dist', 'dynamicExports.js'),
            // },
        },
        output: {
            filename: 'main.[contenthash].js',
            path: outputPath,
            clean: true,
            publicPath,
        },
        devServer: {
            port: DEV_SERVER_PORT,
        },
        module: {
            rules: [
                {
                    test: /\.(jsx|js)$/, // Supports both .js and .jsx files (use /\.js$/ for just .js)
                    exclude: /(node_modules|bower_components)/, // Excludes dependencies from transpilation
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env', // Handles modern JavaScript features
                                ['@babel/preset-react', { runtime: 'automatic' }], // Enables automatic JSX transform
                            ],
                        },
                    },
                },
                {
                    test: /\.(css)$/i,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                // Run `postcss-loader` on each CSS `@import`, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
                                // If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
                                importLoaders: 1,
                                // Automatically enable css modules for files satisfying `/\.module\.\w+$/i` RegExp.
                                modules: { auto: true },
                            },
                        },
                        tailwindCssLoader,
                    ].filter(Boolean),
                },
                {
                    test: /\.((sa|sc)ss)$/i,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                // Run `postcss-loader` on each CSS `@import`, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
                                // If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
                                importLoaders: 1,
                                // Automatically enable css modules for files satisfying `/\.module\.\w+$/i` RegExp.
                                modules: { auto: true },
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                // Prefer `dart-sass`
                                // eslint-disable-next-line global-require
                                implementation: require('sass'),
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/,
                    use: [
                        {
                            loader: '@svgr/webpack',
                            options: {
                                svgoConfig: {
                                    plugins: [
                                        {
                                            removeViewBox: false,
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|webp)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                        },
                    ],
                },
                {
                    test: /\.mdx?$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {},
                        },
                        {
                            loader: '@mdx-js/loader',
                            options: {},
                        },
                    ],
                },
                {
                    test: /\.(txt|csl)$/i,
                    use: 'raw-loader',
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins,
        watchOptions: {
            ignored: ['**/node_modules', '**/dist', '**/build_dev'],
        },
        stats: 'minimal', // https://webpack.js.org/configuration/stats/
    };
}

function buildWebpackConfig(env, argv, rootDir) {
    let uuid = uuidv4();

    let {
        PUBLIC_URL,
        TUNNEL_URL,
        npm_lifecycle_event,
        CF_PAGES_URL,
        CF_PAGES_BRANCH,
        GH_PAGES_URL,
        REMOTE_TYPE,
        TARGET_MODULE,
        DEV_SERVER_PORT,
    } = env;

    PUBLIC_URL = validUrl(PUBLIC_URL);
    CF_PAGES_URL = validUrl(CF_PAGES_URL);
    TUNNEL_URL = validUrl(TUNNEL_URL);
    GH_PAGES_URL = validUrl(GH_PAGES_URL);

    let mode = argv.mode;
    let module = TARGET_MODULE;
    let federateModuleName = REMOTE_TYPE || 'WebsiteRemote';

    const isTunnel = !!argv.env.tunnel;
    const isLocal = !!argv.env.local;

    const buildDevDir = path.resolve(rootDir, '../build_dev');
    const buildProdDir = path.resolve(rootDir, '../dist');

    let prodPublicPath;
    let devPublicPath;
    let dest;
    let tailwindCssLoader;

    if (!mode) console.log('Build mode not specified in script!');

    if (CF_PAGES_URL) {
        console.log('Received public URL from Cloudflare:', CF_PAGES_URL);

        if (!mode && CF_PAGES_BRANCH) {
            if (CF_PAGES_BRANCH === 'main' || CF_PAGES_BRANCH === 'master') {
                mode = 'production';
            } else mode = 'development';

            console.log('Set build mode:', mode, 'based on branch:', CF_PAGES_BRANCH);
        }
    }

    if (GH_PAGES_URL) {
        console.log('Received public URL from GitHub Pages:', GH_PAGES_URL);

        if (!mode) {
            mode = 'production';

            console.log('Set build mode:', mode);
        }
    }

    if (!mode) {
        console.log('No build mode specified, build with production mode');

        mode = 'production';
    }

    if (mode === 'production' && !CF_PAGES_URL && !PUBLIC_URL && !GH_PAGES_URL) {
        throw new Error('No public url received under production mode');
    }

    if (isTunnel && !TUNNEL_URL) {
        TUNNEL_URL = fs.readFileSync(`${buildDevDir}/quick-tunnel.txt`, 'utf-8');

        if (!TUNNEL_URL) throw new Error('Missing tunnel URL');
    }

    const FINAL_PUBLIC_URL = CF_PAGES_URL || GH_PAGES_URL || PUBLIC_URL;

    switch (npm_lifecycle_event) {
        case 'build':
            if (mode === 'development') {
                if (CF_PAGES_URL) {
                    devPublicPath = `${CF_PAGES_URL}/${module}/${uuid}/`;
                }
            } else {
                prodPublicPath = `${FINAL_PUBLIC_URL}/${module}/${uuid}/`;
            }
            dest = path.resolve(rootDir, '../dist', module);
            break;
        case 'build:dev':
            if (CF_PAGES_URL) {
                devPublicPath = `${CF_PAGES_URL}/${module}/${uuid}/`;
            } else {
                throw new Error(
                    'build:dev should not be used under a non-Cloudflare environment, please use watch:local instead'
                );
            }
            dest = path.resolve(rootDir, '../dist', module);
            break;
        case 'watch:tunnel':
            devPublicPath = `${TUNNEL_URL}/${module}/${uuid}/`;
            dest = path.resolve(buildDevDir, module);
            break;
        case 'watch:local':
            devPublicPath = `http://localhost:${DEV_SERVER_PORT}/${module}/${uuid}/`;
            dest = path.resolve(buildDevDir, module);
            break;
        case 'build:prod':
            prodPublicPath = `${FINAL_PUBLIC_URL}/${module}/${uuid}/`;
            dest = path.resolve(buildProdDir, module);
            break;
        case 'build:prod-commit':
            prodPublicPath = `${PUBLIC_URL}/${module}/${uuid}/`;
            dest = path.resolve(buildProdDir, module);
            break;
        case 'build:prod-copy':
        case 'build:prod-copy-commit':
            prodPublicPath = `${PUBLIC_URL}/${module}/${uuid}/`;
            dest = path.resolve(buildDevDir, module);
            break;
    }

    const exposes = {};

    // get module that need build and deploy
    const moduleExists = fs.readdirSync(path.resolve(rootDir, '../src')).find((m) => m === module);

    if (!moduleExists) {
        throw new Error(`Module: ${module} not exist!`);
    }

    // Generate dynamic exports for the current module
    generateExports(path.resolve(rootDir, `../src`), module);

    // // write dynamic entry.js
    // const entryFile = path.resolve(rootDir, `entry.js`);
    // const entryContent = `import("../src/${module}");\n`;
    // fs.writeFileSync(entryFile, entryContent.trim(), { flag: 'w' });

    // set exposes module
    exposes[`./widgets`] = `../src/${module}`;

    // setup latest_version.txt
    // fs.outputFileSync(path.resolve(dest, 'latest_version.txt'), uuid);

    let config;

    // add tailwindcss loader if needed and handle multiple tailwindcss configs case
    const tailwindConfigPath = findTailwindConfigFiles(path.resolve(rootDir, '..', 'src', module));

    let outputPath, publicPath;

    if (tailwindConfigPath.length > 1) {
        config = tailwindConfigPath.map(({ path: twConfigPath, kind }) => {
            if (kind) {
                const devPublicPathKey =
                    devPublicPath?.replace(/\/(?!.*\/)/g, `_${kind}/`) || undefined;
                const prodPublicPathKey =
                    prodPublicPath?.replace(/\/(?!.*\/)/g, `_${kind}/`) || undefined;

                outputPath = path.resolve(dest, `${uuid}_${kind}`);
                publicPath = mode === 'development' ? devPublicPathKey : prodPublicPathKey;
            } else {
                outputPath = path.resolve(dest, uuid);
                publicPath = mode === 'development' ? devPublicPath : prodPublicPath;
            }

            const plugins = getWebpackPlugins({
                federateModuleName,
                exposes,
                publicUrl: publicPath,
                uuid,
                mode,
                moduleName: module,
                outputPath: dest, //outputPath
            });

            tailwindCssLoader = getTailwindCssLoader(twConfigPath);

            console.log(
                'Start building process for module:',
                module,
                'with public path:',
                publicPath,
                `under ${mode} mode`,
                kind ? `with variant: ${kind}` : ''
            );

            return constructWebpackConfig({
                mode,
                rootDir,
                outputPath,
                publicPath,
                DEV_SERVER_PORT,
                tailwindCssLoader,
                plugins,
                moduleName: module,
            });
        });
    } else {
        outputPath = path.resolve(dest, uuid);
        publicPath = mode === 'development' ? devPublicPath : prodPublicPath;
        const plugins = getWebpackPlugins({
            federateModuleName,
            exposes,
            publicUrl: publicPath,
            uuid,
            mode,
            moduleName: module,
            outputPath: dest,
        });

        if (tailwindConfigPath.length === 1) {
            tailwindCssLoader = getTailwindCssLoader(tailwindConfigPath[0].path);
        }

        console.log(
            'Start building process for module:',
            module,
            'with public path:',
            publicPath,
            `under ${mode} mode`
        );

        config = constructWebpackConfig({
            mode,
            rootDir,
            outputPath,
            publicPath,
            DEV_SERVER_PORT,
            tailwindCssLoader,
            plugins,
            moduleName: module,
        });
    }

    return {
        config,
        mode,
        publicPath,
        outputPath,
        exposes,
        tailwindCssLoader,
    };
}

module.exports = function getWebpackConfig(argv, rootDir) {
    const { TARGET_MODULE } = process.env;

    try {
        if (TARGET_MODULE === '*') {
            console.log('Build all modules...\n');

            const modules = fs
                .readdirSync(path.resolve(rootDir, '../src'), {
                    withFileTypes: true,
                })
                .filter(
                    (dirent) =>
                        dirent.isDirectory() &&
                        !dirent.name.startsWith('_') &&
                        !dirent.name.startsWith('.')
                )
                .map((dirent) => dirent.name);

            if (!modules.length) throw new Error('No module available, abort');

            let configs = [];
            for (const module of modules) {
                process.env.TARGET_MODULE = module.trim();

                const { config } = buildWebpackConfig(process.env, argv, rootDir);

                if (Array.isArray(config)) configs.push(...config);
                else configs.push(config);
            }

            return configs;
        }

        let modules = TARGET_MODULE.split(',').filter(Boolean);

        if (modules.length === 0) {
            console.log('No target module specified, try build first module...\n');

            const modules = fs
                .readdirSync(path.resolve(rootDir, '../src'), {
                    withFileTypes: true,
                })
                .filter(
                    (dirent) =>
                        dirent.isDirectory() &&
                        !dirent.name.startsWith('_') &&
                        !dirent.name.startsWith('.')
                )
                .map((dirent) => dirent.name);

            module = modules[0];

            if (!module) throw new Error('No module available, abort');

            process.env.TARGET_MODULE = module;

            return buildWebpackConfig(process.env, argv, rootDir).config;
        } else if (modules.length === 1) {
            console.log('Execute single build mode...\n');
            process.env.TARGET_MODULE = modules[0].trim();

            return buildWebpackConfig(process.env, argv, rootDir).config;
        } else {
            console.log('Execute bulk build mode...\n');
            let configs = [];

            for (const module of modules) {
                process.env.TARGET_MODULE = module.trim();

                const { config } = buildWebpackConfig(process.env, argv, rootDir);

                if (Array.isArray(config)) configs.push(...config);
                else configs.push(config);
            }

            return configs;
        }
    } catch (error) {
        throw error;
    }
};
