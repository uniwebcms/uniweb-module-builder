# Configuring the development toolchain

The recommended toolchain is the following:

- [Node.js](#node-js) stable version
- [Yarn](#yarn) package manager
- [Visual Studio Code](#visual-studio-code) editor
- [Pagekite](#pagekite) for tunneling to localhost

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

## Pagekite

This repository comes with a web server ready to go for development purposes. The server will run on local host on port **3005** and will need to be accessible from the outside world via a public URL. We can achieve that with a middleware server that would send traffic to localhost via a tunnel. A simple solution is to get and install [Pagekite](https://pagekite.net/).

You will be asked to create an account at Pagekite and to choose a name for your first "kite", which will be used to construct a permanent URL for your tunnel.

```bash
# download python version executable
$ curl -O https://pagekite.net/pk/pagekite.py 

# signup / create account
$ python3 pagekite.py --signup 
```

Now that you know the public URL for your local web server you must save it into the environment variable `TUNNEL_URL`. You can edit the existing `.env` file, or preferably, create a new file named `.env.dev` and add your environment variables in it.

```ini
TUNNEL_URL="https://[kite_name].pagekite.me"
```

You are all set for now. Once you run the web server at http://127.0.0.1:3005 and the "fly the kite", the `dist` folder of this repository will be accessible at `https://[kite_name].pagekite.me`

## Next steps

The [next steps](dev_with_tunnel.md) are:

- run a web server
- watch for code changes
- create a website
- connect it to a module
- open a public tunnel to localhost to fetch the module's files.
