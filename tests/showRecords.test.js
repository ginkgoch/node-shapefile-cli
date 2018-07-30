const command = require('../commands/showRecords');
const logs = require('./logs');

const updateOutput = false;
describe('show records command tests', () => {
    test('show records - default', async () => {
        await logs.execute({ }, 'records-default', command, updateOutput);
    });
    
    test('show records - pretty', async () => {
        await logs.execute({ pretty: true }, 'records-pretty', command, updateOutput);
    });

    test('show records - pretty + limit = 20', async () => {
        await logs.execute({ pretty: true, limit: 20 }, 'records-pretty-top20', command, updateOutput);
    });

    test('show records - pretty + columns + limit = all', async () => {
        await logs.execute({ pretty: true, limit: 'all' }, 'records-pretty-all', command, updateOutput);
    });

    test('show records - pretty + columns', async () => {
        await logs.execute({ pretty: true, columns: [ 'STATE_NAME', 'RECID', 'SUB_REGION' ] }, 'records-pretty-columns', command, updateOutput);
    });

    test('show records - pretty + columns + geom', async () => {
        await logs.execute({ pretty: true, columns: [ 'STATE_NAME', 'RECID', 'SUB_REGION' ], geom: true }, 'records-pretty-columns-geom', command, updateOutput);
    });
});