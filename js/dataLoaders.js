import { getSchoolMarkerStyle } from './layerStyles.js';

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
// Add markers to the map with appropriate properties and event handlers
export function addMarkers(map, data, onMarkerClick) {
  const markers = [];
  
  data.features.forEach(feature => {
        
    const marker = L.circleMarker(
      [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
      getSchoolMarkerStyle(feature)
    ).addTo(map);

    // Store properties for filtering
    marker.neighborhood = feature.properties.Ward;
    marker.schoolYear = feature.properties.school_year;
    marker.grade = feature.properties.grade_level;
    marker.schoolSector = feature.properties.school_sector;
    marker.pred = feature.properties[".pred"];
    // Add tooltip
    marker.bindTooltip(`Name: ${feature.properties.school_name}`, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip'
    });
    
    // Add click event
    marker.on('click', function() {
      onMarkerClick(feature, data);
    });
    
    markers.push(marker);
  });
  
  return markers;
}