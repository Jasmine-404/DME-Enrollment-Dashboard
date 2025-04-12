// Define styles for different map layers

// Neighborhood layer styling
export const neighborhoodStyle = {
    fillColor: 'white',
    weight: 0.5,
    opacity: 1,
    color: '#000000',
    fillOpacity: 0.5
  };
  
  // School sector colors for markers
  export const schoolSecColors = {
    "Public charter": "red",
    "DCPS": "skyblue"
  };
  
  // Create a marker style based on school properties
  export function getSchoolMarkerStyle(feature, defaultColor = "#007cbf") {
    const sectorType = feature.properties.School_sec;
    const color = schoolSecColors[sectorType] || defaultColor;
    
    return {
      radius: 5,
      fillColor: color,
      color: "#555",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
  }