# Configuring the development toolchain

The recommended toolchain is the following:

- [Node.js](#node-js) stable version
- [Yarn](#yarn) package manager
- [Visual Studio Code](#visual-studio-code) editor

## Node JS

Begin by installing [Node.js LTS](https://nodejs.org/en) (stable version). 

## Yarn

Activate the [Corepack](https://nodejs.org/dist/latest/docs/api/corepack.html) tool for managing versions of your package managers, such as [Yarn](https://yarnpkg.com/getting-started/install).

```bash
# You might need to root level permissions (sudo -s) for this command
corepack enable
```

Update the global [Yarn version](https://yarnpkg.com/getting-started/install)

```bash
corepack prepare yarn@stable --activate
```

Run Yarn at the root folder of this repository to install all the dependencies.

```bash
yarn
```

## Visual Studio Code

Now you can start working on your code. If you don't already have an IDE, go ahead and install [Visual Studio Code](https://code.visualstudio.com/).

## Next steps

The [next steps](dev_with_tunnel.md) are:

- run a web server and a tunnel to localhost
- build a dev bundle and watch for source code changes
- create a website and connect it to the dev bundle