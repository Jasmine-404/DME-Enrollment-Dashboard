// Initialize the about popup functionality
export function initializePopup() {
  const aboutBtn = document.getElementById('about-btn');
  const aboutPopup = document.getElementById('about-popup');
  const closePopupBtn = document.getElementById('close-popup-btn');
  
  // Toggle popup visibility
  aboutBtn.addEventListener('click', function() {
    aboutPopup.classList.add('show');
  });
  
  closePopupBtn.addEventListener('click', function() {
    aboutPopup.classList.remove('show');
  });
  
  // Close when clicking outside
  aboutPopup.addEventListener('click', function(event) {
    if (event.target === aboutPopup) {
      aboutPopup.classList.remove('show');
    }
  });

  aboutPopup.classList.add('show');

}

// Initialize the scenario help popup functionality
export function initializeScenarioPopup() {
  const helpBtn = document.getElementById('scenario-help-btn');
  const helpPopup = document.getElementById('scenario-help-popup');
  const helpCloseBtn = document.getElementById('scenario-help-close-btn');

  helpBtn.addEventListener('click', () => {
    helpPopup.classList.add('show');
  });

  helpCloseBtn.addEventListener('click', () => {
    helpPopup.classList.remove('show');
  });

  helpPopup.addEventListener('click', (e) => {
    if (e.target === helpPopup) {
      helpPopup.classList.remove('show');
    }
  });
}
