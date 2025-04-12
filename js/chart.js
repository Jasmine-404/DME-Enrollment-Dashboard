// Create or update the bar chart for school enrollment data
export function createEnrollmentChart(feature, schoolData) {
    // Get enrollment data for the clicked school
    const schoolName = feature.properties.School_nam;
    const schoolGrades = schoolData.features.filter(school => 
      school.properties.School_nam === schoolName
    );
  
    // Prepare data for the chart
    const gradeLabels = [];
    const enrollmentData = [];
    
    schoolGrades.forEach(school => {
      const grade = school.properties.School_gra;
      const enrollment = school.properties.Enrollment || 0;
      
      if (!gradeLabels.includes(grade)) {
        gradeLabels.push(grade);
        enrollmentData.push(enrollment);
      } else {
        // If grade already exists, add enrollment to existing entry
        const index = gradeLabels.indexOf(grade);
        enrollmentData[index] += enrollment;
      }
    });
    
    // Destroy previous chart if it exists
    if (window.chartInstance) {
      window.chartInstance.destroy();
    }
  
    // Draw the chart
    const ctx = document.getElementById('bar-chart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: gradeLabels,
        datasets: [{
          label: 'Number of Enrollment',
          data: enrollmentData,
          backgroundColor: 'skyblue',
          borderColor: 'gray',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Store the chart instance globally
    window.chartInstance = chart;
  }