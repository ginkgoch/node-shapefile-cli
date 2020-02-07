const SrsUtils = require('../../shared/SrsUtils');

describe('SrsUtils', async () => {
    it('getWkt', async () => {
        let wkt = await SrsUtils.getWKT('EPSG:4326');
        expect(wkt).toEqual('GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]');
    });
    
    it('getWkt - from alias', async () => {
        let crsID = SrsUtils._getMappedID('EPSG:3857');
        expect(crsID).toEqual('SR-ORG:6627');
    });
})
