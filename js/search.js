import { getSchoolMarkerStyle } from './layerStyles.js';
import { applyFilters } from './filters.js';

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
        const schoolName = feature.properties.school_name.toLowerCase();
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
    suggestionItem.textContent = school.properties.school_name;
    
    suggestionItem.addEventListener('click', () => {
      searchInput.value = school.properties.school_name;
      suggestionsList.innerHTML = '';
      handleSchoolSearch(searchInput, map, schoolData, markers, suggestionsList, onMarkerClick);
    });
    
    suggestionsList.appendChild(suggestionItem);
  });
}

// Execute school search
function handleSchoolSearch(searchInput, map, schoolData, markers, suggestionsList, onMarkerClick) {
  const searchText = searchInput.value.trim().toLowerCase();

  if (searchText === '') {
    // 清除所有 markers
    markers.forEach(marker => {
      map.removeLayer(marker);
    });
    markers.length = 0;
  
    // 获取当前过滤条件
    const selectedYear = document.getElementById('school-year-select').value;
    const selectedGrade = document.getElementById('grade-select').value;
    const selectedSectors = Array.from(document.querySelectorAll('input[name="sector"]:checked')).map(cb => cb.value);
    const selectedWards = Array.from(document.querySelectorAll('input[name="ward"]:checked')).map(cb => cb.value);
  
    // 手动过滤 schoolData
    const filteredData = {
      features: schoolData.features.filter(feature => {
        return (
          (selectedYear === '' || feature.properties.school_year === selectedYear) &&
          (selectedGrade === '' || feature.properties.grade_level === selectedGrade) &&
          (selectedSectors.length === 0 || selectedSectors.includes(feature.properties.school_sector)) &&
          (selectedWards.length === 0 || selectedWards.includes(feature.properties.ward)) &&
          feature.properties.cumulative_permits5yr === 1500 &&
          feature.properties.pct_change_capacity_5yrlater === 0
        );
      })
    };
  
    // 去重（只保留每个学校+年级+学年的第一条记录）
    const seenKeys = new Set();
    const uniqueFeatures = [];
    filteredData.features.forEach(feature => {
      const key = `${feature.properties.school_name}_${feature.properties.school_year}_${feature.properties.grade_level}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueFeatures.push(feature);
      }
    });
  
    // 加载回地图
    uniqueFeatures.forEach(feature => {
      const marker = L.circleMarker(
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        getSchoolMarkerStyle(feature)
      ).addTo(map);
  
      marker.neighborhood = feature.properties.ward;
      marker.schoolYear = feature.properties.school_year;
      marker.grade = feature.properties.grade_level;
      marker.schoolSector = feature.properties.school_sector;
      marker.pred = feature.properties.enrollment;
      marker.boundary = feature.properties.dcps_boundary;
  
      marker.bindTooltip(`${feature.properties.school_name}`, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip'
      });
  
      marker.on('mouseover', function () {
        marker.setStyle({ radius: 12, color: 'black' });
      });
  
      marker.on('mouseout', function () {
        marker.setStyle({ radius: 5, fillOpacity: 0.8 });
      });
  
      marker.on('click', function (e) {
        onMarkerClick(feature, schoolData);
        map.setView(e.latlng, 13);
  
        populateFiltersFromMapSelection(feature);
        applyFilters(map, markers, null);
      });
  
      markers.push(marker);
    });
  
    // 清空建议列表
    suggestionsList.innerHTML = '';
    return;
  }
  

  else{
    // Remove existing markers
    markers.forEach(marker => {
      map.removeLayer(marker);
    });
    
    // Clear the markers array
    markers.length = 0;

    // Find matching schools
    // const matchedSchools = schoolData.features.filter(feature => {
    //   const schoolName = feature.properties.school_name.toLowerCase();
    //   return schoolName === searchText;
    // });
    const seenKeys = new Set();
    const matchedSchools = [];

    schoolData.features.forEach(feature => {
      const schoolName = feature.properties.school_name.toLowerCase();
      
      if (schoolName === searchText) {
        const key = `${feature.properties.school_name}_${feature.properties.school_year}_${feature.properties.grade_level}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          matchedSchools.push(feature);
        }
      }
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
        newMarker.neighborhood = feature.properties.Ward;
        newMarker.schoolYear = feature.properties.school_year;
        newMarker.grade = feature.properties.grade_level;
        
        // Add tooltip
        newMarker.bindTooltip(`${feature.properties.school_name}`, {
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