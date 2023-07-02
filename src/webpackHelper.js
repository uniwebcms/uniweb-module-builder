const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const { URL } = require('url');
const createTunnel = require('./tunnel');
const postpresetenv = require('postcss-preset-env');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

const { ModuleFederationPlugin } = webpack.container;

let uuid = uuidv4();

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

module.exports = async function (argv, __dirname) {
    const { env } = argv;

    let { PUBLIC_URL, TUNNEL_URL, npm_lifecycle_event, CF_PAGES_URL, CF_PAGES_BRANCH } =
        process.env;

    PUBLIC_URL = validUrl(PUBLIC_URL);
    CF_PAGES_URL = validUrl(CF_PAGES_URL);

    let mode = argv.mode;
    let module = process.env.TARGET_COLLECTION;
    let federateModuleName = process.env.REMOTE_TYPE || 'WebsiteRemote';

    const isTunnel = !!env.tunnel;
    const isLocal = !!env.local;

    let prodPublicPath;
    let devPublicPath;
    let dest;
    let tailwindCssLoader = {};

    if (!mode) console.log('Build mode not specified in script!');

    if (CF_PAGES_URL) {
        console.log('Received public path from Cloudflare:', CF_PAGES_URL);

        if (!mode && CF_PAGES_BRANCH) {
            if (CF_PAGES_BRANCH === 'main' || CF_PAGES_BRANCH === 'master') {
                mode = 'production';
            } else mode = 'development';

            console.log('Set build mode:', mode, 'based on branch:', CF_PAGES_BRANCH);
        }
    }

    if (!mode) {
        console.log('No build mode specified, build with production mode');

        mode = 'production';
    }

    if (!module) {
        console.log('No module specified, try use first module');

        const modules = fs
            .readdirSync(path.resolve(__dirname, '../src'), {
                withFileTypes: true,
            })
            .filter((dirent) => dirent.isDirectory() && dirent.name !== 'utils')
            .map((dirent) => dirent.name);

        module = modules[0];
    }

    if (mode === 'production' && !CF_PAGES_URL && !PUBLIC_URL) {
        throw new Error('No public url received under production mode');
    }

    if (isTunnel) {
        // Start a tunnel automatically
        if (TUNNEL_URL) TUNNEL_URL = validUrl(TUNNEL_URL);
        else TUNNEL_URL = await createTunnel();

        if (TUNNEL_URL) console.log(`The tunnel is: ${TUNNEL_URL}`);
        else throw new Error('Missing tunnel URL');
    }

    switch (npm_lifecycle_event) {
        case 'build':
            if (mode === 'development') {
                if (CF_PAGES_URL) {
                    devPublicPath = `${CF_PAGES_URL}/${module}/${uuid}/`;
                }
            } else {
                prodPublicPath = CF_PAGES_URL
                    ? `${CF_PAGES_URL}/${module}/${uuid}/`
                    : `${PUBLIC_URL}/${module}/${uuid}/`;
            }
            dest = path.resolve(__dirname, '../dist', module);
            break;
        case 'build:dev':
            if (CF_PAGES_URL) {
                devPublicPath = `${CF_PAGES_URL}/${module}/${uuid}/`;
            } else {
                throw new Error(
                    'build:dev should not be used under a non-Cloudflare environment, please use watch:local instead'
                );
            }
            dest = path.resolve(__dirname, '../dist', module);
            break;
        case 'watch:tunnel':
            devPublicPath = `${TUNNEL_URL}/${module}/${uuid}/`;
            dest = path.resolve(__dirname, '../build_dev', module);
            break;
        case 'watch:local':
            devPublicPath = `http://localhost:3005/${module}/${uuid}/`;
            dest = path.resolve(__dirname, '../build_dev', module);
            break;
        case 'build:prod':
            prodPublicPath = CF_PAGES_URL
                ? `${CF_PAGES_URL}/${module}/${uuid}/`
                : `${PUBLIC_URL}/${module}/${uuid}/`;
            dest = path.resolve(__dirname, '../dist', module);
            break;
        case 'build:prod-commit':
            prodPublicPath = `${PUBLIC_URL}/${module}/${uuid}/`;
            dest = path.resolve(__dirname, '../dist', module);
            break;
        case 'build:prod-copy':
        case 'build:prod-copy-commit':
            prodPublicPath = `${PUBLIC_URL}/${module}/${uuid}/`;
            dest = path.resolve(__dirname, '../build_dev', module);
            break;
    }

    console.log(
        'Start building process for module:',
        module,
        'with public path:',
        mode === 'development' ? devPublicPath : prodPublicPath
    );

    const exposes = {};

    // get module that need build and deploy
    const moduleExists = fs
        .readdirSync(path.resolve(__dirname, '../src'))
        .find((m) => m === module);

    if (!moduleExists) {
        throw new Error('Module not exist!');
    }

    if (moduleExists) {
        // write dynamic entry.js
        const entryFile = path.resolve(__dirname, `entry.js`);
        const entryContent = `import("../src/${module}");\n`;

        fs.writeFileSync(entryFile, entryContent.trim(), { flag: 'w' });

        // set exposes module
        exposes[`./widgets`] = `../src/${module}`;

        // add tailwindcss loader if needed
        const tailwindPath = path.resolve(__dirname, '..', 'src', module, 'tailwind.config.js');

        if (fs.existsSync(tailwindPath)) {
            tailwindCssLoader = {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [
                            postpresetenv,
                            require('@tailwindcss/nesting'),
                            tailwindcss(tailwindPath),
                            autoprefixer,
                        ],
                    },
                },
            };
        }

        const newVersionContent = [
            {
                version: uuid,
                date: new Date().toString(),
            },
        ];

        if (mode === 'development') {
            if (isLocal) {
                // update moduleRegistry.json
                let registryContent = {
                    [federateModuleName]: `${devPublicPath}remoteEntry.js`,
                };

                fs.outputJsonSync(
                    path.resolve(__dirname, '../build_dev', 'remoteRegistry.json'),
                    registryContent
                );
            } else {
                // update version.json
                fs.outputJsonSync(path.resolve(dest, 'version.json'), newVersionContent);
                // update latest_version.txt
                fs.outputFileSync(path.resolve(dest, 'latest_version.txt'), uuid);
            }
        } else {
            // update version.json
            fs.outputJsonSync(path.resolve(dest, 'version.json'), newVersionContent);
            // update latest_version.txt
            fs.outputFileSync(path.resolve(dest, 'latest_version.txt'), uuid);
        }
    }

    const outputPath = path.resolve(dest, uuid);
    const publicPath = mode === 'development' ? devPublicPath : prodPublicPath;

    const config = {
        mode,
        entry: path.resolve(__dirname, 'entry.js'),
        resolve: {
            extensions: ['.jsx', '.js', '.json'],
        },
        output: {
            filename: 'main.[contenthash].js',
            path: outputPath,
            clean: true,
            publicPath,
        },
        devServer: {
            port: process.env.DEV_SERVER_PORT,
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
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
                    ],
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
            ],
        },
        plugins: [
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
            function () {
                this.hooks.done.tap('BuildCompletePlugin', (stats) => {
                    if (stats.compilation.errors.length === 0) {
                        console.log('Webpack build completed successfully!');
                    } else {
                        console.log('Webpack build encountered errors.');
                    }
                    // Additional custom logic if needed
                });
            },
        ],
        watchOptions: {
            ignored: ['**/node_modules'],
        },
    };

    return {
        config,
        mode,
        publicPath,
        outputPath,
        exposes,
        tailwindCssLoader,
    };
};
