// Rally Timing Coordinator Application
// Calculates optimal launch timings for multiple rally events

const numRalliesInput = document.getElementById('numRallies');
const rallyInputsContainer = document.getElementById('rallyInputs');
const resultsContainer = document.getElementById('results');

// Event listener for number of rallies input
numRalliesInput.addEventListener('input', generateRallyInputs);
numRalliesInput.addEventListener('change', generateRallyInputs);

/**
 * Generates dynamic input fields for rally travel times and gaps
 */
function generateRallyInputs() {
  // Clear previous inputs
  rallyInputsContainer.innerHTML = '';
  resultsContainer.style.display = 'none';
  resultsContainer.classList.remove('show');
  
  const count = parseInt(numRalliesInput.value);
  
  // Validate input
  if (isNaN(count) || count < 2 || count > 10) {
    return;
  }
  
  // Generate input fields for each rally
  for (let i = 0; i < count; i++) {
    const rallyDiv = document.createElement('div');
    rallyDiv.className = 'rally-input-group';
    
    // Travel time input
    const travelLabel = document.createElement('label');
    travelLabel.textContent = `Travel time for Rally ${i + 1} (in seconds):`;
    travelLabel.setAttribute('for', `travel_${i}`);
    
    const travelInput = document.createElement('input');
    travelInput.type = 'number';
    travelInput.id = `travel_${i}`;
    travelInput.placeholder = 'e.g. 90';
    travelInput.min = '1';
    travelInput.step = '0.1';
    
    rallyDiv.appendChild(travelLabel);
    rallyDiv.appendChild(travelInput);
    
    // Gap input (for rallies after the first one)
    if (i > 0) {
      const gapLabel = document.createElement('label');
      gapLabel.textContent = `Gap after Rally ${i} (seconds):`;
      gapLabel.setAttribute('for', `gap_${i}`);
      
      const gapInput = document.createElement('input');
      gapInput.type = 'number';
      gapInput.id = `gap_${i}`;
      gapInput.placeholder = 'e.g. 5';
      gapInput.min = '0';
      gapInput.step = '0.1';
      
      rallyDiv.appendChild(gapLabel);
      rallyDiv.appendChild(gapInput);
    }
    
    rallyInputsContainer.appendChild(rallyDiv);
  }
}

/**
 * Validates input values and returns error message if invalid
 * @param {number} num - Number of rallies
 * @param {number[]} travelTimes - Array of travel times
 * @param {number[]} gaps - Array of gap times
 * @returns {string|null} Error message or null if valid
 */
function validateInputs(num, travelTimes, gaps) {
  if (isNaN(num) || num < 2 || num > 10) {
    return 'Please enter a valid number of rallies (2-10).';
  }
  
  for (let i = 0; i < num; i++) {
    if (isNaN(travelTimes[i]) || travelTimes[i] <= 0) {
      return `Please enter a valid travel time for Rally ${i + 1}.`;
    }
  }
  
  for (let i = 1; i < num; i++) {
    if (isNaN(gaps[i]) || gaps[i] < 0) {
      return `Please enter a valid gap time after Rally ${i}.`;
    }
  }
  
  return null;
}

/**
 * Displays error message in the results container
 * @param {string} message - Error message to display
 */
function displayError(message) {
  resultsContainer.innerHTML = `<div class="error">${message}</div>`;
  resultsContainer.style.display = 'block';
  resultsContainer.classList.add('show');
}

/**
 * Calculates optimal launch timing offsets for rallies
 */
function calculateTiming() {
  const num = parseInt(numRalliesInput.value);
  
  if (isNaN(num) || num < 2) {
    displayError('Please specify the number of rallies first.');
    return;
  }
  
  const travelTimes = [];
  const gaps = [];
  
  // Collect input values
  for (let i = 0; i < num; i++) {
    const travelElement = document.getElementById(`travel_${i}`);
    if (!travelElement) {
      displayError('Please fill in all required fields.');
      return;
    }
    travelTimes[i] = parseFloat(travelElement.value);
    
    if (i > 0) {
      const gapElement = document.getElementById(`gap_${i}`);
      if (!gapElement) {
        displayError('Please fill in all required fields.');
        return;
      }
      gaps[i] = parseFloat(gapElement.value);
    }
  }
  
  // Validate inputs
  const validationError = validateInputs(num, travelTimes, gaps);
  if (validationError) {
    displayError(validationError);
    return;
  }
  
  // Calculate timing offsets
  const offsets = [0]; // First rally starts at T+0
  
  for (let i = 1; i < num; i++) {
    // Offset = previous offset + (previous travel time - current travel time) + gap
    const offset = travelTimes[i - 1] - travelTimes[i] + gaps[i];
    offsets[i] = offsets[i - 1] + offset;
  }
  
  // Generate results HTML
  let resultHTML = '<h3>Recommended Launch Times (seconds after Rally 1):</h3><ul>';
  
  offsets.forEach((offset, idx) => {
    const formattedOffset = offset.toFixed(1);
    const sign = offset >= 0 ? '+' : '';
    resultHTML += `<li>Rally ${idx + 1}: T${sign}${formattedOffset} seconds</li>`;
  });
  
  resultHTML += '</ul>';
  
  // Add explanation
  resultHTML += '<p style="margin-top: 1rem; color: #ccc; font-size: 0.9rem; line-height: 1.4;">';
  resultHTML += '<strong>How to use:</strong> Launch Rally 1 at your chosen time, then launch subsequent rallies at the calculated offsets relative to Rally 1\'s launch time.';
  resultHTML += '</p>';
  
  // Display results
  resultsContainer.innerHTML = resultHTML;
  resultsContainer.style.display = 'block';
  resultsContainer.classList.add('show');
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Focus on the number of rallies input
  numRalliesInput.focus();
  
  // Add enter key support for calculation
  document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'INPUT') {
        calculateTiming();
      }
    }
  });
});
