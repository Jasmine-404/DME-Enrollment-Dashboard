// Map initialization and configuration
export function initializeMap(elementId, center = [38.8951127902493, -77.00714860751873], zoom = 11) {
    const mapEl = document.querySelector(elementId);
    const map = L.map(mapEl, {
      zoomSnap: 0.5 // Adjust zoom snap to 0.5 so that it isn't so zoomed out
    });
  
    // Add Mapbox basemap
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors',
      maxZoom: 18,
      id: 'mapbox/light-v11',
      tileSize: 512,
      zoomOffset: -1,
      detectRetina: true,
      accessToken: 'pk.eyJ1Ijoic29sYW5vYSIsImEiOiJjbTE3eXNwNGYwaXRtMmxvZW1peDI1bHpwIn0.0MSBeAcaFnfVYOf9bG0DpQ'
    }).addTo(map);
  
    return map.setView(center, zoom);
  }

    // Add neighborhood data to the map
  export async function addNeighborhoods(map, url, style) {
    const response = await fetch(url);
    const collection = await response.json();
    
    function wardsHover(feature, layer) {
      layer.on('mouseover', function() {
        layer.setStyle({
            fillOpacity: 0.6,
            weight: 2
        });
      });
      layer.on('mouseout', function() {
        layer.setStyle({
            fillOpacity: 0.5,
            weight: 0.5
          });
        });
      let isZoomedIn = false; // Flag to track zoom state
      let previousBounds = null; // Store the previous bounds

      layer.on('click', function () {
        const bounds = layer.getBounds(); // Get the bounds of the clicked layer

        if (!isZoomedIn || !bounds.equals(previousBounds)) {
          // Zoom in to the layer's bounds
          map.fitBounds(bounds, {
            padding: [20, 20], // Optional padding around the bounds
            duration: 1, // Animation duration
          });
          isZoomedIn = true;
          previousBounds = bounds; // Update the previous bounds
        } else {
          // Zoom out to the default view
          map.setView([38.8951127902493, -77.00714860751873], 11.5, {
            duration: 1, // Animation duration
          });
          isZoomedIn = false;
        }
      });
      };


    const layer = L.geoJSON(collection, { style, onEachFeature:wardsHover }).addTo(map);
    
    // Add tooltip to neighborhoods
    layer.bindTooltip(layer => {
      const hood = layer.feature;
      const name = hood.properties['NAME'];
      return `${name}`;
    });
    
    return { layer, collection };
  }