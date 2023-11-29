# Build and Deploy with GitHub Actions

1. Go to the `Settings` tab of your [Uniweb modules repository](https://github.com/uniwebcms/website-components-template)

2. Go the the `Pages` tab of the left panel

3. Under the section **Build and deployment**, in the **Source** menue, select `GitHub Actions`. The page auto saves, so that is all.

<kbd> <img src="assets/enable_gh_actions.png" /> </kbd>

4. Go to the `Actions` tab of the repository

5. Accept the current workflow by clicking on the green button labelled "I understand my workflows, go ahead an enable them"

<kbd> <img src="assets/allow_gh_workflow.png" /> </kbd>

That is all. Now, when you commit changes to the `main` branch, the module will be built and deployed at:

```text
https://[gh-account-name].github.io/[repo-name]/[module-name]
```

For example, if your GitHub account name is `cvworks`, the repository name is `uniweb-modules`, and the module name is `SimpleCollection`, 
then the URL `https://cvworks.github.io/uniweb-modules/SimpleCollection` is the value you use to [set the Web Styler of a 
Docufolio in Uniweb](https://github.com/uniwebcms/uniweb-module-builder/blob/main/docs/dev_with_tunnel.md#connecting-the-module-to-a-website).

In addition, if the GitHub Actions are set to build a tutorial website for all the modules in the repo, the site will be deployed at:

```text
https://[gh-account-name].github.io/[repo-name]/tutorial
```

The default GitHub Actions normally also build an `index.html` page at the root level:

```text
https://[gh-account-name].github.io/[repo-name]
```

## Optional: triggering the build and deploy workflow manually

1. Go to the `Actions` tab of the repository

2. Go the the `Build and Deploy` tab of the left panel

3. Open the **Run workflow** menu on the main panel and click on the green button labelled **Run workflow**

<kbd> <img src="assets/manual_run_gh_workflow.png" /> </kbd>

## Build and Deploy Workflow
The module repository contain this GitHub Actions workflow. It is designed to automate the build and deployment process of a module collection. The workflow includes two main jobs: prepare, build, and two conditional jobs deploy and release. The workflow is triggered on pushes to the main branch and can also be manually triggered from the Actions tab.

#### Workflow Structure
```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  prepare:
    ...

  build:
    ...

  deploy:
    ...

  release:
    ...

```

### Job Descriptions

#### 1. `prepare` Job

The `prepare` job sets up the necessary environment and extracts information required by downstream jobs.

- **Triggers:** Manual or on push to the main branch.
- **Runs on:** Ubuntu Latest.

  ##### Steps:

  - **Checkout Repository:** Uses `actions/checkout` to fetch the repository.
  - **Load Environment Variables:** Uses `falti/dotenv-action` to load environment variables from a `.env` file.
  - **Set Outputs:** Exports variables such as `skip_tutorial`, `release_branch`, and `public_url` for downstream jobs.

#### 2. `build` Job

The `build` job compiles the project, installs dependencies, and optionally builds tutorials.

- **Triggers:** After the `prepare` job.
- **Runs on:** Ubuntu Latest.

  ##### Steps:

  - **Checkout Repository:** Uses `actions/checkout` to fetch the repository.
  - **Set GitHub Pages URL to Env:** Sets the GitHub Pages URL as an environment variable.
  - **Install Dependencies:** Uses `yarn` to install project dependencies.
  - **Build Module:** Uses `yarn` to build the project module.
  - **Build Tutorial (Optional):** Conditionally builds the tutorial based on the `skip_tutorial` variable.
  - **Generate Index Page:** Runs a script to generate the `index.html` for the GitHub Pages site.
  - **Upload Artifact for Deploy:** Uploads the `dist` folder as an artifact for downstream jobs.

#### 3. `deploy` Job

The `deploy` job deploys the `dist` folder to GitHub Pages for the current branch.

- **Triggers:** After the `prepare` and `build` jobs, only if `release_branch` is not set.
- **Runs on:** Ubuntu Latest.

  ##### Steps:

  - **Checkout Repository:** Uses `actions/checkout` to fetch the repository.
  - **Download Artifact:** Downloads the `dist` folder artifact from the `build` job.
  - **Setup Pages:** Configures GitHub Pages environment.
  - **Upload Artifact for GitHub Pages:** Uploads the `dist` folder as a GitHub Pages artifact.
  - **Deploy to GitHub Pages:** Uses `actions/deploy-pages` to deploy the `dist` folder to GitHub Pages.
  - **Clean Inter-job Artifacts:** Deletes the `dist` folder artifact uploaded by the `build` job.

#### 4. `release` Job

The `release` job releases the artifact to the specified release branch, hosted by GitHub Pages.

- **Triggers:** After the `prepare` and `build` jobs, only if `release_branch` is set.
- **Runs on:** Ubuntu Latest.

  ##### Steps:

  - **Checkout Repository:** Uses `actions/checkout` to fetch the repository.
  - **Download Artifact:** Downloads the `dist` folder artifact from the `build` job.
  - **Deploy to Release Branch:** Uses `peaceiris/actions-gh-pages` to deploy the `dist` folder to the specified release branch.
  - **Clean Inter-job Artifacts:** Deletes the `dist` folder artifact uploaded by the `build` job.

### Conclusion

This workflow provides a streamlined process for building and deploying projects, including optional tutorial builds and conditional releases. Users can trigger the workflow manually or automatically on pushes to the main branch. The deployment to GitHub Pages is handled seamlessly for both regular deployments and releases.
