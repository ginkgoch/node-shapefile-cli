const fs = require('fs');
const path = require('path');
const command = require('../commands/showHeader');
const logs = require('./logs');

describe('show header command tests', () => {
    test('show header - default', async () => {
        const output = await logs.testEnv(async () => {
            const file = path.join(__dirname, 'data/USStates.shp');
            const cmd = { };
            await command(file, cmd);
        });

        const expectedFile = path.join(__dirname, 'data/header-default.txt');
        // fs.writeFileSync(expectedFile, output, { encoding: 'utf8' });
        expect(output).toEqual(fs.readFileSync(expectedFile, { encoding: 'utf8' }));
    });

    test('show header - pretty', async () => {
        const output = await logs.testEnv(async () => {
            const file = path.join(__dirname, 'data/USStates.shp');
            const cmd = { pretty: true };
            await command(file, cmd);
        });

        const expectedFile = path.join(__dirname, 'data/header-pretty.txt');
        expect(output).toEqual(fs.readFileSync(expectedFile, { encoding: 'utf8' }));
    });
});