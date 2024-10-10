const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
    createModule,
    createComponent,
    promptForModuleInfo,
    promptForComponentInfo,
} = require('./boilerplate');

const handleError = (error) => {
    console.error('An error occurred:');
    console.error(error.message);
    if (process.env.DEBUG) {
        console.error(error.stack);
    }
    process.exit(1);
};

module.exports = function startConsole(projectDir) {
    const argv = yargs(hideBin(process.argv))
        .command('new:module', 'Create a new module', async (yargs) => {
            try {
                const options = await promptForModuleInfo(projectDir, yargs.argv);
                await createModule(projectDir, options);
                console.log('Module created successfully!');
            } catch (error) {
                handleError(error);
            }
        })
        .command('new:component', 'Create a new component', async (yargs) => {
            try {
                const options = await promptForComponentInfo(projectDir, yargs.argv);
                await createComponent(projectDir, options);
                console.log('Component created successfully!');
            } catch (error) {
                handleError(error);
            }
        })
        .fail((msg, err, yargs) => {
            if (err) {
                handleError(err);
            } else {
                console.error(msg);
                console.log(yargs.help());
                process.exit(1);
            }
        })
        .help().argv;
};
