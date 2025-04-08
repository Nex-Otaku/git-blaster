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

const gitPull = async () => {
    const command = 'git pull';

    await lib.shellRun(command);
}

const getBranches = async () => {
    const command = 'git branch --list --no-color';

    const list = await lib.shellRun(command);

    return list.split("\n");
}

const gitCheckoutBranch = async (branch) => {
    const command = 'git checkout ' + branch;

    await lib.shellRun(command);
}

const deployDev = async () => {
    // TODO
};

const selectBranch = async (prompt, branches) => {
    const branchesCopy = [].concat(branches);
    branchesCopy.push(' -- cancel');

    const result = await inquirer.prompt([
        {
            type: 'list',
            name: 'branch',
            message: prompt,
            choices: branchesCopy,
            pageSize: 30,
        }
    ]);

    if (result.branch === ' -- cancel') {
        return '';
    }

    return result.branch;
};

const switchBranch = async () => {
    await gitPull();
    const branches = await getBranches();
    const branch = await selectBranch('Выберите ветку для переключения', branches);

    if (branch === '') {
        console.log('Не переключаемся');

        return;
    }

    await gitCheckoutBranch(branch);
    console.log('Переключились в ветку "' + branch + '"');
}

module.exports = {
    // Задачи:
    // 1. Stage + Commit (Message) + Push
    commit: commit,
    // 2. Deploy (bash)
    deployDev: deployDev,
    // 3. Swith branch + Pull
    switchBranch: switchBranch,
    // 5. View changed files: git status!!! В строке статуса

    // UI
    setInquirer: setInquirer,
    setChalk: setChalk,
    showStatus: showStatus,
};