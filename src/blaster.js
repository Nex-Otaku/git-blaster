const lib = require('./lib');
const _ = require('lodash');

let chalk = null;
let inquirer = null;

const setInquirer = (inquirerInstance) => {
    inquirer = inquirerInstance;
}

const setChalk = (chalkInstance) => {
    chalk = chalkInstance;
}

const getCurrentDirectory = () => {
    return process.cwd();
};

const showStatus = () => {
    // TODO
    // Показать назакомиченные изменения если есть.
    console.log(getCurrentDirectory());
    console.log('Статус: OK');
}

const selectAction = async (actions, promptMessage) => {
    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: promptMessage,
            choices: actions,
            pageSize: 50
        }
    ]);
    lib.newline();

    return results.action;
};

const commit = async () => {
    // TODO
};

const deployDev = async () => {
    // TODO
};

module.exports = {
    // Задачи:
    // 1. Stage + Commit (Message) + Push
    commit: commit,
    // 2. Deploy (bash)
    deployDev: deployDev,
    // 3. Ignore?
    // 4. View changed files: git status!!! В строке статуса

    // UI
    setInquirer: setInquirer,
    setChalk: setChalk,
    showStatus: showStatus,
};