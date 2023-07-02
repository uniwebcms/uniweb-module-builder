const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');
const createTunnel = require('./tunnel');
const chalk = require('chalk');

module.exports = function startServer(dirname, port, withTunnel = false) {
    const dest = path.resolve(dirname, '../build_dev');
    const tunnelFilename = dest + '/quick-tunnel.txt';

    // Create the target folder if it doesn't exist
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);

    // -c60 sets cache to 60 seconds
    // see https://www.npmjs.com/package/http-server
    const cmd = `yarn run http-server ${dest} -p=${port} -c60 --cors --gzip`;

    const serverProcess = exec(cmd);

    serverProcess.stdout.on('data', function (data) {
        console.log(data);
    });

    if (withTunnel) {
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
