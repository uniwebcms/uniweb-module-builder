const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

class ManifestGeneratorPlugin {
    constructor(options = {}) {
        this.options = {
            filename: 'manifest.json',
            projectPath: undefined, // Path to the project being built
            ...options,
        };
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('ManifestGeneratorPlugin', (compilation) => {
            compilation.hooks.processAssets.tapAsync(
                {
                    name: 'ManifestGeneratorPlugin',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                (assets, callback) => {
                    let version = 'unknown';

                    if (this.options.projectPath) {
                        const packageJsonPath = path.join(this.options.projectPath, 'package.json');
                        try {
                            const packageJson = JSON.parse(
                                fs.readFileSync(packageJsonPath, 'utf8')
                            );
                            version = packageJson.version;
                        } catch (error) {
                            compilation.warnings.push(
                                new Error(
                                    `ManifestGeneratorPlugin: Error reading ${packageJsonPath}: ${error.message}`
                                )
                            );
                        }
                    }

                    const manifest = {
                        version,
                        generatedAt: new Date().toISOString(),
                        files: [],
                    };

                    for (const filename in compilation.assets) {
                        if (filename !== this.options.filename) {
                            const file = compilation.assets[filename];
                            manifest.files.push({
                                name: filename,
                                size: file.size(),
                                hash: compilation.hash,
                            });
                        }
                    }

                    const manifestContent = JSON.stringify(manifest, null, 2);
                    compilation.emitAsset(
                        this.options.filename,
                        new webpack.sources.RawSource(manifestContent)
                    );

                    callback();
                }
            );
        });
    }
}

module.exports = ManifestGeneratorPlugin;
