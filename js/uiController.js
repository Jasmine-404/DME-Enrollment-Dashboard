const predictionButton = document.getElementById('prediction-btn');
const filterPanel = document.getElementById('filter-panel');
const infoPanel = document.getElementById('info-panel');
const legendPanel = document.getElementById('legend');
const mapPanel =document.getElementById('map');

function initializeUI() {
  filterPanel.style.display = 'block';
  infoPanel.style.display = 'block';
  mapPanel.style.display = 'block';
  legendPanel.style.display = 'bloc';
  
}



predictionButton.addEventListener('click', () => {
  filterPanel.style.display = 'none';
  infoPanel.style.display = 'none';
  legendPanel.style.display = 'none';
  mapPanel.style.display = 'block';
  predictionPanel.style.display = 'lock';
    window.dispatchEvent(new CustomEvent('initializeMap2'));
  predictionButton.classList.add('active');
  mapButton.classList.remove('active');
});

initializeUI();