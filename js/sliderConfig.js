// Get references to the sliders and value displays
const constructionSlider = document.getElementById('construction-slider');
const constructionValue = document.getElementById('construction-value');
const enrollmentSlider = document.getElementById('enrollment-slider');
const enrollmentValue = document.getElementById('enrollment-value');

// Update the displayed value when the slider changes
constructionSlider.addEventListener('input', function () {
  constructionValue.textContent = this.value;
  updateScenario();
});

enrollmentSlider.addEventListener('input', function () {
  enrollmentValue.textContent = this.value;
  updateScenario();
});

// Placeholder function to handle scenario updates
function updateScenario() {
  const construction = constructionSlider.value;
  const enrollment = enrollmentSlider.value;

  console.log(`Scenario updated: Construction = ${construction}, Enrollment = ${enrollment}`);

  // TODO: Load the new GeoJSON data based on the slider values
  // loadScenarioGeoJSON(construction, enrollment);
}

// Placeholder function to load the new GeoJSON data
function loadScenarioGeoJSON(construction, enrollment) {
  // Example: Fetch the new GeoJSON file based on the slider values
  const scenarioFile = `data/scenario_${construction}_${enrollment}.geojson`;

  fetch(scenarioFile)
    .then(response => response.json())
    .then(data => {
      console.log('Loaded scenario GeoJSON:', data);

      // TODO: Update the map and charts with the new data
    })
    .catch(error => {
      console.error('Error loading scenario GeoJSON:', error);
    });
}