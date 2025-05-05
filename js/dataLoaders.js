import { getSchoolMarkerStyle } from './layerStyles.js';
import { applyFilters, populateFiltersFromMapSelection } from './filters.js';


// Load and add school data to the map
export async function loadSchoolData(map, url) {
  const response = await fetch(url);
  const data = await response.json();
  
  const layer = L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, getSchoolMarkerStyle(feature));
    }
  });
  
  return { layer, data };
}

  // Add neighborhood data to the map
  export async function addNeighborhoods(map, url, style) {
    const response = await fetch(url);
    const collection = await response.json();
    
    const layer = L.geoJSON(collection, { style }).addTo(map);
    
    // Add tooltip to neighborhoods
    layer.bindTooltip(layer => {
      const hood = layer.feature;
      const name = hood.properties['NAME'];
      return `${name}`;
    });
    
    map.fitBounds(layer.getBounds());
    
    return { layer, collection };
  }

  export function addMarkers(map, data, onMarkerClick) {
    const markers = [];
  
    // ✅ 新增：对数据去重，按 school_name + school_year + grade_level 保留第一条
    const seenKeys = new Set();
    const uniqueFeatures = [];
  
    data.features.forEach(feature => {
      const key = `${feature.properties.school_name}_${feature.properties.school_year}_${feature.properties.grade_level}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueFeatures.push(feature);
      }
    });
  
    // ✅ 使用 uniqueFeatures 而非原始 data
    uniqueFeatures.forEach(feature => {
      const marker = L.circleMarker(
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        getSchoolMarkerStyle(feature)
      ).addTo(map);
  
      marker.neighborhood = feature.properties.ward;
      marker.schoolYear = feature.properties.school_year;
      marker.grade = feature.properties.grade_level;
      marker.schoolSector = feature.properties.school_sector;
      marker.pred = feature.properties.enrollment;
      marker.boundary = feature.properties.dcps_boundary;
  
      marker.bindTooltip(`${feature.properties.school_name}`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip'
      });
  
      marker.on('mouseover', function () {
        marker.setStyle({ radius: 12, color: 'black' });
      });
  
      marker.on('mouseout', function () {
        marker.setStyle({ radius: 5, fillOpacity: 0.8 });
      });
  
      marker.on('click', function (e) {
        onMarkerClick(feature, data); // 注意这里仍然传入完整数据集
        map.setView(e.latlng, 13);
  
        const clickedFeature = feature;
        if (clickedFeature) {
          populateFiltersFromMapSelection(clickedFeature);
          applyFilters();
        }
      });
  
      markers.push(marker);
    });
  
    return markers;
  }
  