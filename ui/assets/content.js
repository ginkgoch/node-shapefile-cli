let { name, filePath, header, features, fields, totalCount } = state;

let getTableData = function(fields, features) {
    let tableData = [];
    let fieldNames = fields.map(f => f.name);
    tableData.push(fieldNames);

    for(let feature of features.features) {
        let rowData = [];
        fieldNames.forEach(n => {
            let v = feature.properties[n] || '';
            rowData.push(v);
        });

        tableData.push(rowData);
    }

    return tableData;
};

let data = { name, general: { filePath, ...header, totalCount }, properties: getTableData(fields, features) };
let app = new Vue({
    el: '.root',
    data,
    mounted: function() {
        
    }
});