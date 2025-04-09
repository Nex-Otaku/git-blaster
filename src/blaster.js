const lib = require('./lib');
const _ = require('lodash');
const {sleep} = require("./lib");
const shell = require('./shell');

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

const showStatus = async (shellOutputData = null) => {
    console.log(getCurrentDirectory());
    console.log('');

    if (shellOutputData !== null) {
        console.log('------------------------------');
        console.log(shellOutputData.stdOutput);

        if (shellOutputData.stderrOutput !== '') {
            console.error(shellOutputData.stderrOutput);
        }

        console.log('------------------------------');
    }

    const gitStatusText = await gitStatus();
    console.log(gitStatusText);
}

const updateOnShellOutputCallback = async (data) => {
    await showStatus(data);
}

shell.setup(updateOnShellOutputCallback, false);

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

const inputCommitMessage = async () => {
    return (await inquirer.prompt({
        name: 'commitMessage',
        type: 'input',
        message: 'Описание:',
        default: '',
        validate: function( value ) {
            if (value.length) {
                return true;
            } else {
                return 'Пожалуйста введите описание коммита';
            }
        }
    })).commitMessage;
};

const commit = async () => {
    const hasChanges = await gitHasChanges();

    if (!hasChanges) {
        console.log('Нет изменений, нечего коммитить');
        await lib.sleep(1);

        return;
    }

    const commitMessage = await inputCommitMessage();
    await gitAdd('.');
    await gitCommit(commitMessage);
    await gitPush();
};

const gitStatus = async () => {
    const command = 'git status';

    return (await shell.run(command));
};

const gitPull = async () => {
    const command = 'git pull';

    await shell.run(command);
}

const gitPush = async () => {
    const command = 'git push';

    await shell.run(command);
}

const gitHasChanges = async () => {
    const command = 'git status --porcelain';
    const output = await shell.run(command);

    return output !== '';
}

const getBranches = async () => {
    const command = 'git branch --list --no-color';

    const list = await shell.run(command);

    return list.split("\n");
}

const gitAdd = async (path) => {
    const command = 'git add ' + path;

    await shell.run(command);
}

const gitCommit = async (message) => {
    const command = 'git commit -m "' + message + '"';

    await shell.run(command);
}

const gitCheckoutBranch = async (branch) => {
    const command = 'git checkout ' + branch;

    await shell.run(command);
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
    await gitPull();
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