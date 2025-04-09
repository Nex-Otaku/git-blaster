const {spawn} = require('child_process');
const quote = require('shell-quote').parse;

let outputCalback = null;
let echoOutput = true;

const setup = (
    shellOutputCalback,
    echo
) => {
    outputCalback = shellOutputCalback;
    echoOutput = echo;
}

const run = async (command) => {
    const parsed = quote(command);
    const parsedCommand = parsed[0];
    const args = parsed.slice(1);

    const result = await execCommand(parsedCommand, args);

    if (result.exitCode !== 0) {
        throw new Error(result.stderrOutput);
    }

    return result.stdOutput;
};

/**
 * Выполняет команду в командной строке Linux с постоянным выводом stdout и stderr
 * @param {string} command - Команда для выполнения
 * @param {string[]} args - Аргументы команды
 * @returns {Promise<{exitCode: number, stderrOutput: string, stdOutput: string}>} - Результат выполнения
 */
const execCommand = async (command, args = []) => {
    return new Promise((resolve) => {
        const process = spawn(command, args);
        let stderrOutput = '';
        let stdOutput = '';

        // Вывод stdout в реальном времени
        process.stdout.on('data', async (data) => {
            const text = data.toString();

            if (echoOutput) {
                console.log(text);
            }

            stdOutput += text;

            await outputCalback({
                stderr: stderrOutput,
                stdout: stdOutput
            })
        });

        // Вывод stderr в реальном времени и сохранение для проверки
        process.stderr.on('data', async (data) => {
            const text = data.toString();

            if (echoOutput) {
                console.error(text);
            }

            stderrOutput += text;

            await outputCalback({
                stderr: stderrOutput,
                stdout: stdOutput
            })
        });

        // Обработка завершения процесса
        process.on('close', (exitCode) => {
            resolve({
                exitCode: exitCode || 0,
                stderr: stderrOutput.trim(),
                stdout: stdOutput
            });
        });

        // Обработка ошибок запуска процесса
        process.on('error', (error) => {
            console.error('Ошибка при выполнении команды:', error.message);
            resolve({
                exitCode: 1,
                stderr: error.message,
                stdout: stdOutput
            });
        });
    });
};

module.exports = {
    setup: setup,
    run: run,
    execCommand: execCommand,
}
;