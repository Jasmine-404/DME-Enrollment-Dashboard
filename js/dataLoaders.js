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
    // const neighborhood = feature.properties.Ward__2022;
    
    const marker = L.circleMarker(
      [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
      getSchoolMarkerStyle(feature)
    ).addTo(map);

    // Store properties for filtering
    //marker.neighborhood = neighborhood;
    // marker.schoolYear = feature.properties.school_year;
    // marker.grade = feature.properties.grade_level;
    
    // Add tooltip
    marker.bindTooltip(`${feature.properties.school_name}`, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip'
    });

    // adjust styling for hover effect
    marker.on('mouseover', function() {
      marker.setStyle({
          radius: 10,
          color: 'black'
      });
    });
    marker.on('mouseout', function() {
      marker.setStyle({
          radius: 5,
          fillOpacity: 0.8
      });
    });
    
    // Add click event
    marker.on('click', function() {
      onMarkerClick(feature, data);
    });
    
    markers.push(marker);
  });
  
  return markers;
}