// Functions for dropdown filters and selections

// Populate neighborhood dropdown
export function populateNeighborhoodDropdown(hoodsCollection) {
    const neighborhoodSelect = document.getElementById('ward-select');
    hoodsCollection.features.forEach(feature => {
      const option = document.createElement('option');
      option.value = feature.properties.NAME;
      option.text = feature.properties.NAME;
      neighborhoodSelect.add(option);
    });
  }
  
  // Populate school year dropdown
  export function populateSchoolYearDropdown(data) {
    const schoolYearSelect = document.getElementById('school-year-select');
    const schoolYears = [...new Set(data.features.map(f => f.properties.School_yea))];
    
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
    const gradeTypes = [...new Set(data.features.map(f => f.properties.School_gra))];
    
    gradeTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.text = type;
      gradeTypeSelect.add(option);
    });
  }
  
  // Set up filter event listeners
  export function setupFilterEventListeners(map, markers, hoodsCollection) {
    // Ward/neighborhood selection
    document.getElementById('ward-select').addEventListener('change', function() {
      applyFilters(map, markers, hoodsCollection);
    });
  
    // School year selection
    document.getElementById('school-year-select').addEventListener('change', function() {
      applyFilters(map, markers, hoodsCollection);
    });
  
    // Grade selection
    document.getElementById('grade-select').addEventListener('change', function() {
      applyFilters(map, markers, hoodsCollection);
    });
  }
  
  // Apply all filters and update map display
  function applyFilters(map, markers, hoodsCollection) {
    const selectedNeighborhood = document.getElementById('ward-select').value;
    const selectedSchoolYear = document.getElementById('school-year-select').value;
    const selectedGradeType = document.getElementById('grade-select').value;
  
    // Show/hide markers based on selected filters
    markers.forEach(marker => {
      const matchesNeighborhood = selectedNeighborhood === '' || (marker.neighborhood === selectedNeighborhood);
      const matchesSchoolYear = selectedSchoolYear === '' || (marker.schoolYear === selectedSchoolYear);
      const matchesGradeType = selectedGradeType === '' || (marker.grade === selectedGradeType);
  
      if (matchesNeighborhood && matchesSchoolYear && matchesGradeType) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  
    // Zoom to selected neighborhood if applicable
    if (selectedNeighborhood) {
      const selectedNeighborhoodFeature = hoodsCollection.features.find(
        feature => feature.properties.NAME === selectedNeighborhood
      );
  
      if (selectedNeighborhoodFeature) {
        const lon = selectedNeighborhoodFeature.properties.lon;
        const lat = selectedNeighborhoodFeature.properties.lat;
        const targetLatLng = [lat, lon];
        const targetZoom = 12;
        
        map.flyTo(targetLatLng, targetZoom, {
          duration: 1,
          easeLinearity: 0.25
        });
      }
    }
  }