import { createEnrollmentChart } from './chart.js';
// Functions for dropdown filters and selections

// // Populate neighborhood dropdown
// export function populateNeighborhoodDropdown(hoodsCollection) {
//     const neighborhoodSelect = document.getElementById('ward-select');
//     hoodsCollection.features.forEach(feature => {
//       const option = document.createElement('option');
//       option.value = feature.properties.NAME;
//       option.text = feature.properties.NAME;
//       neighborhoodSelect.add(option);
//     });
//   }
  
  // Populate school year dropdown
  export function populateSchoolYearDropdown(data) {
    const schoolYearSelect = document.getElementById('school-year-select');
    const schoolYears = [...new Set(data.features.map(f => f.properties.pred_year))];
    
    schoolYears.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.text = type;
      schoolYearSelect.add(option);
    });
  }
  
  // Populate grade dropdown
  export function populateGradeDropdown(data) {
    const gradeTypeSelect = document.getElementById('grade-select');
    const gradeTypes = [...new Set(data.features.map(f => f.properties.grade_level))];
    
    gradeTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.text = type;
      gradeTypeSelect.add(option);
    });
  }
  
  let lastClickedFeature = null;
  // Set up filter event listeners
  export function setupFilterEventListeners(map, markers, hoodsCollection) {
    // School sector selection
    document.querySelectorAll('input[name="sector"]').forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        applyFilters(map, markers, hoodsCollection);
      });
    });

    // School year selection
    document.getElementById('school-year-select').addEventListener('change', function() {
      applyFilters(map, markers, hoodsCollection);
      if (lastClickedFeature) {
        createEnrollmentChart(lastClickedFeature, markers[0].__data); // or pass schoolData if available globally
      }
    });
    
    // Ward checkbox change
    document.querySelectorAll('input[name="ward"]').forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        applyFilters(map, markers, hoodsCollection);
        });
    });

    // Grade selection
    document.getElementById('grade-select').addEventListener('change', function() {
      applyFilters(map, markers, hoodsCollection);
    });
  
    markers.forEach(marker => {
      marker.on('click', function () {
        const feature = marker.feature;
        lastClickedFeature = feature;
        createEnrollmentChart(feature, schoolData); // Make sure schoolData is accessible
      });
    });
  }
  
  // Apply all filters and update map display
  function applyFilters(map, markers, hoodsCollection) {

    const selectedSchoolYear = document.getElementById('school-year-select').value;
    const selectedGradeType = document.getElementById('grade-select').value;
    const selectedWards = Array.from(document.querySelectorAll('input[name="ward"]:checked'))
      .map(cb => cb.value);  
    const selectedSectors = Array.from(document.querySelectorAll('input[name="sector"]:checked'))
    .map(cb => cb.value);

    let totalEnrollment = 0;

    // Show/hide markers based on selected filters
    markers.forEach(marker => {
      const matchesNeighborhood = selectedWards.length === 0 || selectedWards.includes(marker.neighborhood);
      const matchesSchoolYear = selectedSchoolYear === '' || (marker.schoolYear === selectedSchoolYear);
      const matchesGradeType = selectedGradeType === '' || (marker.grade === selectedGradeType);
      const matchesSector = selectedSectors.length === 0 || selectedSectors.includes(marker.schoolSector);

      if (matchesNeighborhood && matchesSchoolYear && matchesGradeType && matchesSector) {
        marker.addTo(map);

      const pred = Math.round(Number(marker.pred));
      if (!isNaN(pred)) {
        Math.round(totalEnrollment += pred);
      }

      } else {
        map.removeLayer(marker);
      }
    });

    const enrollmentElement = document.getElementById('ward-total-pred');
    enrollmentElement.textContent = totalEnrollment.toLocaleString();

    // Zoom to selected neighborhood if applicable
    let isZoomedIn = false; // Flag to track zoom state
    let previousZoomState = { lat: null, lon: null }; // Store previous zoom state
    
    if (selectedWards) {
      const selectedWardsFeature = hoodsCollection.features.find(
        feature => feature.properties['NAME'] === selectedWards[0] // Assuming you want to zoom to the first selected ward
      );
      console.log(selectedWards);
      console.log(hoodsCollection.features);
      console.log(selectedWardsFeature);
    
      if (selectedWardsFeature) {
        const lon = selectedWardsFeature.properties.lon;
        const lat = selectedWardsFeature.properties.lat;
        const targetLatLng = [lat, lon];
        const targetZoom = 13;
    
        if (!isZoomedIn || previousZoomState.lat !== lat || previousZoomState.lon !== lon) {
          // Zoom in
          map.flyTo(targetLatLng, targetZoom, {
            duration: 1,
            easeLinearity: 0.25
          });
          isZoomedIn = true;
          previousZoomState = { lat, lon }; // Update previous zoom state
        } else {
          // Zoom out
          map.flyTo(map.getCenter(), 11.5, { // Default zoom level
            duration: 1,
            easeLinearity: 0.25
          });
          isZoomedIn = false;
        }
      }
    }
  }
// filters.js

// Populate filters based on map selection
export function populateFiltersFromMapSelection(feature) {
  // Example: Populate the school sector checkboxes
  const sectorCheckboxes = document.querySelectorAll('input[name="sector"]');
  sectorCheckboxes.forEach(checkbox => {
    checkbox.checked = checkbox.value === feature.properties.school_sector;
  });

  // Example: Populate the ward checkboxes
  const wardCheckboxes = document.querySelectorAll('input[name="ward"]');
  wardCheckboxes.forEach(checkbox => {
    checkbox.checked = checkbox.value === feature.properties.ward;
  });

  const gradeSelect = document.getElementById('grade-select');
  gradeSelect.value = feature.properties.grade_level || '';

  // Example: Populate the school year dropdown
  const schoolYearSelect = document.getElementById('school-year-select');
  schoolYearSelect.value = feature.properties.school_year || '';

  console.log('Filters updated based on marker selection:', feature.properties);
}

// Disable dashboard elements initially
function disableDashboard() {
  document.getElementById('map').style.pointerEvents = 'none'; // Disable map interactions
  document.getElementById('map').style.opacity = '0.5'; // Dim the map
  document.querySelectorAll('.chart-container').forEach(chart => {
    chart.style.pointerEvents = 'none'; // Disable chart interactions
    chart.style.opacity = '0.5'; // Dim the charts
  });
  document.getElementById('info-panel').style.opacity = '0.5'; // Dim the info panel
}

// Enable dashboard elements
function enableDashboard() {
  document.getElementById('map').style.pointerEvents = 'auto'; // Enable map interactions
  document.getElementById('map').style.opacity = '1'; // Restore map opacity
  document.querySelectorAll('.chart-container').forEach(chart => {
    chart.style.pointerEvents = 'auto'; // Enable chart interactions
    chart.style.opacity = '1'; // Restore chart opacity
  });
  document.getElementById('info-panel').style.opacity = '1'; // Restore info panel opacity
}

// Call disableDashboard initially
disableDashboard();

// Listen for changes in the school year dropdown
document.getElementById('school-year-select').addEventListener('change', function () {
  const selectedYear = this.value;

  if (selectedYear) {
    // If a valid school year is selected, enable the dashboard
    enableDashboard();
  } else {
    // If no school year is selected, disable the dashboard
    disableDashboard();
    alert('Please select a school year to proceed.');
  }
});

document.getElementById('map').addEventListener('click', function (e) {
  const selectedYear = document.getElementById('school-year-select').value;

  if (!selectedYear) {
    alert('Please select a school year to proceed.');
    e.preventDefault(); // Prevent the default interaction
  }
});