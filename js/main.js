// Main entry point for the application
import { initializeMap, addNeighborhoods } from './mapConfig.js';
import { neighborhoodStyle } from './layerStyles.js';
import { loadSchoolData, addMarkers } from './dataLoaders.js';
import { createEnrollmentChart } from './chart.js';
import { 
  populateNeighborhoodDropdown, 
  populateSchoolYearDropdown, 
  populateGradeDropdown,
  setupFilterEventListeners 
} from './filters.js';
import { setupSchoolSearch } from './search.js';
import { initializePopup } from './popup.js';

// Global variables
let map;
let markers = [];
let hoodsLayer;
let hoodsCollection;
let schoolData;

// Initialize the application
async function initApp() {
  // Initialize map
  map = initializeMap('#map');
  
  // Load neighborhood data
  const neighborhoods = await addNeighborhoods(map, 'data/DCwards.geojson', neighborhoodStyle);
  hoodsLayer = neighborhoods.layer;
  hoodsCollection = neighborhoods.collection;
  
  // Load school data
  const schools = await loadSchoolData(map, 'data/schoolPointsSample.geojson');
  schoolData = schools.data;
  
  // Set up click handler for markers
  function onMarkerClick(feature, data) {
    // Show school info
    const infoBox = document.getElementById('info-box');
    infoBox.innerHTML = `Name: ${feature.properties.School_nam}<br>Address: ${feature.properties.Facility_a}<br>School Sector: ${feature.properties.School_sec}<br>Ward: ${feature.properties.Ward__2022}`;
    
    // Create enrollment chart
    createEnrollmentChart(feature, data);
  }
  
  // Add markers to the map
  markers = addMarkers(map, schoolData, onMarkerClick);
  
  // Set up dropdown filters
  populateNeighborhoodDropdown(hoodsCollection);
  populateSchoolYearDropdown(schoolData);
  populateGradeDropdown(schoolData);
  setupFilterEventListeners(map, markers, hoodsCollection);
  
  // Set up school search
  setupSchoolSearch(map, schoolData, markers, onMarkerClick);
  
  // Initialize about popup
  initializePopup();
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);