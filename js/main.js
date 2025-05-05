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
  
  let capacityData = null;

  const capacityRes = await fetch('data/school_capacity_SY23-24.geojson');
  capacityData = await capacityRes.json();
  
  
  
function onMarkerClick(feature, data) {
  setLastClickedFeature(feature);  // 更新 lastClickedFeature
  const schoolName = feature.properties.school_name;

  // 默认文字
  let capacityText = 'Not Available';

  if (capacityData && capacityData.features) {
    const match = capacityData.features.find(d => d.properties.school_name === schoolName);
    if (match) {
      capacityText = match.properties.facility_capacity;
    }
  }

  const infoBox = document.getElementById('info-box');
  infoBox.innerHTML =
  `<strong>School Name:</strong> ${feature.properties.school_name}<br>
  <strong>School Sector:</strong> ${feature.properties.school_sector}<br>
  <strong>Ward:</strong> ${feature.properties.ward}<br>
  <strong>DCPS Boundary:</strong> ${feature.properties.dcps_boundary}<br>
  <strong>School Capacity in SY23-24:</strong> ${capacityText}
  `;

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