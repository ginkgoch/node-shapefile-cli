const command = require('../commands/showFields');
const logs = require('./logs');

describe('show fields command tests', () => {
    test('show fields - default', async () => {
        await logs.execute({ }, 'fields-default', command);
    });
    
    test('show fields - pretty', async () => {
        await logs.execute({ pretty: true }, 'fields-pretty', command);
    });
});