const fs = require('fs'), os = require('os'), path = require('path'), axios = require('axios'), chalk = require('chalk'), cfonts = require('cfonts')
const { spawn } = require('child_process')
const linguagem = require('./menus.js')
const mess = require('./global.js')
const main = require('./main.js')


const banner1 = chalk.cyanBright(`
██████╗ ██╗ █████╗ ██████╗ ██╗      ██████╗
██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔═══██╗
██║  ██║██║███████║██████╔╝██║     ██║   ██║
██║  ██║██║██╔══██║██╔══██╗██║     ██║   ██║
██████╔╝██║██║  ██║██████╔╝███████╗╚██████╔╝
╚═════╝ ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝ ╚═════╝

        ██████╗  █████╗ ███████╗███████╗
        ██╔══██╗██╔══██╗██╔════╝██╔════╝
        ██████╔╝███████║███████╗█████╗
        ██╔══██╗██╔══██║╚════██║██╔══╝
        ██████╔╝██║  ██║███████║███████╗
        ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
`)

const banner2 = chalk.blueBright.bold('dylan modz')

module.exports = {
fs, os, path, axios, chalk, cfonts, spawn,
linguagem, mess, main,
...main,
banner1, banner2
}