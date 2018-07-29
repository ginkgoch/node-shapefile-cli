module.exports = {
    testEnv: async function(action) {
        return await new Promise(async res => {
            let outputData = '';
            const storeLog = inputs => (outputData += inputs);
            console['log'] = jest.fn(storeLog);
    
            await action();

            console.dir(action)
            return res(outputData);
        });
    }
}