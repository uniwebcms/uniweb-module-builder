const path = require('path');
const exec = require('child_process').exec;

module.exports = function startServer(dirname) {
    const dest = path.resolve(dirname, '../build_dev');
    const port = process.env.DEV_SERVER_PORT;

    const cmd = `yarn run http-server ${dest} -p=${port} --cors`;

    const serveProcess = exec(cmd);

    serveProcess.stdout.on('data', function (data) {
        console.log(data);
    });
};
