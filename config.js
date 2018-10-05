const chalk = require('chalk');

module.exports = {
    PORT: process.env.PORT || 4000,
    announce: text => console.log(chalk.green(text)),
    isDev: () => process.env.NODE_ENV === 'development'
};