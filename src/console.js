const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
    createModule,
    createComponent,
    promptForModuleInfo,
    promptForComponentInfo,
} = require('./boilerplate');

module.exports = function startConsole(projectDir) {
    const argv = yargs(hideBin(process.argv))
        .command('new:module', 'Create a new module', async (yargs) => {
            const options = await promptForModuleInfo(yargs.argv);
            await createModule(projectDir, options);
        })
        .command('new:component', 'Create a new component', async (yargs) => {
            const options = await promptForComponentInfo(yargs.argv);
            await createComponent(projectDir, options);
        })
        .help().argv;
};
