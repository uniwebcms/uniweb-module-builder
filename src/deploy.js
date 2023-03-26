const path = require('path');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;

const commitRepo = (module, version, repoDir) => {
    let output;

    // sync repo
    const pullCmd = 'git pull';
    output = execSync(`cd ${repoDir} && ${pullCmd}`, {
        encoding: 'utf-8',
    });
    console.log('Pull latest\n', output);

    // add and commit
    const git = `git add ${module}/${version} && git add ${module}/version.json && git add ${module}/latest_version.txt && git commit -m 'new ${module} build' && git push -u origin master`;
    output = execSync(`cd ${repoDir} && ${git}`, {
        encoding: 'utf-8',
    });
    console.log('Git actions:\n', output);
};

const copyDist = (module, version, __dirname, callback) => {
    const { OUTPUT_COPY_DIR } = process.env;

    if (!OUTPUT_COPY_DIR) {
        console.log('No OUTPUT_COPY_DIR provided, abort');
        return;
    }

    try {
        const source = path.resolve(__dirname, `../build_dev/${module}`);

        // copy and overwrite version.json
        fs.copySync(
            path.resolve(source, 'version.json'),
            path.resolve(OUTPUT_COPY_DIR, `${module}/version.json`)
        );
        // copy and overwrite latest_version.json
        fs.copySync(
            path.resolve(source, 'latest_version.txt'),
            path.resolve(OUTPUT_COPY_DIR, `${module}/latest_version.txt`)
        );
        // copy distribution files
        fs.copySync(
            path.resolve(source, version),
            path.resolve(OUTPUT_COPY_DIR, `${module}/${version}`)
        );

        if (callback) callback(module, version, OUTPUT_COPY_DIR);
    } catch (err) {
        console.error(err);
    }
};

module.exports = function deploy(__dirname, commit = false) {
    // const args = process.argv.slice(2);
    // const commit = args.includes('commit');

    const module = process.env.TARGET_COLLECTION;

    if (!module || !fs.existsSync(path.resolve(__dirname, '../src', module))) {
        console.log('no module specified or unable to find module, abort');

        return;
    }

    fs.readFile(
        path.resolve(__dirname, '../build_dev', module, 'latest_version.txt'),
        'utf8',
        (err, version) => {
            if (err) {
                console.log('failed to read latest version, abort');
            } else {
                copyDist(module, version, __dirname, commit ? commitRepo : null);
            }
        }
    );
};
