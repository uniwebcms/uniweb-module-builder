const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const webpack = require('webpack');

class YamlSchemaPlugin {
    constructor(options = {}) {
        this.options = {
            srcDir: '../src',
            output: 'schema.json',
            ...options,
        };
    }

    apply(compiler) {
        // Get Webpack's infrastructure logger
        const logger = compiler.getInfrastructureLogger('YamlToSchemaPlugin');

        compiler.hooks.thisCompilation.tap('YamlSchemaPlugin', (compilation) => {
            compilation.hooks.processAssets.tapAsync(
                {
                    name: 'YamlSchemaPlugin',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                (assets, callback) => {
                    const schema = {};
                    const srcDir = path.resolve(compiler.context, this.options.srcDir);

                    const files = findYmlFiles(srcDir);

                    files.forEach((file) => {
                        try {
                            const content = fs.readFileSync(file, 'utf8');
                            const data = yaml.load(content);
                            const componentName = path.basename(path.dirname(path.dirname(file)));
                            schema[componentName] = data;
                        } catch (err) {
                            compilation.errors.push(
                                new Error(`Error processing ${file}: ${err.message}`)
                            );
                        }
                    });

                    const schemaJson = JSON.stringify(schema, null, 2);
                    compilation.emitAsset(
                        this.options.output,
                        new webpack.sources.RawSource(schemaJson)
                    );

                    callback();
                }
            );
        });
    }
}

// A function to recursively search for .yml files in a directory
function findYmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir); // Read all files in the directory

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath); // Get file info (e.g., whether it's a file or directory)

        if (stat.isDirectory()) {
            // If it's a directory, recurse into it
            findYmlFiles(filePath, fileList);
        } else if (path.extname(file) === '.yml') {
            // If it's a .yml file, add it to the list
            fileList.push(filePath);
        }
    });

    return fileList;
}

module.exports = YamlSchemaPlugin;
