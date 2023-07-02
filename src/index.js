const getConfigData = require('./webpackHelper');
const release = require('./release');
const deploy = require('./deploy');
const tunnel = require('./tunnel');

module.exports = { getConfigData, release, deploy, tunnel };
