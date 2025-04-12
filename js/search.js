import { getSchoolMarkerStyle } from './layerStyles.js';

// Set up school search functionality
export function setupSchoolSearch(map, schoolData, markers, onMarkerClick) {
  const searchInput = document.getElementById('school-search');
  const suggestionsList = document.getElementById('school-suggestions');

  // Listen for input to show suggestions
  searchInput.addEventListener('input', function() {
    const searchText = searchInput.value.trim().toLowerCase();

    if (searchText !== '') {
      // Filter schools based on input
      const matchedSchools = schoolData.features.filter(feature => {
        const schoolName = feature.properties.School_nam.toLowerCase();
        return schoolName.includes(searchText);
      });

      // Display matching suggestions
      displaySuggestions(matchedSchools, searchInput, suggestionsList, map, markers, schoolData, onMarkerClick);
    } else {
      suggestionsList.innerHTML = '';
    }
  });

  // Handle Enter key search
  searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      handleSchoolSearch(searchInput, map, schoolData, markers, suggestionsList, onMarkerClick);
    }
  });
}

// Display school name suggestions
function displaySuggestions(suggestions, searchInput, suggestionsList, map, markers, schoolData, onMarkerClick) {
  suggestionsList.innerHTML = '';

  suggestions.forEach(school => {
    const suggestionItem = document.createElement('li');
    suggestionItem.textContent = school.properties.School_nam;
    
    suggestionItem.addEventListener('click', () => {
      searchInput.value = school.properties.School_nam;
      suggestionsList.innerHTML = '';
      handleSchoolSearch(searchInput, map, schoolData, markers, suggestionsList, onMarkerClick);
    });
    
    suggestionsList.appendChild(suggestionItem);
  });
}

// Execute school search
function handleSchoolSearch(searchInput, map, schoolData, markers, suggestionsList, onMarkerClick) {
  const searchText = searchInput.value.trim().toLowerCase();

  if (searchText !== '') {
    // Remove existing markers
    markers.forEach(marker => {
      map.removeLayer(marker);
    });
    
    // Clear the markers array
    markers.length = 0;

    // Find matching schools
    const matchedSchools = schoolData.features.filter(feature => {
      const schoolName = feature.properties.School_nam.toLowerCase();
      return schoolName === searchText;
    });

    if (matchedSchools.length > 0) {
      // Add matched schools to map
      matchedSchools.forEach(feature => {
        const schoolCoordinates = feature.geometry.coordinates;
        
        // Create new marker
        const newMarker = L.circleMarker(
          [schoolCoordinates[1], schoolCoordinates[0]], 
          getSchoolMarkerStyle(feature)
        ).addTo(map);
        
        // Add properties for filtering
        newMarker.neighborhood = feature.properties.Ward__2022;
        newMarker.schoolYear = feature.properties.School_yea;
        newMarker.grade = feature.properties.School_gra;
        
        // Add tooltip
        newMarker.bindTooltip(`Name: ${feature.properties.School_nam}`, {
          permanent: false,
          direction: 'top',
          className: 'custom-tooltip'
        });
        
        // Add to markers array
        markers.push(newMarker);
        
        // Automatically show information for the found school
        onMarkerClick(feature, schoolData);
      });

      // Zoom to first match
      const firstMatch = matchedSchools[0];
      const firstMatchCoordinates = firstMatch.geometry.coordinates;
      map.setView([firstMatchCoordinates[1], firstMatchCoordinates[0]], 14);
    } else {
      alert('No school found with that name.');
    }

    // Clear suggestions
    suggestionsList.innerHTML = '';
  }
}