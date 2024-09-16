const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');
const chalk = require('chalk');
const yargs = require('yargs');
const createTunnel = require('./tunnel');

/**
 * Get the command-line options of the process.
 * @returns {Object} A map of CLI options.
 */
function getOptions() {
    return yargs
        .option('tunnel', {
            alias: 't',
            describe: 'Start a tunnel to localhost?',
            type: 'boolean',
            demandOption: false,
        })
        .option('cache', {
            default: 1,
            describe: 'Cache-control max-age header in seconds',
            type: 'number',
            demandOption: false,
        }).argv;
}

module.exports = function startServer(dirname, port) {
    const dest = path.resolve(dirname, '../build_dev');
    const tunnelFilename = dest + '/quick-tunnel.txt';
    const options = getOptions();

    // Create the target folder if it doesn't exist
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);

    // -c60 sets cache to 60 seconds. -c-1 disables caching
    const cache = options.cache ? `-c${options.cache}` : '-c-1';

    // see https://www.npmjs.com/package/http-server
    const cmd = `yarn run http-server ${dest} -p=${port} --cors --gzip ${cache}`;

    const serverProcess = exec(cmd);
    let serverReady = false;

    serverProcess.stdout.on('data', (data) => {
        if (serverReady) return;

        console.log(data); // Print the output until the server is ready

        // Check for the ready message (adjust based on the exact message printed by http-server)
        if (data.toString().includes('Available on')) {
            serverReady = true; // Set flag to stop further output
            console.log(chalk.blue(`Creating public tunnel to http://localhost:${port}...`));
        }
    });

    serverProcess.stderr.on('data', (data) => {
        // console.log(chalk.red.bold('Error: Cannot start web server'));
        console.log(data);
    });

    if (options.tunnel) {
        createTunnel(port)
            .then((tunnelUrl) => {
                fs.writeFileSync(tunnelFilename, tunnelUrl);

                const message = chalk.green.bold(`\nTunnel: `) + chalk.white(tunnelUrl) + '\n';

                console.log(message);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        fs.unlink(tunnelFilename);
    }
};
