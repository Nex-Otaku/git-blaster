#!/usr/bin/env node

const clear = require('clear');
const figlet = require('figlet');
const _ = require('lodash');

const lib = require('./src/lib');
const blaster = require('./src/blaster');

let chalk = null;
let inquirer = null;

const printHeader = async () => {
    console.log(
        chalk.yellow(
            figlet.textSync('Git Blaster', { horizontalLayout: 'full' })
        )
    );

    lib.newline();
    blaster.showStatus();
    lib.newline();
};

const selectAction = async (actions) => {
    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Выберите действие',
            choices: actions,
            pageSize: 50
        }
    ]);
    lib.newline();

    return results.action;
};

const mainLoop = async () => {
    chalk = (await import('chalk')).default;
    blaster.setChalk(chalk);
    inquirer = (await import('inquirer')).default;
    blaster.setInquirer(inquirer);

    let running = true;
    while (running) {
        clear();
        await printHeader();
        let needToWait = false;

        const selectedAction = await selectAction([
            'Коммит',
            'Выкатить на DEV сервер',
            new inquirer.Separator(),
            'Выйти',
        ]);

        if (selectedAction === 'Коммит') {
            await blaster.commit();
        }

        if (selectedAction === 'Выкатить на DEV сервер') {
            await blaster.deployDev();
            needToWait = true;
        }

        if (selectedAction === 'Выйти') {
            running = false;
        }

        if (running && needToWait) {
            await lib.keypress();
        }
    }
};

mainLoop().then();