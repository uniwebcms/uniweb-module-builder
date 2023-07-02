const { spawn } = require('child_process');

module.exports = function createTunnel(port = 3005) {
    return new Promise((resolve, reject) => {
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

            console.log(output);

            const regex = /https:\/\/.*?\.trycloudflare\.com/g;
            const match = regex.exec(output);

            if (match) {
                const tunnelURL = match[0];
                // console.log(`Tunnel URL: ${tunnelURL}`);
                resolve(tunnelURL);
            }
        });

        process.on('error', (err) => {
            console.error(`Error: ${err.message}`);
            reject(err);
        });

        process.on('exit', (code) => {
            console.log(`Process exited with code ${code}`);
            if (code !== 0) {
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        // process.on('close', (code) => {
        //     if (code !== 0) {
        //         // Reject the promise if the process closes with a non-zero code
        //         reject(new Error(`Process closed with code ${code}`));
        //     }
        // });

        // Listen for SIGINT event in the parent process
        process.on('SIGINT', () => {
            console.log('Process received SIGINT signal');

            // Kill the child process
            // childProcess.kill();

            // Perform any necessary cleanup or additional actions
            // ...

            // Exit the parent process
            process.exit();
        });
    });
};
