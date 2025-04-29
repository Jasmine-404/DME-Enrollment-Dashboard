let charts = {};

// color palette for charts
const gradeColors = {
  "K": "#fed395", 
  "1": "#fea973",
  "2": "#e95462",
  "3": "#a3307e",
  "4": "#8E44AD",
  "5": "#440154",
};

// Create a bar chart for enrollment by grade
export function createEnrollmentChart(feature, schoolData) {
  const schoolName = feature.properties.school_name;
  const selectedSchoolYear = document.getElementById('school-year-select').value;

  const schoolGrades = schoolData.features.filter(school =>
    school.properties.school_name === schoolName &&
    (selectedSchoolYear === '' || school.properties.pred_year === selectedSchoolYear)
  );

  const gradeLabels = [];
  const enrollmentData = [];
  const backgroundColors = [];

  schoolGrades.forEach(school => {
    const grade = school.properties.grade_level;
    const enrollment = Math.round(school.properties["pred_enrollment"] || 0);

    const index = gradeLabels.indexOf(grade);
    if (index === -1) {
      gradeLabels.push(grade);
      enrollmentData.push(enrollment);
      backgroundColors.push(gradeColors[grade] || '#000000');
    } else {
      enrollmentData[index] += enrollment;
    }
  });

  if (charts.enrollmentChart) {
    charts.enrollmentChart.destroy();
  }

  const ctx = document.getElementById('bar-chart').getContext('2d');
  charts.enrollmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gradeLabels,
      datasets: [{
        label: `Predicted enrollment ${selectedSchoolYear}`,
        data: enrollmentData,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Enrollment'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Grade'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}

// Create a line chart for enrollment trends
export function createEnrollmentTrendChart(feature, schoolData) {
  const schoolName = feature.properties.school_name;

  // Filter data for the selected school
  const schoolTrends = schoolData.features.filter(school =>
    school.properties.school_name === schoolName
  );

  // Group data by grade
  const gradeData = {};
  schoolTrends.forEach(school => {
    const grade = school.properties.grade_level;
    const year = school.properties.pred_year;
    const enrollment = Math.round(school.properties["pred_enrollment"] || 0);

    if (!gradeData[grade]) {
      gradeData[grade] = { years: [], enrollments: [] };
    }

    // Add year and enrollment data for the grade
    gradeData[grade].years.push(year);
    gradeData[grade].enrollments.push(enrollment);
  });

  const sortedGrades = Object.keys(gradeData).sort((a, b) => {
    if (a === "K") return -1; // "K" comes first
    if (b === "K") return 1;
    return a.localeCompare(b, undefined, { numeric: true }); // Sort numerically for other grades
  });

  const datasets = sortedGrades.map(grade => ({
    label: `${grade}`,
    data: gradeData[grade].enrollments,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderColor: gradeColors[grade] || '#000000',
    borderWidth: 2,
    tension: 0.4
  }));

  const overlayPlugin = {
    id: 'overlayPlugin',
    beforeDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      const xScale = scales.x;

      const labels = xScale.getLabels();
      const lastTwoYears = ["SY25-26", "SY26-27"];
      const startIndex = labels.findIndex(label => label === lastTwoYears[0]);
      const endIndex = labels.findIndex(label => label === lastTwoYears[1]);
  
      if (startIndex !== -1 && endIndex !== -1) {
        const startX = xScale.getPixelForValue(labels[startIndex]);
        const endX = xScale.getPixelForValue(labels[endIndex]);
  
        // Draw the overlay
        ctx.save();
        ctx.fillStyle = 'whitesmoke';
        ctx.fillRect(startX, chartArea.top, endX - startX, chartArea.bottom - chartArea.top);
        ctx.restore();
      }
    }
  };

  // Destroy the existing chart if it exists
  if (charts.enrollmentTrendChart) {
    charts.enrollmentTrendChart.destroy();
  }

  // Create the chart
  const ctx = document.getElementById('line-chart').getContext('2d');
  charts.enrollmentTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: gradeData[sortedGrades[0]].years,
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Enrollment'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Enrollment Trends'
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'line',
            boxWidth: 40,
            boxHeight: 10
          }
        }
      }
    },
    plugins: [overlayPlugin]
    });
}

// Create a bar chart for ward summary
export function createWardSummaryChart(wardName, wardData) {
  const gradeLabels = [];
  const enrollmentData = [];

  wardData.forEach(school => {
    const grade = school.properties.grade_level;
    const enrollment = Math.round(school.properties["pred_enrollment"] || 0);

    const index = gradeLabels.indexOf(grade);
    if (index === -1) {
      gradeLabels.push(grade);
      enrollmentData.push(enrollment);
    } else {
      enrollmentData[index] += enrollment;
    }
  });

  if (charts.wardSummaryChart) {
    charts.wardSummaryChart.destroy();
  }

  const ctx = document.getElementById('ward-bar-chart').getContext('2d');
  charts.wardSummaryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gradeLabels,
      datasets: [{
        label: `Ward ${wardName} Enrollment`,
        data: enrollmentData,
        backgroundColor: '#5D7580',
        borderColor: '#5D7580',
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
}

// Update ward summary text
export function updateWardSummary(wardName, totalEnrollment) {
  const summaryText = document.getElementById('ward-summary-text');
  summaryText.textContent = `Ward ${wardName} has a total predicted enrollment of ${totalEnrollment}.`;
}