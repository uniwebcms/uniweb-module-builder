# Technological specifications

The linking between a Uniweb website and a widget collection is done with the [module federation](https://webpack.js.org/concepts/module-federation/) technology of Webpack 5.

A production Uniweb would normally consume federated modules built in _production mode_ and distributed via some public hosting service such as [Cloudflare pages](https://pages.cloudflare.com/) or [GitHub pages](https://pages.github.com/).

During the widget development phase, it can be inconvenient to publish a new distribution version every time one makes some change to the code. Fortunately, that's not necessary because it's easy to create a public tunnel to the localhost URL of one's computer. The tunnel makes a local dev project available to a **Uniweb instance**. When combined with Yarn watch, one simply edits the source code locally and then reload the target website on the remote Uniweb instance.

we offer an option that we call **exposed localhost**, which can make a local dev project available to a production Uniweb instance. When combined with Yarn watch, one simply edits the source code locally and then reload the target website on the remote Uniweb instance.

## The Uniweb connection

The remote Uniweb learns about every new version of a distribution bundle from the information saved in the `latest_version.json` located at the URL provided as a `Custom Styler` information value in the section of the Docufolio that is linked to a federated module.

Open a target docufulio and set it custom styler.

![img.jpg](assets/docufolioInfo.png)

For a **Live Uniweb instance**, the possible values are

`[PUBLIC_URL]/[TARGET_MODULE]` or `[TUNNEL_URL]/[TARGET_MODULE]`

The **PUBLIC_URL** and **TUNNEL_URL** are usually the variable set in the `.env` files (e.g. `.env` or `.env.dev`). However, when usingCloudflare automatic builds, the `PUBLIC_URL` is normally set by the builder. In that case, use the `Domain` provided by the Cloudflare project instead.

## Configuring in your own `.env.dev`

In contrast to the `.env` file, the `.env.dev` file is not committed and the variable values set it in have higher precedence than those in `.env`.

The environment variables are conditionally needed based on the specific script argument used.

The main environment variable is `PUBLIC_URL` because it is used by Webpack to know the location of the generated bundle in order to request additional chunks (when using code splitting) or referenced files loaded via the file-loader or url-loader, respectively. When using **Cloudflare Pages**, the `PUBLIC_URL` is assumed to be equal to the `CF_PAGES_URL` value provided by the build process.

```bash
# The name of the collection to build (often overridden via script arguments)
TARGET_MODULE=""

# Used by Webpack to locate generated code chunks and referenced asset files
PUBLIC_URL=""

# Used in "watch:tunnel" to know the publicly accessible URL pointing to localhost
TUNNEL_URL=""

# Used in "build:prod-copy" to know the path where to copy of the output bundle
OUTPUT_COPY_DIR="../some-other-git-repo"
```

Each scenario has an associated predefined script.

```json
"scripts": {
   "build": "cd builder && yarn run build",
   "build:dev": "cd builder && yarn run build:dev",
   "build:prod": "cd builder && yarn run build:prod",
   "build:prod-commit": "cd builder && yarn run build:prod-commit",
   "build:prod-copy": "cd builder && yarn run build:prod-copy",
   "build:prod-copy-commit": "cd builder && yarn run build:prod-copy-commit",
   "watch:tunnel": "cd builder && yarn run watch:tunnel",
   "watch:local": "cd builder && yarn run watch:local",
}
```

The scripts are run with a similar command

```bash
TARGET_MODULE=[name] yarn [argument]
```

The `TARGET_MODULE=[name]` can be omitted in order to use the value define in the `.env` file(s). The script `argument` can be one of the following:

- `build` auto detects whether the mode is `development` or `production` based on the branch name defined in `CF_PAGES_BRANCH` (set by Cloudflare builds). It is the recommended argument for Cloudflare projects.

-  `build:dev` builds in `development` mode, saves the compiled files locally, and modifies the `latest_version.txt` file. It can be used for third-party service like **Cloudflare** to build the development bundle remotely.

-  `build:prod` builds in `production` mode, saves the compiled files locally, and modifies the `latest_version.txt` file. It can be used for third-party service like **Cloudflare** to build the production bundle remotely.

-  `build:prod-commit` builds in `production` mode, and it runs `git commit` and `git push` for the distribution files and `version` file

-   `build:prod-copy` builds in `production` mode, copies distribution files to the `open-uniweb` repo for manually deploy later on, and updates its `version` file.

-   `build:prod-copy-commit` builds in `production` mode, deploys distribution files to the `open-uniweb` repo, and updates its `version` file.

-   `watch:tunnel` builds in `development` mode with the `--watch` option, saves the compiled files locally, and modifies the `latest_version.txt` file as the local build changes.

-   `watch:local` builds in development mode with the `--watch` option, and updates the `remoteRegistry` file under `dist/dev`. This more is appropriate when there is a local Uniweb instance on the same computer.

### The default `build` command

This `build` argument does not explicitly specify the build mode in the CLI parameters. The build mode depends on the environment variable `CF_PAGES_BRANCH` provided by **Cloudflare**. In short, it's the repository's branch name the Cloudflare Project is connected to. When the branch name is `main` or `master`, `production` mode will be activated, otherwise `development` mode will be used.

> The building behavior and output directory are the same as `build:dev` or `build:prod` depending on the build mode.

## Yarn and `.gitignore`

What has to be include in `.gitignore` for Yarn depends on whether one wants to follow a Zero-Installs approach or not. With Zero-Installs, all the dependencies are already included in the repository and the build scripts can be called without having to first install them. The Zero-Installs approach is ideal to ensure that the source code used in a remote build is locally available and unchanged.

The following list is based on a [discussion on the topic](https://next.yarnpkg.com/getting-started/qa#which-files-should-be-gitignored) in the Yarn website.

- .yarn/plugins and .yarn/releases contain the Yarn releases used in the current repository (as defined by yarn set version). You will want to keep them versioned (this prevents potential issues if, say, two engineers use different Yarn versions with different features).

- .yarn/unplugged should likely always be ignored, since it may contain native builds

- .yarn/build-state.yml should likely be ignored as well, as it contains the build infos

  - If for some reason you version unplugged, it may make sense to keep build-state as well

- .yarn/cache may be ignored, but you'll need to run yarn install to regenerate it

  - Versioning it unlocks what we call Zero-Installs - it's optional, though
  
- .pnp.js (and potentially .pnp.data.json) are in the same boat as the cache. Add it to your repository if you keep your cache in your repository, and ignore it otherwise.

- yarn.lock should always be stored within your repository, even if you develop a library, because it's important for people who will work with your library in 10 years to know what was the last confirmed set of packages which worked as expected.

In summary, for Zero-Installs:

```ini
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
```

and if not using Zero-Installs:

```ini
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
```

> **Tip:** You can also add a .gitattributes file to identify the release and plugin bundles as binary content. This way Git won't bother showing massive diffs when each time you subsequently add or update them:

```ini
/.yarn/releases/** binary
/.yarn/plugins/** binary
```
