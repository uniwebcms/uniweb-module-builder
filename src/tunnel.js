// const fs = require('fs');
const cf = require('cloudflared');
const tunnel = cf.tunnel;

module.exports = async function createTunnel(port = 3005) {
    // if (!fs.existsSync(cf.bin)) {
    //     // install binary
    //     await install(cd.bin);
    // }

    const { url, connections, child } = tunnel({ '--url': `http://localhost:${port}` });

    const tunnelUrl = await url;

    // show the url
    // console.log('LINK:', tunnelUrl);

    // wait for the all connections to be established
    // const conns = await Promise.all(connections);

    // show the connections
    // console.log('Connections Ready!', conns);

    child.on('exit', (code) => {
        console.log('tunnel process exited with code', code);
    });

    return tunnelUrl;
};
