const fs = require('fs');
const path = require('path');
const readline = require('readline');

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

function prompt(question, defaultValue = null) {
    if (!question.endsWith(' ')) {
        question += ' ';
    }

    if (defaultValue !== null) {
        question += `(default: ${defaultValue}) `;
    }

    const rl = createInterface();
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim() || defaultValue);
        });
    });
}

function print(text) {
    console.log(text);
}

async function promptChoice(question, choices, defaultValue = null) {
    print(question + '\n');

    const options = [];

    for (let key in choices) {
        options.push(key);
        print(`${options.length}. ${choices[key]}`);
    }

    let tip = '';
    if (defaultValue !== null) {
        defaultValue = options.indexOf(defaultValue) + 1;
        tip = ` (default: ${defaultValue})`;
    }

    const answer = await prompt(`\nEnter the number of your choice${tip}: `);

    const index = parseInt(answer) - 1;
    return index >= 0 && index < options.length ? options[index] : defaultValue;
}

function getNewestModule(projectDir) {
    const srcDir = path.join(projectDir, 'src');

    if (!fs.existsSync(srcDir)) {
        return null;
    }

    const modules = fs
        .readdirSync(srcDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('_'))
        .map((dirent) => ({
            name: dirent.name,
            time: fs.statSync(path.join(srcDir, dirent.name)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

    return modules.length > 0 ? modules[0].name : null;
}

function validateModuleName(projectDir, name) {
    if (!name) {
        throw new Error('Module name cannot be empty');
    }
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
        throw new Error(
            'Module name must start with a letter and contain only letters and numbers'
        );
    }

    const modulePath = path.join(projectDir, 'src', name);
    if (fs.existsSync(modulePath)) {
        throw new Error(`A module named "${name}" already exists`);
    }
}

function validateComponentName(projectDir, moduleName, componentName) {
    if (!componentName) {
        throw new Error('Component name cannot be empty');
    }
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
        throw new Error(
            'Component name must start with a capital letter and contain only letters and numbers'
        );
    }

    const modulePath = path.join(projectDir, 'src', moduleName);
    if (!fs.existsSync(modulePath)) {
        throw new Error(`Module "${moduleName}" does not exist`);
    }

    const componentPath = path.join(modulePath, 'components', componentName);
    if (fs.existsSync(componentPath)) {
        throw new Error(
            `A component named "${componentName}" already exists in module "${moduleName}"`
        );
    }
}

async function promptForModuleInfo(projectDir, argv) {
    const info = { ...argv };

    let name = argv.name;
    while (!name) {
        name = await prompt('What is the name of your new module? ');
        try {
            validateModuleName(projectDir, name);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            name = null; // Reset name to prompt again
        }
    }

    const description =
        argv.description ||
        (await prompt('Provide a brief description for the module: ')) ||
        'A new component library';

    return { name, description };
}

async function promptForComponentInfo(projectDir, argv) {
    let name = argv.name;
    let moduleName = argv.module || getNewestModule(projectDir) || 'StarterLibrary';

    while (!name) {
        name = await prompt('What is the name of your component? ');
        try {
            validateComponentName(projectDir, moduleName, name);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            name = null; // Reset name to prompt again
        }
    }

    const type =
        argv.type ||
        (await promptChoice(
            'What type of component is this?',
            {
                section: 'Section',
                block: 'Block',
                element: 'Element',
            },
            'section'
        ));

    let exportType = argv.export ? 'export' : argv.config ? 'config' : argv.shared ? 'shared' : '';

    if (!exportType) {
        exportType = await promptChoice(
            'What type of use will it have?',
            {
                export: 'Export',
                config: 'Internal (with config)',
                plain: 'Internal (without config)',
                shared: 'Shared across modules',
            },
            'export'
        );
    }

    const description =
        argv.description ||
        (await prompt('Provide a brief description for the component: ')) ||
        'A new web component';

    const parameters =
        argv.parameters ||
        (await prompt('Define initial parameters (e.g., "align:string,items:number"): ')) ||
        '';

    return {
        name,
        module: moduleName,
        type,
        exportType,
        description,
        parameters,
    };
}

function createModuleStructure(projectDir, moduleName) {
    const modulePath = path.join(projectDir, 'src', moduleName);
    fs.mkdirSync(modulePath, { recursive: true });
    fs.mkdirSync(path.join(modulePath, 'components'), { recursive: true });
    return modulePath;
}

function createConfigYml(modulePath, moduleName, description) {
    const configContent = `name: ${moduleName}
description: ${description}
version: 1.0.0
author: Your Name
license: MIT
`;
    fs.writeFileSync(path.join(modulePath, 'config.yml'), configContent);
}

function createIndexJs(modulePath) {
    const indexContent = `// Export components here
`;
    fs.writeFileSync(path.join(modulePath, 'index.js'), indexContent);
}

function createIndexCss(modulePath) {
    const cssContent = `/* Add your module-specific styles here */
`;
    fs.writeFileSync(path.join(modulePath, 'index.css'), cssContent);
}

function createPackageJson(modulePath, moduleName) {
    const packageContent = `{
  "name": "${moduleName.toLowerCase()}",
  "version": "1.0.0",
  "description": "A web component library",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": ["uniweb", "module"],
  "author": "",
  "license": "MIT"
}
`;
    fs.writeFileSync(path.join(modulePath, 'package.json'), packageContent);
}

function createTailwindConfig(modulePath) {
    const tailwindContent = `module.exports = {
  content: ['./**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    fs.writeFileSync(path.join(modulePath, 'tailwind.config.js'), tailwindContent);
}

function createComponentFolder(projectDir, moduleName, componentName) {
    const componentPath = path.join(projectDir, 'src', moduleName, 'components', componentName);
    fs.mkdirSync(componentPath, { recursive: true });
    return componentPath;
}

function createComponentFile(componentPath, componentName, type) {
    const componentContent = `import React from 'react';

export default function ${componentName}(props) {
  // TODO: Implement ${componentName} ${type}
  return (
    <div>
      <h2>${componentName}</h2>
      <p>This is a new ${type} component.</p>
    </div>
  );
}
`;

    fs.writeFileSync(path.join(componentPath, 'index.js'), componentContent);
}

function createConfigFiles(componentPath, componentName, description, parameters, isExported) {
    const metaPath = path.join(componentPath, 'meta');
    fs.mkdirSync(metaPath, { recursive: true });

    const configContent = `label: ${componentName}
description: ${description}
export: ${isExported}
parameters:
${parameters
    .split(',')
    .map((param) => {
        const [name, type] = param.split(':');
        return `  - name: ${name}\n    type: ${type}\n    label: ${
            name.charAt(0).toUpperCase() + name.slice(1)
        }`;
    })
    .join('\n')}
`;

    fs.writeFileSync(path.join(metaPath, 'config.yml'), configContent);

    const notesContent = `# ${componentName}

${description}

## Usage

TODO: Add usage instructions for this component.

## Parameters

${parameters
    .split(',')
    .map((param) => {
        const [name, type] = param.split(':');
        return `- \`${name}\`: ${type}`;
    })
    .join('\n')}

## Examples

TODO: Add examples of how to use this component.
`;

    fs.writeFileSync(path.join(metaPath, 'notes.md'), notesContent);
}

function updateModuleIndex(projectDir, moduleName, componentName) {
    const indexPath = path.join(projectDir, 'src', moduleName, 'index.js');
    let indexContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';

    const exportStatement = `export { default as ${componentName} } from './components/${componentName}';`;

    if (!indexContent.includes(exportStatement)) {
        indexContent += `\n${exportStatement}`;
        fs.writeFileSync(indexPath, indexContent);
    }
}

///

async function createModule(projectDir, options) {
    validateModuleName(projectDir, options.name);

    const { name: moduleName, description } = options;

    const modulePath = createModuleStructure(projectDir, moduleName);
    createConfigYml(modulePath, moduleName, description);
    createIndexJs(modulePath);
    createIndexCss(modulePath);
    createPackageJson(modulePath, moduleName);
    createTailwindConfig(modulePath);

    print(`Module ${moduleName} created successfully!`);
    print(`You can start adding components to ${path.join(modulePath, 'components')}`);
}

async function createComponent(projectDir, options) {
    validateComponentName(projectDir, options.module, options.name);

    const { name: componentName, type, description, parameters } = options;
    let { module: moduleName } = options;

    if (!moduleName) {
        moduleName = getNewestModule(projectDir) || 'StarterLibrary';
    }

    const isExported = options.export || options.exportType === 'export';
    const hasConfig = isExported || options.config || options.exportType === 'config';

    const componentPath = createComponentFolder(projectDir, moduleName, componentName);
    createComponentFile(componentPath, componentName, type);

    if (hasConfig) {
        createConfigFiles(componentPath, componentName, description, parameters, isExported);
    }

    if (isExported) {
        updateModuleIndex(projectDir, moduleName, componentName);
    }

    print(`Component ${componentName} created successfully in module ${moduleName}!`);
}

module.exports = {
    createModule,
    createComponent,
    promptForModuleInfo,
    promptForComponentInfo,
};
