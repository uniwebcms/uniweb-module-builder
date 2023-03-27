# Uniweb Module Builder

Standalone library for building federated modules for Uniweb CMS.

`uniweb-module-builder` is an NPM module that provides three functions to help build a collection of website widgets (federated module) and commit dist files to its own GitHub repository or another GitHub repository.

## Installation

You can install `uniweb-module-builder` using npm:

```bash
npm install uniweb-module-builder
```

Or using yarn:

```bash
yarn add uniweb-module-builder
```

## Functions

#### `getConfigData(argv, __dirname)`

The `getConfigData` function takes `argv` and `__dirname` as parameters and analyzes the environment variables internally. It returns an object containing a complete webpack config object that can be used directly and some other data that can be use in case of writing a custom configuration.

###### Parameters

-   `argv` - Command line arguments passed to the script.
-   `__dirname` - The directory name of the current module.

###### Involved environment variables

-   `PUBLIC_URL` - Reflects `output.publicPath` under `prod` mode
-   `TUNNEL_URL` - rReflects `output.publicPath` under `tunnel` mode
-   `TARGET_COLLECTION` - The name of target widget collection
-   `DEV_SERVER_PORT` - Reflects `devServer.port` under `dev` mode
-   `REMOTE_TYPE` - Reflects the `name` of `ModuleFederationPlugin`, default is `WebsiteRemote`

###### Return value

-   `config` - A complete Webpack config
-   `mode` - Webpack build mode
-   `publicPath` - The value of output.path
-   `exposes` - The value of `ModuleFederationPlugin` exposes
-   `tailwindCssLoader` - Loader rule for `css` files when enable `tailwindCss`

Example

```javascript
// webpack.config.js
const { getConfigData } = require('uniweb-module-builder');

module.exports = (_, argv) => {
    const { config } = getConfigData(argv, __dirname);
    console.log(configData);

    return config;
};
```

#### `release(__dirname)`

The `release` function takes `__dirname` as a parameter and analyzes the environment variables internally. It commits the latest distribution files to the website widget project's own Github repository.

###### Parameters

-   `__dirname` - The directory name of the current module.

###### Involved environment variables

-   `TARGET_COLLECTION` - The name of target widget collection

Example

```javascript
const { release } = require('uniweb-module-builder');

release(__dirname);
```

#### `deploy(__dirname)`

The `deploy` function takes `__dirname` as a parameter and analyzes the environment variables internally. It commits the latest distribution files to a specified GitHub repository.

###### Parameters

-   `__dirname` - The directory name of the current module.

###### Involved environment variables

-   `TARGET_COLLECTION` - The name of target widget collection
-   `OUTPUT_COPY_DIR` - The path to the local target Github repository

Example

```javascript
const { deploy } = require('uniweb-module-builder');

deploy(__dirname);
```

## License

`uniweb-module-builder` is licensed under the [MIT License](https://opensource.org/licenses/MIT).
