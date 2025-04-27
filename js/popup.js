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
}