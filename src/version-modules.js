// scripts/version-modules.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const MODULES_DIR = path.join(__dirname, '../src');

function getModuleDirs() {
    return fs
        .readdirSync(MODULES_DIR)
        .filter((file) => fs.statSync(path.join(MODULES_DIR, file)).isDirectory())
        .filter((dir) => fs.existsSync(path.join(MODULES_DIR, dir, 'package.json')));
}

function updateVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);

    switch (type) {
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'major':
            return `${major + 1}.0.0`;
        default:
            throw new Error(`Invalid version type: ${type}`);
    }
}

async function selectModule(modules) {
    if (modules.length === 0) {
        throw new Error('No modules found in src directory');
    }

    if (modules.length === 1) {
        return modules[0];
    }

    // If module name was provided as argument, use it
    const providedModule = process.argv[3];
    if (providedModule) {
        if (!modules.includes(providedModule)) {
            throw new Error(`Module "${providedModule}" not found`);
        }
        return providedModule;
    }

    // Interactive module selection
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('\nAvailable modules:');
    modules.forEach((module, index) => {
        console.log(`${index + 1}. ${module}`);
    });

    const answer = await new Promise((resolve) => {
        rl.question('\nSelect module number: ', resolve);
    });

    rl.close();

    const selection = parseInt(answer) - 1;
    if (isNaN(selection) || selection < 0 || selection >= modules.length) {
        throw new Error('Invalid selection');
    }

    return modules[selection];
}

function updateModuleVersion(moduleDir, versionType) {
    const packageJsonPath = path.join(MODULES_DIR, moduleDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const oldVersion = packageJson.version;
    const newVersion = updateVersion(oldVersion, versionType);

    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return {
        name: moduleDir,
        oldVersion,
        newVersion,
    };
}

function createCommit(update) {
    const { name, oldVersion, newVersion } = update;
    const commitMessage = `Update ${name} version: ${oldVersion} → ${newVersion}`;

    // Stage package.json change
    execSync(`git add "src/${name}/package.json"`);

    // Create commit
    execSync(`git commit -m "${commitMessage}"`);

    // Create tag
    const tagName = `${name}/v${newVersion}`;
    execSync(`git tag -a ${tagName} -m "Version ${newVersion} of ${name}"`);
}

async function main() {
    const versionType = process.argv[2];
    const shouldPush = process.argv.includes('--push');

    if (!['major', 'minor', 'patch'].includes(versionType)) {
        console.error('Please specify version type: major, minor, or patch');
        process.exit(1);
    }

    try {
        // Check for uncommitted changes
        try {
            execSync('git diff-index --quiet HEAD --');
        } catch (error) {
            console.error('You have uncommitted changes. Please commit or stash them first.');
            process.exit(1);
        }

        const moduleDirs = getModuleDirs();
        const selectedModule = await selectModule(moduleDirs);
        const update = updateModuleVersion(selectedModule, versionType);

        createCommit(update);

        console.log(
            `\nSuccessfully updated ${update.name} from ${update.oldVersion} to ${update.newVersion}`
        );

        if (shouldPush) {
            console.log('\nPushing changes and tags to remote...');
            execSync('git push && git push --tags');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();

/*
{
  "scripts": {
    "version:patch": "node scripts/version-modules.js patch",
    "version:minor": "node scripts/version-modules.js minor",
    "version:major": "node scripts/version-modules.js major",
    "push:patch": "node scripts/version-modules.js patch --push",
    "push:minor": "node scripts/version-modules.js minor --push",
    "push:major": "node scripts/version-modules.js major --push"
  }
}
*/
