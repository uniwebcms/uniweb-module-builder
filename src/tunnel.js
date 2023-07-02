const { spawn } = require('child_process');

module.exports = function createTunnel(port = 3005) {
    // Can use 'create', 'my-tunnel' as well
    const process = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`]);

    // process.stdout.on('data', (data) => {
    //     const output = data.toString();
    //     const regex = /URL: (\S+)/;
    //     const match = output.match(regex);

    //     if (match) {
    //         const tunnelURL = match[1];
    //         console.log(`Tunnel URL: ${tunnelURL}`);
    //     }
    // });

    process.stderr.on('data', (data) => {
        const output = data.toString();
        const regex = /https:\/\/.*?\.trycloudflare\.com/g;
        const match = regex.exec(output);

        if (match) {
            const tunnelURL = match[0];
            console.log(`Tunnel URL: ${tunnelURL}`);
        }
    });

    process.on('error', (err) => {
        console.error(`Error: ${err.message}`);
    });

    process.on('exit', (code) => {
        console.log(`Process exited with code ${code}`);
    });
};
