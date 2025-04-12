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

// Add markers to the map with appropriate properties and event handlers
export function addMarkers(map, data, onMarkerClick) {
  const markers = [];
  
  data.features.forEach(feature => {
    // Get the neighborhood this school belongs to
    const neighborhood = feature.properties.Ward__2022;
    
    const marker = L.circleMarker(
      [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
      getSchoolMarkerStyle(feature)
    ).addTo(map);

    // Store properties for filtering
    marker.neighborhood = neighborhood;
    marker.schoolYear = feature.properties.School_yea;
    marker.grade = feature.properties.School_gra;
    
    // Add tooltip
    marker.bindTooltip(`Name: ${feature.properties.School_nam}`, {
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