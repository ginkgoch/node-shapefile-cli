const command = require('../commands/showHeader');
const logs = require('./logs');

describe('show header command tests', () => {
    test('show header - default', async () => {
        await logs.execute({ }, 'header-default', command);
    });

    test('show header - pretty', async () => {
        await logs.execute({ pretty: true }, 'header-pretty', command);
    });
});