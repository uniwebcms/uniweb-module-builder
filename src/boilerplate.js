const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Handlebars = require('handlebars');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

function loadTemplate(templatePath) {
    const template = fs.readFileSync(templatePath, 'utf8');
    return Handlebars.compile(template);
}

function createFileFromTemplate(templatePath, targetPath, data) {
    const template = loadTemplate(templatePath);
    const content = template(data);
    fs.writeFileSync(targetPath, content);
}

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
    let index = null;

    if (defaultValue !== null) {
        index = options.indexOf(defaultValue) + 1;
        tip = ` (default: ${index})`;
    }

    const answer = (await prompt(`\nEnter the number of your choice${tip}: `)) || index;

    index = parseInt(answer) - 1;
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

function updateModuleIndex(projectDir, moduleName, componentName) {
    const indexPath = path.join(projectDir, 'src', moduleName, 'index.js');
    let indexContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';

    const exportStatement = `export { default as ${componentName} } from './components/${componentName}';`;

    if (!indexContent.includes(exportStatement)) {
        indexContent += `\n${exportStatement}`;
        fs.writeFileSync(indexPath, indexContent);
    }
}

function parseParameters(parameters = '') {
    const list = [];

    parameters
        .replace(/^"|"$/g, '')
        .split(',')
        .map((param) => {
            const [name, type] = param.split(':');
            if (name && type) {
                const label = name.charAt(0).toUpperCase() + name.slice(1);
                list.push({ name, type, label });
            }
        });

    return list;
}

async function createModule(projectDir, options) {
    validateModuleName(projectDir, options.name);

    const { name: moduleName, description, author } = options;
    const modulePath = path.join(projectDir, 'src', moduleName);
    fs.mkdirSync(modulePath, { recursive: true });

    const templateFiles = [
        'config.yml',
        'index.js',
        'index.css',
        'package.json',
        'tailwind.config.js',
    ];

    templateFiles.forEach((file) => {
        const templatePath = path.join(TEMPLATES_DIR, 'module', `${file}.hbs`);
        const targetPath = path.join(modulePath, file);
        createFileFromTemplate(templatePath, targetPath, { name: moduleName, description, author });
    });

    console.log(`Module ${moduleName} created successfully!`);
}

async function createComponent(projectDir, options) {
    validateComponentName(projectDir, options.module, options.name);

    const { name: componentName, module: moduleName, type, description, parameters } = options;
    const componentPath = path.join(projectDir, 'src', moduleName, 'components', componentName);
    fs.mkdirSync(componentPath, { recursive: true });

    // Create main component file
    const componentTemplatePath = path.join(TEMPLATES_DIR, 'component', 'index.js.hbs');
    const componentTargetPath = path.join(componentPath, 'index.js');
    createFileFromTemplate(componentTemplatePath, componentTargetPath, {
        name: componentName,
        type,
    });

    const isExported = options.export || options.exportType === 'export';
    const hasConfig = isExported || options.config || options.exportType === 'config';

    console.log('Ops', hasConfig, options);

    // Create meta files if needed
    if (hasConfig) {
        const metaPath = path.join(componentPath, 'meta');
        fs.mkdirSync(metaPath, { recursive: true });

        const metaFiles = ['config.yml', 'notes.md'];
        metaFiles.forEach((file) => {
            const templatePath = path.join(TEMPLATES_DIR, 'component', 'meta', `${file}.hbs`);
            const targetPath = path.join(metaPath, file);
            createFileFromTemplate(templatePath, targetPath, {
                name: componentName,
                description,
                isExported,
                parameters: parseParameters(parameters),
            });
        });
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
