const fs = require('fs');
const path = require('path');

/**
 * CleanOldBuildsAndLogPlugin
 *
 * This Webpack plugin:
 * - Cleans up old build folders (identified by UUID)
 * - Keeps a specified number of recent builds
 * - Creates a 'latest_version.txt' file with the current build UUID
 * - Logs the public URL of the application after a successful build
 */
class CleanOldBuildsAndLogPlugin {
    /**
     * @param {Object} options - Plugin options
     * @param {string} options.outputPath - The path to the output directory
     * @param {string} options.publicUrl - The public URL of the application
     * @param {string} options.currentBuildUuid - The UUID of the current build
     * @param {number} options.keepBuilds - Number of recent builds to keep (default: 5)
     */
    constructor(options) {
        this.options = options;
        if (!this.options.outputPath || !this.options.publicUrl || !this.options.currentBuildUuid) {
            throw new Error(
                'CleanOldBuildsAndLogPlugin requires outputPath, publicUrl, and currentBuildUuid options'
            );
        }
        this.options.keepBuilds = this.options.keepBuilds || 5;
    }

    apply(compiler) {
        const logger = compiler.getInfrastructureLogger('CleanOldBuildsAndLogPlugin');

        compiler.hooks.done.tap('CleanOldBuildsAndLogPlugin', (stats) => {
            if (stats.compilation.errors.length === 0) {
                this.cleanOldBuilds(logger);
                this.createLatestVersionFile(logger);
                this.logSuccess(logger);
            } else {
                this.logError(logger);
            }
        });
    }

    cleanOldBuilds(logger) {
        const buildFolders = fs
            .readdirSync(this.options.outputPath)
            .filter((folder) => {
                const folderPath = path.join(this.options.outputPath, folder);
                return (
                    fs.statSync(folderPath).isDirectory() &&
                    folder !== this.options.currentBuildUuid
                );
            })
            .sort((a, b) => {
                return (
                    fs.statSync(path.join(this.options.outputPath, b)).mtime.getTime() -
                    fs.statSync(path.join(this.options.outputPath, a)).mtime.getTime()
                );
            });

        if (buildFolders.length > this.options.keepBuilds - 1) {
            buildFolders.slice(this.options.keepBuilds - 1).forEach((folder) => {
                const folderPath = path.join(this.options.outputPath, folder);
                this.deleteFolderRecursive(folderPath);
                logger.info(`Cleaned old build: ${folder}`);
            });
        }
    }

    createLatestVersionFile(logger) {
        const latestVersionPath = path.join(this.options.outputPath, 'latest_version.txt');
        fs.writeFileSync(latestVersionPath, this.options.currentBuildUuid);
        logger.info(`Created latest_version.txt with UUID: ${this.options.currentBuildUuid}`);
    }

    deleteFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach((file) => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath);
        }
    }

    logSuccess(logger) {
        const cleanUrl = this.cleanPublicUrl();
        logger.info('Build completed successfully!');
        logger.info('Your component library is available at:');
        logger.info('\x1b[1m\x1b[34m%s\x1b[0m', cleanUrl); // Bold blue text
        // logger.info(
        //     'You can Ctrl+Click (cmd+click on Mac) the URL to open it in your default browser.'
        // );
        // logger.info(`Latest build UUID: ${this.options.currentBuildUuid}`);
        // logger.info('This UUID is also available in latest_version.txt in the output directory.\n');
    }

    logError(logger) {
        logger.error('Webpack build encountered errors. Public URL not available.');
    }

    cleanPublicUrl() {
        return this.options.publicUrl
            .replace(new RegExp(`/${this.options.currentBuildUuid}/|/+$`, 'g'), '/')
            .replace(/\/+$/, '');
    }
}

module.exports = CleanOldBuildsAndLogPlugin;
