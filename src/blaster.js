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

const getLocalBranches = async () => {
    const command = 'git branch --list --no-color';

    const list = await shell.run(command);

    return list.split("\n").map(line => line.replaceAll('*', '').trim());
}

const getLocalBranchesWithoutCurrent = async () => {
    const branches = await getLocalBranches();
    const currentBranch = await getCurrentBranch();

    return branches.filter(item => item !== currentBranch);
}

const getRemoteBranches = async () => {
    const command = 'git branch --list -r --no-color';

    const list = await shell.run(command);

    return list.split("\n").map(line => line.replaceAll('*', '').trim());
}

const gitAdd = async (path) => {
    const command = 'git add ' + path;

    await shell.run(command);
}

const gitCommit = async (message) => {
    const escapedMessage = message.replaceAll('"', '\\"');
    const command = 'git commit -m "' + escapedMessage + '"';

    await shell.run(command);
}

const gitCheckoutBranch = async (branch) => {
    const command = 'git checkout ' + branch;

    await shell.run(command);
}

const gitNewBranch = async (branch) => {
    await shell.run('git checkout -b ' + branch);
    await shell.run('git push -u origin ' + branch);
}

const gitMergeBranch = async (branch) => {
    await shell.run('git merge ' + branch);
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

const getCurrentBranch = async () => {
    const command = 'git branch --show-current';

    const output = await shell.run(command);

    return output.trim();
}

const switchBranch = async () => {
    const branches = await getLocalBranchesWithoutCurrent();
    const branch = await selectBranch('Выберите ветку для переключения', branches);

    if (branch === '') {
        console.log('Не переключаемся');

        return;
    }

    await gitCheckoutBranch(branch);
    await gitPull();
    console.log('Переключились в ветку "' + branch + '"');
}

const inputNewBranchName = async () => {
    return (await inquirer.prompt({
        name: 'branchName',
        type: 'input',
        message: 'Имя новой ветки:',
        default: '',
    })).branchName;
};

const mergeBranch = async () => {
    const branches = await getLocalBranchesWithoutCurrent();
    const mergedBranch = await selectBranch('Выберите ветку для слияния', branches);

    if (mergedBranch === '') {
        console.log('Не выполняем слияние');

        return;
    }

    const currentBranch = await getCurrentBranch();
    await gitPull();
    await gitCheckoutBranch(mergedBranch);
    await gitPull();
    await gitCheckoutBranch(currentBranch);
    await gitMergeBranch(mergedBranch);
    await gitPush();
    console.log('В ветку "' + currentBranch + '" влиты изменения из ветки "' + mergedBranch + '"');
}

const newBranch = async () => {
    const newBranchName = await inputNewBranchName();

    const localBranches = await getLocalBranches();

    if (localBranches.includes(newBranchName)) {
        console.log('Ветка с таким именем уже существует локально');

        return;
    }

    await gitPull();
    const remoteBranches = await getRemoteBranches();
    const remoteBranchExpected = 'origin/' + newBranchName;

    if (remoteBranches.includes(remoteBranchExpected)) {
        console.log('Ветка с таким именем уже существует удалённо в origin');

        return;
    }

    await gitNewBranch(newBranchName);
    console.log('Создана ветка "' + newBranchName + '"');
}

module.exports = {
    // Задачи:
    // 1. Stage + Commit (Message) + Push
    commit: commit,
    // 2. Deploy (bash)
    deployDev: deployDev,
    // 3. Swith branch + Pull
    switchBranch: switchBranch,
    // 4. Новая ветка
    mergeBranch: mergeBranch,
    // 5. Новая ветка
    newBranch: newBranch,

    // UI
    setInquirer: setInquirer,
    setChalk: setChalk,
    showStatus: showStatus,
};