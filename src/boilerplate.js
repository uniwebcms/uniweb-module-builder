const fs = require('fs');
const path = require('path');
const readline = require('readline');

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

function prompt(question) {
    const rl = createInterface();
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function promptChoice(question, choices) {
    console.log(question);
    choices.forEach((choice, index) => {
        console.log(`${index + 1}. ${choice}`);
    });
    const answer = await prompt('Enter the number of your choice: ');
    const index = parseInt(answer) - 1;
    return index >= 0 && index < choices.length ? choices[index] : null;
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

async function promptForModuleInfo(argv) {
    const info = { ...argv };

    if (!info.name) {
        info.name = await prompt('What is the name of your new module? ');
    }

    if (!info.description) {
        info.description =
            (await prompt('Provide a brief description for the module: ')) ||
            'A web component library';
    }

    return info;
}

async function promptForComponentInfo(argv) {
    const info = { ...argv };

    if (!info.name) {
        info.name = await prompt('What is the name of your component? ');
    }

    if (!info.export && !info.config) {
        const exportType = await promptChoice('How should this component be created?', [
            'Exportable component',
            'Non-exported but with meta files',
            'Non-exported, plain component',
            'Shared component (in _shared folder)',
        ]);
        info.exportType = ['export', 'config', 'plain', 'shared'][exportType] || 'plain';
    }

    if (!info.module) {
        const defaultModule = getNewestModule(process.cwd()) || 'StarterLibrary';
        info.module =
            (await prompt(
                `In which module should the component be created? (default: ${defaultModule}) `
            )) || defaultModule;
    }

    if (!info.type) {
        info.type =
            (await promptChoice('What type of component is this?', [
                'section',
                'block',
                'element',
            ])) || 'section';
    }

    if (!info.description) {
        info.description =
            (await prompt('Provide a brief description for the component: ')) ||
            'A new web component';
    }

    if (!info.parameters) {
        info.parameters =
            (await prompt('Define initial parameters (e.g., "align:string,items:number"): ')) || '';
    }

    return info;
}

///

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
    console.log('projectDir', projectDir);
    const componentPath = path.join(projectDir, 'src', moduleName, 'components', componentName);
    console.log('componentPath', componentPath);
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
    const { name: moduleName, description } = options;

    const modulePath = createModuleStructure(projectDir, moduleName);
    createConfigYml(modulePath, moduleName, description);
    createIndexJs(modulePath);
    createIndexCss(modulePath);
    createPackageJson(modulePath, moduleName);
    createTailwindConfig(modulePath);

    console.log(`Module ${moduleName} created successfully!`);
    console.log(`You can start adding components to ${path.join(modulePath, 'components')}`);
}

async function createComponent(projectDir, options) {
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

    console.log(`Component ${componentName} created successfully in module ${moduleName}!`);
}

module.exports = {
    createModule,
    createComponent,
    promptForModuleInfo,
    promptForComponentInfo,
};
