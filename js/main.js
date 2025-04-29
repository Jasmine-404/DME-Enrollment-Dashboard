// Main entry point for the application
import { initializeMap, addNeighborhoods } from './mapConfig.js';
import { neighborhoodStyle } from './layerStyles.js';
import { loadSchoolData, addMarkers } from './dataLoaders.js';
import { 
  createEnrollmentChart,
  createEnrollmentTrendChart,
  createWardSummaryChart,
  updateWardSummary
} from './chart.js';
import {
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

  // Add click handler for wards
  hoodsLayer.on('click', function (e) {
    const clickedWardName = e.layer.feature.properties['NAME']; // Adjust property name as needed

    // Find all matching checkboxes in the DOM
    const wardCheckboxes = document.querySelectorAll(`input[name="ward"][value="${clickedWardName}"]`);

    // Loop through all matching checkboxes and toggle their state
    wardCheckboxes.forEach((checkbox) => {
      checkbox.checked = !checkbox.checked;

      // Optionally, trigger a change event if needed
      const event = new Event('change');
      checkbox.dispatchEvent(event);
    });

    // Update ward summary and chart
    const wardData = schoolData.features.filter(school => school.properties.ward === clickedWardName);
    const totalEnrollment = wardData.reduce((sum, school) => sum + Math.round(school.properties["pred_enrollment"] || 0), 0);

    createWardSummaryChart(clickedWardName, wardData);
    updateWardSummary(clickedWardName, totalEnrollment);

    console.log(`Clicked ward: ${clickedWardName}`);
  });
  
  // Load school data
  const schools = await loadSchoolData(map, 'data/fitted3yr.geojson');
  schoolData = schools.data;
  
  // Set up click handler for markers
  function onMarkerClick(feature, data) {
    console.log('Feature clicked:', feature);
    console.log('School data:', schoolData);
    // Show school info
    const infoBox = document.getElementById('info-box');
    infoBox.innerHTML = `Name: ${feature.properties.school_name}<br>
    School Sector: ${feature.properties.school_sector}
    <br>Ward: ${feature.properties.ward}<br>
    DCPS Boundary: ${feature.properties.dcps_boundary}`;
    
    // Create enrollment chart
    createEnrollmentChart(feature, data);
    createEnrollmentTrendChart(feature, data);
  }
  
  // Add markers to the map
  markers = addMarkers(map, schoolData, onMarkerClick);
  
  // Set up dropdown filters
  populateSchoolYearDropdown(schoolData);
  populateGradeDropdown(schoolData);
  setupFilterEventListeners(map, markers, hoodsCollection);

  // Set up school search
  setupSchoolSearch(map, schoolData, markers, onMarkerClick);
  
  // Initialize about popup
  initializePopup();

  const predictScenarioBtn = document.getElementById('predict-scenario-btn');
  const scenarioPanel = document.getElementById('scenario-panel');

  // Add a click event listener to the button
  predictScenarioBtn.addEventListener('click', function () {
    // Toggle the visibility of the scenario panel
    if (scenarioPanel.style.display === 'none') {
      scenarioPanel.style.display = 'block'; // Show the panel
      predictScenarioBtn.textContent = 'Hide Scenario Adjustments'; // Update button text
    } else {
      scenarioPanel.style.display = 'none'; // Hide the panel
      predictScenarioBtn.textContent = 'Predict With Scenario'; // Reset button text
    }
  });
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);