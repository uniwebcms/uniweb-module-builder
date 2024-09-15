const path = require('path');
const webpack = require('webpack');

class ManifestGeneratorPlugin {
    constructor(options = {}) {
        this.options = {
            filename: 'manifest.json',
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
                    const manifest = {
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
