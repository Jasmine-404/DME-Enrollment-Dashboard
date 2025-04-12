// Map initialization and configuration
export function initializeMap(elementId, center = [38.9072, -77.0369], zoom = 12) {
    const mapEl = document.querySelector(elementId);
    const map = L.map(mapEl).setView(center, zoom);
  
    // Add Mapbox basemap
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      detectRetina: true,
      accessToken: 'pk.eyJ1IjoiamFzbWluZTQwNCIsImEiOiJjbTFmdXE0NWEzY2diMm1wem4xcGs3bWFrIn0.w-nHq5x4vpU3o2NEQ8frTQ'
    }).addTo(map);
  
    return map;
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