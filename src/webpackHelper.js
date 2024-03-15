const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { URL } = require('url');
const postpresetenv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const chalk = require('chalk');
const CompressionPlugin = require('compression-webpack-plugin');

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

function getWebpackPlugins(federateModuleName, exposes, publicUrl, uuid, mode) {
    console.log('publicUrl', publicUrl);
    const compressionPlugin = new CompressionPlugin({
        filename: '[path][base].gzip',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
        deleteOriginalAssets: false,
    });

    let plugins = [
        new ModuleFederationPlugin({
            name: federateModuleName,
            filename: 'remoteEntry.js',
            exposes,
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
                twind: { singleton: true, requiredVersion: '^0.16.17' },
                '@twind/react': {
                    singleton: true,
                    requiredVersion: '^0.0.4',
                },
            },
        }),
        // // Enable Brotli compression
        // new CompressionPlugin({
        //     filename: '[path][base].br',
        //     algorithm: 'brotliCompress',
        //     test: /\.(js|css|html|svg)$/,
        //     threshold: 10240,
        //     minRatio: 0.8,
        //     deleteOriginalAssets: false,
        // }),
        function () {
            this.hooks.done.tap('BuildCompletePlugin', (stats) => {
                if (stats.compilation.errors.length === 0) {
                    // console.log('Webpack build completed successfully!');
                    const separator = '-'.repeat(40); // Dashed line separator

                    const cleanUrl = publicUrl
                        .replace(new RegExp(`/${uuid}/|/+$`, 'g'), '/')
                        .replace(/\/$/, '');
                    const message = chalk.green.bold('PUBLIC URL: ') + chalk.white(cleanUrl);

                    console.log('\n' + separator);
                    console.log(message);
                    console.log(separator + '\n');
                } else {
                    console.log('Webpack build encountered errors.');
                }
            });
        },
    ];

    if (mode === 'development') {
        plugins.push(compressionPlugin);
    }

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

function constructWebpackConfig(
    mode,
    rootDir,
    outputPath,
    publicPath,
    DEV_SERVER_PORT,
    tailwindCssLoader,
    plugins
) {
    return {
        mode,
        entry: path.resolve(rootDir, 'entry.js'),
        resolve: {
            extensions: ['.jsx', '.js', '.json'],
        },
        output: {
            filename: 'main.[contenthash].js',
            // filename: 'bundle.js',
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
                    // test: /\.js$/,
                    test: /\.(jsx|js)$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
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
            ],
        },
        plugins,
        watchOptions: {
            ignored: ['**/node_modules'],
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

    // write dynamic entry.js
    const entryFile = path.resolve(rootDir, `entry.js`);
    const entryContent = `import("../src/${module}");\n`;
    fs.writeFileSync(entryFile, entryContent.trim(), { flag: 'w' });

    // set exposes module
    exposes[`./widgets`] = `../src/${module}`;

    // const newVersionContent = [
    //     {
    //         version: uuid,
    //         date: new Intl.DateTimeFormat('en-CA', {
    //             year: 'numeric',
    //             month: 'long',
    //             day: 'numeric',
    //             hour: 'numeric',
    //             minute: 'numeric',
    //             second: 'numeric',
    //             timeZone: 'America/Toronto',
    //             timeZoneName: 'long',
    //         }).format(new Date()),
    //     },
    // ];

    // setup manifest.json
    if (mode === 'development') {
        if (isLocal) {
            // update moduleRegistry.json
            // let registryContent = {
            //     [federateModuleName]: devPublicPath.replace(/\/(?!.*\/)/g, ''),
            // };

            // fs.outputJsonSync(
            //     path.resolve(rootDir, '../build_dev', 'remoteRegistry.json'),
            //     registryContent
            // ); module
            fs.outputFileSync(
                path.resolve(rootDir, '../build_dev', module, 'latest_version.txt'),
                uuid
            );
        } else {
            // update version.json
            // fs.outputJsonSync(path.resolve(dest, 'version.json'), newVersionContent);
            // update latest_version.txt
            fs.outputFileSync(path.resolve(dest, 'latest_version.txt'), uuid);
        }
    } else {
        // update version.json
        // fs.outputJsonSync(path.resolve(dest, 'version.json'), newVersionContent);
        // update latest_version.txt
        fs.outputFileSync(path.resolve(dest, 'latest_version.txt'), uuid);
    }

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

            const plugins = getWebpackPlugins(federateModuleName, exposes, publicPath, uuid, mode);

            tailwindCssLoader = getTailwindCssLoader(twConfigPath);

            console.log(
                'Start building process for module:',
                module,
                'with public path:',
                publicPath,
                `under ${mode} mode`,
                kind ? `with variant: ${kind}` : ''
            );

            return constructWebpackConfig(
                mode,
                rootDir,
                outputPath,
                publicPath,
                DEV_SERVER_PORT,
                tailwindCssLoader,
                plugins
            );
        });
    } else {
        outputPath = path.resolve(dest, uuid);
        publicPath = mode === 'development' ? devPublicPath : prodPublicPath;
        const plugins = getWebpackPlugins(federateModuleName, exposes, publicPath, uuid, mode);

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

        config = constructWebpackConfig(
            mode,
            rootDir,
            outputPath,
            publicPath,
            DEV_SERVER_PORT,
            tailwindCssLoader,
            plugins
        );
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

module.exports = function (argv, rootDir) {
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

            return { config: configs };
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

            return buildWebpackConfig(process.env, argv, rootDir);
        } else if (modules.length === 1) {
            console.log('Execute single build mode...\n');
            process.env.TARGET_MODULE = modules[0].trim();

            return buildWebpackConfig(process.env, argv, rootDir);
        } else {
            console.log('Execute bulk build mode...\n');
            let configs = [];

            for (const module of modules) {
                process.env.TARGET_MODULE = module.trim();

                const { config } = buildWebpackConfig(process.env, argv, rootDir);

                if (Array.isArray(config)) configs.push(...config);
                else configs.push(config);
            }

            return { config: configs };
        }
    } catch (error) {
        throw error;
    }
};
