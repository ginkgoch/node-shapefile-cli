const fs = require('fs');
const command = require('../commands/convertGeoJson');
const logs = require('./logs');

describe('convert to geojson command tests', () => {
    test('convert to geojson - default', async () => {
        const defaultOutputPath = './tests/data/USStates.json';
        try {
            cleanDefaults(defaultOutputPath);
            await logs.execute({ }, 'convert-json-log-default', command, false);
            expect(fs.existsSync(defaultOutputPath)).toBeTruthy();
            
            const expectedContent = fs.readFileSync('./tests/output/convert-json-content-default.json');
            const actualContent = fs.readFileSync(defaultOutputPath);
            expect(actualContent).toEqual(expectedContent);
        }
        finally {
            cleanDefaults(defaultOutputPath);
        }
    });
});

function cleanDefaults(defaultOutputPath) {
    if (fs.existsSync(defaultOutputPath)) {
        fs.unlinkSync(defaultOutputPath);
    }
}