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
            default: 30,
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

    serverProcess.stdout.on('data', (data) => {
        console.log(data);
    });

    process.stderr.on('data', (data) => {
        console.log(chalk('Error: Cannot start web server'));
        console.log(data);
    });

    if (options.tunnel) {
        createTunnel()
            .then((tunnelUrl) => {
                fs.writeFileSync(tunnelFilename, tunnelUrl);

                const separator = '-'.repeat(40); // Dashed line separator
                const message = chalk.green.bold('Tunnel: ') + chalk.white(tunnelUrl);

                console.log('\n' + separator);
                console.log(message);
                console.log(separator + '\n');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        fs.unlink(tunnelFilename);
    }
};
