const fs = require('fs');

const directoryExists = (filePath) => {
    let exists = false;

    try {
        const isSymlink = fs.existsSync(filePath) && fs.lstatSync(filePath).isSymbolicLink();

        if (!isSymlink) {
            exists = fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
        } else {
            const linkPath = fs.realpathSync(filePath);
            exists = fs.existsSync(linkPath) && fs.lstatSync(linkPath).isDirectory();
        }
    } catch (error) {
        return false;
    }

    return exists;
};

const fileExists = (filePath) => {
    return fs.existsSync(filePath) && !directoryExists(filePath);
};

const readFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
};

const writeFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

module.exports = {
    directoryExists: directoryExists,
    fileExists: fileExists,
    readFile: readFile,
    writeFile: writeFile,
};