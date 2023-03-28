# Uniweb widget collections

Both Uniweb and uniweb-made website can be extended with custom CSS and JavaScript via **widget collections**. Widget collections can be developed and distributed as independent projects. One repository can contain several collections, each with several widgets sharing components and assets with one another and across collections.

Widgets can be built with the [React JS](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/) frameworks as well as using plain JavaScript and CSS.

When a Uniweb website is rendered by a web browser, the widgets from its linked collection are called with arguments that provide the source contents, custom properties, and website theme to them. You can learn about programming widgets in the [widget development documentation](https://help.uniweb.app/).

It should take about 5 minutes to get started building a widget collection. You do not need to install any tools. All you need is a Cloudflare account and a Uniweb website.

## Setting up a distribution server for widget collections

Both [Cloudflare pages](https://pages.cloudflare.com/) and [GitHub pages](https://pages.github.com/) services can be used for the distribution of the compiled bundle of a widget collection. In this tutorial, we will be using Cloudflare because it offers a leading content delivery network, a capable free plan, [automatic builds](https://developers.cloudflare.com/pages/platform/build-configuration/), [branch build controls](https://developers.cloudflare.com/pages/platform/branch-build-controls/), [rollbacks](https://developers.cloudflare.com/pages/platform/rollbacks/), and much more. However, other similar services can be used instead.

The building process can be done on a local computer or remotely. For example, with an remote build, you can work entirely online by editing your code with the [GitHub code editor](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor) and then letting Cloudflare build a distribution bundle every time you commit changes to a selected branch.

It is also possible to use Cloudflare only as a content delivery network and perform the builds locally with the [Yarn package manager](https://yarnpkg.com/). In that case, you may also prefer editing your code locally with [Visual Studio Code](https://code.visualstudio.com/) or another similar IDE.

In summary, it is easy to create, update, and publish widgets without any tools thanks to online services such as GitHub code editor and Cloudflare Pages. It is also easy to work with your own computer using tools like VS Code and Yarn.

### Setup step 1: Create a Cloudflare project

The first step is to configure a **free Cloudflare project** that can be used for both building and distribution, or just for distribution.

Start by creating a Cloudflare project and connect your repository to it by following the [Cloudflare setup instructions](docs/cloudflare_setup.md). If you want, you can configure your Cloudflare project to run a new build action whenever a particular branch changes. The build actions is:

```bash
yarn build
```

Configure the Cloudflare Pages project as shown below.

![img.png](docs/assets/cloudflare/simpleBuildSetting.png)

The **target collection** of the build is defined in the environment variable `TARGET_COLLECTION` located in the `.env` file of this repository. The default value is `MainCollection`. You can edit the `.env` file and set a new value for `TARGET_COLLECTION`, or you can manage its value directly in your Cloudflare project, which has higher precedence that the one in `.env`.

> To set the variable value in Cloudflare, click on the "Environment variables (advanced)" link of your project. Alternatively, you can add the value in the build command itself `TARGET_COLLECTION="another_collection" yarn build`, where "another_collection" is the actual name of your target collection.

Every time you commit to your master or main branch, a production build will be executed automatically.

> Cloudflare lets you [skip a build](https://developers.cloudflare.com/pages/platform/branch-build-controls/#skip-builds) by adding `[CI Skip]` to the commit message.

**Note**: if you prefer building your distribution locally, simply leave the *Build command* blank. Then you can commit your builds in the dist folder, or you can use [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) to push the files to Cloudflare without committing them to the repository.

### Setup step 2: Link your widget collection to a website

A widget collection can be linked to a website for production or development purposes. For development, you switch a website into **develop mode** and then provide a URL to a widget collection for testing purposes. For production, you have to create a **widget collection profile** with information about the collection, such as its URL, description, documentation and so on. The specific steps for each case are described in the following subsections.

> If this is your first time building Uniweb widgets, we suggest working in dev mode only, and leaving the setup of a widget collection profile for later.

#### **Linking a collection for development purposes** :tractor: 

Here we assume that you have access to a [Uniweb instance](https://help.uniweb.app/uniweb_instance) where you can create a [website](https://help.uniweb.app/website). You can use an existing website or create a new one. You will configure the website to request your choice of **widget collection**.

> If you don't have a website, create a [docufolio](https://help.uniweb.app/docufolio) of type _website content_ and some simple text. For example, let the content be just a single topic and some text, like a "Hello world" title. Then a create website that uses the new docufolio as its contents.

Let's beging by connecting the **Widget Collection** to the **dev mode** of a website.

1. Open a website and turn on **dev mode** as shown below.

![img.jpg](docs/assets/websiteDevMode.png)

2. Set the widget collection URL. If you are distributing your builds with Cloudflare, use the public URL of your [Cloudflare project](docs/cloudflare_setup.md#dist_url). If you are using a public tunnel to localhost, use the URL of the tunnel.
3. Apply the changes.

You should now see that the website is using the widgets defined in the widget collection that you selected.

#### **Linking your collections to a published website** :rocket:

You can link a widget collection to a docufiolio and to a website. A docufiolio is used both to create website templates and to provide website contents. A website base on a docufolio can override the widget collection defined by it.

Before linking a widget collection to a docufolio or a website, a a [widget collection profile](help.uniweb.app/creating_a_widget_collection_profile) needs to be created for it with all the needed information about, such us URL and description.

For a docufolio, open the settings options and choose your collection in the Widget Collection field.

<!-- In the case of a docufolio, you can set the `Custom Styler` field to be the public URL plus the path to the collection.

![img.jpg](docs/assets/docufolioInfo.png) -->

## Programming widgets without a computer

You can edit the files in this repository with the online [GitHub code editor](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor) by simply typing <kbd>.</kbd> on the root page of the repository.

> The github.dev editor runs entirely in your browser’s sandbox. Your work is saved in the browser’s local storage until you commit it.

If this is your first collection, you can get started quickly by duplicating the example collection included in the repository. To do that, simply go to the `src` folder and follow these steps:

1. Duplicate the `MainCollection` to keep a copy of it.
1. Name the new copy `ExampleCollection`.
1. Work directly on the `MainCollection`.

After editing the files in the repository, remember to commit the changes so that Cloudflare starts a new build process. The steps are as follows:

1. Go to the Source Control tab on the left panel, type a message and then click the *Commit & Push* button.
2. Go to the Source Control tab on the left panel, and [commit your changes](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor#commit-your-changes).
3. Once the Cloudflare build process is complete, you can see the results by reloading the website.

## Programming widgets with a local computer

Letting Cloudflare build your collection is a good option for repositories that only have one collection in them as, for now, you cannot connect one GitHub repository to multiple Cloudflare Pages projects. For repositories with multiple collections, you have to build them locally, and use Cloudflare for distribution only. Building locally is also faster, but requires you to have Yarn installed.

Whenever possible, we recommend local builds for production and [public tunneling to localhost](#developing-with-a-localhost-tunnel) for development. For the scenario where you want the flexibility of updating website components without a computer, e.g. with your phone, using online tools for editing and building is the ideal choice. Online building is also good to get your first project started with minimal effort.

The most common setup is having a `master` branch and a `develop` branch and configuring Cloudflare to distribute the `dist` folder in the `master` branch. With that branch structure, the frequent commits are done on the `develop` branch, which is only merged into the `master` branch to make a new version publicly available.

### Publishing new bundles

Remote building is a good option to distribute production bundle of a single widget collection. However, local building is better for frequent development and/or repositories with multiple widget collections.

> You can use local building for production, development or both. To disable remote building, go to your Cloudflare project and remove the build command from it.

In local building mode, you use Yarn to build the output bundle. You can target both production and development modes. For production, you first build and then commit the distribution bundle to the git repository. Cloudflare will pick up the change and start the public distribution of the new bundle.

Make sure that the [Yarn package manager](https://yarnpkg.com/) is installed and run the basic `yarn` script at the root of the repository to install all the dependencies.

```bash
yarn
```

Before building, make sure that the `TARGET_COLLECTION` environment variable is set with the name of the collection that you want to build. You can write the setting in `.env` if you want to commit the change, or in `.env.local` if you want to be ignored in the commit (ideal when working with other team members working on different collections).

You can build and commit a new distribution bundle by running the `build:prod-commit` action.

```bash
yarn build:prod-commit
```

> You can also set the `TARGET_COLLECTION` in the build command using this syntax: `TARGET_COLLECTION=[some_name] yarn build:prod-commit`

### Developing with a localhost tunnel

For development environments, we recommend [working with a public tunnel](docs/localhost_tunnel.md) to your localhost URL instead of committing your dev builds. With that setup, you don't have to commit the changes in order for them to go live. You simply make changes to the code in your file system, and then let Yarn rebuild it automatically. You just have to reload a website linked to the collection whenever you want to see the results of your changes.

> The latest version build of your code is available to the site via the public tunnel that you opened.

Follow the instructions on [working with a public tunnel](docs/localhost_tunnel.md) to set up a tunnel and develop locally with it.

## How to create a new Widget Collection

1. Create a folder under `src` with the name of the new **widget collection**. e.g. `src/MarketingClassic`.

2. Create a `index.js` file and export all necessary components that the website may need in that file. For example, [src/MarketingClassic/index.js](./src/MarketingClassic/index.js)

3. If your widgets are built with Tailwind css, place the `tailwind.config.js` file under the root folder of the target remote. For example, [src/MarketingClassic/tailwind.config.js](./src/MarketingClassic/tailwind.config.js). Import the default Tailwind css file in `index.js`. For example, [src/MarketingClassic/index.css](./src/MarketingClassic/index.css)
