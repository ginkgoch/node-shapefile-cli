const axios = require('axios').default;
const wktCaches = require('./WktCaches');
//https://spatialreference.org/ref/epsg/4326/ogcwkt/
axios.defaults.baseURL = 'https://spatialreference.org';

module.exports = class SrsUtils {
    static async getWKT(code) {    
        code = this._getMappedID(code);
        if(code.includes(':')) {
            if (code in wktCaches) {
                return wktCaches[code];
            }

            let [type, id] = code.split(':');
            try {
                let url = `/ref/${type.toLowerCase()}/${id}/ogcwkt/`;
                let response = await axios.get(url);
                if (response.status === 200) {
                    return response.data;
                }
            } catch(ex) { 
                console.warn(`Projection ${code} not recognized. Please find a correct projection from https://spatialreference.org/ and try again.`)
            }
        }
    
        return undefined;
    };

    static _getMappedID(code) {
        loadWktAliasMap();

        let keys = [...wktAliasMap.keys()];
        for (let key of keys) {
            let aliases = wktAliasMap.get(key);
            if (aliases.some(n => n.toLowerCase() == code.toLowerCase())) {
                return key;
            }
        }
    
        return code;
    }
} 

let wktAliasJSON = require('./WktAliases.json');
let wktAliasMap = undefined;
function loadWktAliasMap() {
    if (wktAliasMap === undefined) {
        wktAliasMap = new Map();
        for (let i in wktAliasJSON) {
            wktAliasMap.set(i, wktAliasJSON[i]);
        }
    }
}


