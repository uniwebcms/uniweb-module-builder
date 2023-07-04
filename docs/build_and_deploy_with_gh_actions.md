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
then you can use the `https://cvworks.github.io/uniweb-modules/SimpleCollection` as the value of the Web styler of a 
Docufolio in your Uniweb.

## Optional: manually trigger the build and deploy workflow

1. Go to the `Actions` tab of the repository

2. Go the the `Build and Deploy` tab of the left panel

3. Open the **Run workflow** menu on the main panel and click on the green button labelled **Run workflow**

<kbd> <img src="assets/manual_run_gh_workflow.png" /> </kbd>
