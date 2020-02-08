import axios from "axios";
import L from 'leaflet';
import Vue from 'vue/dist/vue.esm';

let { name, filePath, header, features, fields, totalCount } = state;

let getTableData = function (fields, features) {
    let tableData = [];
    let fieldNames = fields.map(f => f.name);
    tableData.push(fieldNames);

    for (let feature of features.features) {
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
new Vue({
    el: '.root',
    data,
    mounted: async function () {
        let mapContainer = document.querySelector('#mapContainer');
        let response = await axios.get(`/viewport?width=${mapContainer.clientWidth}&height=${mapContainer.clientHeight}`);
        let { lng, lat, zoom } = response.data;

        let map = L.map('mapContainer').setView([lat, lng], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        response = await axios.get(`/features?width=${mapContainer.clientWidth}&height=${mapContainer.clientHeight}`);
        let { features } = response.data;
        
        let style = {
            "color": "#ff7800",
            "weight": 1,
            "opacity": 0.65,
            "radius": 4
        };

        let onPopup = function (layer) {
            let properties = layer.feature.properties;
            let content = '<div class="popup-container"><table class="table table-sm table-striped">';
            for (let key in properties) {
                content += `<tr><td>${key}</td><td>${properties[key]}</td></tr>`;
            }
            content += '</table></div>';
            return content;
        };

        let pointToLayer = function (feature, latlng) {
			return L.circleMarker(latlng, style);
		} 

        L.geoJSON(features, { style, pointToLayer }).bindPopup(onPopup).addTo(map);
    }
});