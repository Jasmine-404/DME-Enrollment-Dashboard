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
import { setLastClickedFeature } from './filters.js';
import { setupSchoolYearChartListener } from './filters.js';
import './sliderConfig.js';



// Global variables
export let schoolData;  // ← 添加这个
let map;
let markers = [];
let hoodsLayer;
let hoodsCollection;
//let schoolData;

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


    const wardCheckboxes = document.querySelectorAll(`input[name="ward"][value="${clickedWardName}"]`);
    // Active checkbox similar to filters.js file
    wardCheckboxes.forEach((checkbox) => {
      checkbox.checked = !checkbox.checked;

      // Connect layer to trigger change
      const event = new Event('change');
      checkbox.dispatchEvent(event);
    });

    // Update ward summary and chart
    const wardData = schoolData.features.filter(school => school.properties.ward === clickedWardName);
    const totalEnrollment = wardData.reduce((sum, school) => sum + Math.round(school.properties["enrollment"] || 0), 0);

    createWardSummaryChart(clickedWardName, wardData);
    updateWardSummary(clickedWardName, totalEnrollment);
  });
  
  // Load school data
  // const schools = await loadSchoolData(map, 'data/updated_app_data_May4.geojson');
  // schoolData = schools.data;
  const REMOTE_DATA_URL = 'https://fzrc4leppkfrpfbh.public.blob.vercel-storage.com/updated_app_data_May4-6E6f0sCkf0SySp7Ubxv465ScZPcpsy.geojson';

  const schools = await loadSchoolData(map, REMOTE_DATA_URL);
  schoolData = schools.data;
  
    
  
function onMarkerClick(feature, data) {
  setLastClickedFeature(feature);  // ✅ 更新 lastClickedFeature

  const infoBox = document.getElementById('info-box');
  infoBox.innerHTML = `Name: ${feature.properties.school_name}<br>
  School Sector: ${feature.properties.school_sector}
  <br>Ward: ${feature.properties.ward}<br>
  DCPS Boundary: ${feature.properties.dcps_boundary}`;

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

  setupSchoolYearChartListener();

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