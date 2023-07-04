# Build and Deploy with GitHub Actions

1. Go to the `Settings` tab of the repository
2. Go the the `Pages` tab of the left panel
3. Under the section **Build and deployment**, in the **Source** menue, select `GitHub Actions`. The page auto saves, so that is all.
4. Go to the `Actions` tab of the repository
5. Accept the current workflow by clocking on the grrn button labeller "I understand my workflows, go ahead an enable them"

That is all. Now, when you commit changes to the Main branch, the module will be build and deployed at:

`https://[gh-account-name].github.io/[repo-name]/[module-name]`

## Optional: manually trigger the build and deploy workflow

1. Go to the `Actions` tab of the repository
2. Go the the `Buld and deploy` tab of the left panel
3. Open the **Run workflow** main on the main panel and select **Run workflow**
