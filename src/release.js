const path = require('path');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;
const chalk = require('chalk');

const commit = (module, version, productionBranch) => {
    let output;

    // sync repo
    output = execSync(`git pull`, {
        encoding: 'utf-8',
    });
    console.log('Pull latest\n', output);

    // add and commit
    const git = `git add ../dist/${module}/${version} && git add ../dist/${module}/version.json && git add ../dist/${module}/latest_version.txt && git commit -m 'new ${module} build' && git push -u origin ${productionBranch}`;

    output = execSync(git, {
        encoding: 'utf-8',
    });

    console.log(chalk.bgWhite.bold('Git actions:\n'), output);
};

module.exports = function release(__dirname) {
    const { TARGET_MODULE, PRODUCTION_BRANCH } = process.env;

    if (!TARGET_MODULE) {
        const message =
            chalk.yellow.bold('Warning! ') +
            chalk.white('No module specified in env, check the value of ') +
            chalk.green.bold('TARGET_MODULE') +
            chalk.white(', abort!');

        console.log(message);

        return;
    }

    if (!PRODUCTION_BRANCH) {
        const message =
            chalk.yellow.bold('Warning! ') +
            chalk.white('No production branch specified in env, check the value of ') +
            chalk.green.bold('PRODUCTION_BRANCH') +
            chalk.white(', abort!');

        console.log(message);

        return;
    }

    const errors = [];

    const modules = TARGET_MODULE.split(',').filter(Boolean);

    for (let module of modules) {
        module = module.trim();

        try {
            if (!fs.existsSync(path.resolve(__dirname, '../src', module))) {
                const message =
                    chalk.yellow.bold('Warning! ') +
                    chalk.white('Unable to find module: ') +
                    chalk.green.bold(module) +
                    chalk.white(', skip\n');

                console.log(message);

                throw new Error(`Skipped: ${module} (module not found)`);
            }

            const filePath = path.resolve(__dirname, '../dist', module, 'latest_version.txt');
            const version = fs.readFileSync(filePath, 'utf8');
            commit(module, version, PRODUCTION_BRANCH);

            setTimeout(() => {}, 500);
        } catch (error) {
            errors.push(error.message);
        }
    }

    if (errors.length) {
        const message = chalk.white('Completed with ') + chalk.red.bold(`${errors.length} errors`);
        console.log(message);
        for (let error of errors) {
            console.log(error);
        }
    } else {
        const message = chalk.bgGreen.bold('Completed successfully.');
        console.log(message);
    }
};
