import { createEnrollmentChart } from './chart.js';
import { schoolData } from './main.js';

  
export let lastClickedFeature = null;

export function setLastClickedFeature(feature) {
  lastClickedFeature = feature;
}

export function getLastClickedFeature() {
  return lastClickedFeature;
}

export function setupSchoolYearChartListener() {
  document.getElementById('school-year-select').addEventListener('change', function() {
    console.log("School year changed!");

    if (lastClickedFeature) {
      console.log("Updating chart for:", lastClickedFeature.properties.school_name);
      createEnrollmentChart(lastClickedFeature, schoolData);
    } else {
      console.log("No school selected yet.");
    }
  });
}


  // Populate school year dropdown
  export function populateSchoolYearDropdown(data) {
    const schoolYearSelect = document.getElementById('school-year-select');
    const schoolYears = [...new Set(data.features.map(f => f.properties.school_year))];
    
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
  
  // let lastClickedFeature = null;
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

      console.log("Dropdown changed!");
      console.log("lastClickedFeature:", lastClickedFeature?.properties?.school_name);
      console.log("selectedYear:", document.getElementById('school-year-select').value);
      console.log("schoolData loaded:", schoolData?.features?.length);

      applyFilters(map, markers, hoodsCollection);
      if (lastClickedFeature) {
        createEnrollmentChart(lastClickedFeature, schoolData); // or pass schoolData if available globally
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
  export function applyFilters(map, markers, hoodsCollection) {

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

    // Zoom to selected ward on click
    // This glitches out a little bit when mutliple wards are selected but that's ok for now
    let isZoomedIn = false;
    let previousZoomState = { lat: null, lon: null };
    
    if (selectedWards) {
      const selectedWardsFeature = hoodsCollection.features.find(
        feature => feature.properties['NAME'] === selectedWards[0]
      );
    
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
          previousZoomState = { lat, lon };
        } else {
          // Zoom out
          map.flyTo(map.getCenter(), 11.5, {
            duration: 1,
            easeLinearity: 0.25
          });
          isZoomedIn = false;
        }
      }
    }
  }

// Populate filters based on map selection
// THIS ALSO ISN'T REALLY THAT RELEVANT
// ESPECIALLY WITH HOW SECNARIOS WILL PLAY OUT, BUT I WILL LEAVE IT HERE SO NOTHING BREAKS
export function populateFiltersFromMapSelection(feature) {
  const sectorCheckboxes = document.querySelectorAll('input[name="sector"]');
  sectorCheckboxes.forEach(checkbox => {
    checkbox.checked = checkbox.value === feature.properties.school_sector;
  });

  const wardCheckboxes = document.querySelectorAll('input[name="ward"]');
  wardCheckboxes.forEach(checkbox => {
    checkbox.checked = checkbox.value === feature.properties.ward;
  });

  const gradeSelect = document.getElementById('grade-select');
  gradeSelect.value = feature.properties.grade_level || '';

  // Example: Populate the school year dropdown
  const schoolYearSelect = document.getElementById('school-year-select');
  schoolYearSelect.value = feature.properties.school_year || '';
}

// Disable dashboard elements initially
function disableDashboard() {
  document.getElementById('map').style.pointerEvents = 'none'; // need to figure out why this doesn't disable hover and clicks
  document.getElementById('map').style.opacity = '0.5';
  document.querySelectorAll('.chart-container').forEach(chart => {
    chart.style.pointerEvents = 'none';
    chart.style.opacity = '0.5';
  });
  document.getElementById('info-panel').style.opacity = '0.5';
}

// Enable dashboard elements
function enableDashboard() {
  document.getElementById('map').style.pointerEvents = 'auto';
  document.getElementById('map').style.opacity = '1';
  document.querySelectorAll('.chart-container').forEach(chart => {
    chart.style.pointerEvents = 'auto';
    chart.style.opacity = '1';
  });
  document.getElementById('info-panel').style.opacity = '1';
}

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