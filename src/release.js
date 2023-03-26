const path = require('path');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;

const commit = (module, version) => {
    let output;

    // sync repo
    output = execSync(`git pull`, {
        encoding: 'utf-8',
    });
    console.log('Pull latest\n', output);

    // add and commit
    const git = `git add ../dist/${module}/${version} && git add ../dist/${module}/version.json && git add ../dist/${module}/latest_version.txt && git commit -m 'new ${module} build' && git push -u origin master`;

    output = execSync(git, {
        encoding: 'utf-8',
    });
    console.log('Git actions:\n', output);
};

module.exports = function release(__dirname) {
    const module = process.env.TARGET_COLLECTION;

    if (!module || !fs.existsSync(path.resolve(__dirname, '../src', module))) {
        console.log('no module specified or unable to find module, abort');

        return;
    }

    fs.readFile(
        path.resolve(__dirname, '../dist', module, 'latest_version.txt'),
        'utf8',
        (err, version) => {
            if (err) {
                console.log('failed to read latest version, abort');
            } else {
                commit(module, version);
            }
        }
    );
};
