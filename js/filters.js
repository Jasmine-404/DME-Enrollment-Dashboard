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
    if (selectedWards) {
      const selectedWardsFeature = hoodsCollection.features.find(
        feature => feature.properties.NAME === selectedWards
      );
  
      if (selectedWardsFeature) {
        const lon = selectedWardsFeature.properties.lon;
        const lat = selectedWardsFeature.properties.lat;
        const targetLatLng = [lat, lon];
        const targetZoom = 15;
        
        map.flyTo(targetLatLng, targetZoom, {
          duration: 1,
          easeLinearity: 0.25
        });
      }
    }
  }