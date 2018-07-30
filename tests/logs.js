const fs = require('fs');
const path = require('path');

module.exports = {
    testEnv: async function(action) {
        return await new Promise(async res => {
            let outputData = '';
            const storeLog = inputs => (outputData += inputs + '\n');
            console['log'] = jest.fn(storeLog);
    
            await action();

            return res(outputData);
        });
    },

    execute: async function (option, expectedFilename, command, save = false) {
        const output = await this.testEnv(async () => {
            const file = path.join(__dirname, 'data/USStates.shp');
            const cmd = option;
            await command(file, cmd);
        });
        
        const expectedFile = path.join(__dirname, `output/${expectedFilename}.txt`);
        if (save) {
            fs.writeFileSync(expectedFile, output, { encoding: 'utf8' });
        }

        expect(output).toEqual(fs.readFileSync(expectedFile, { encoding: 'utf8' }));
    }
}