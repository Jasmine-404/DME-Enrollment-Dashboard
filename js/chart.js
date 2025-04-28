let charts = {};

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

  schoolGrades.forEach(school => {
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

  if (charts.enrollmentChart) {
    charts.enrollmentChart.destroy();
  }

  const ctx = document.getElementById('bar-chart').getContext('2d');
  charts.enrollmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gradeLabels,
      datasets: [{
        label: `Enrollment ${selectedSchoolYear}`,
        data: enrollmentData,
        backgroundColor: '#270143',
        borderColor: '#270143',
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

// Create a line chart for enrollment trends
export function createEnrollmentTrendChart(feature, schoolData) {
  const schoolName = feature.properties.school_name;

  const schoolTrends = schoolData.features.filter(school =>
    school.properties.school_name === schoolName
  );

  const yearLabels = [];
  const enrollmentData = [];

  schoolTrends.forEach(school => {
    const year = school.properties.pred_year;
    const enrollment = Math.round(school.properties["pred_enrollment"] || 0);

    const index = yearLabels.indexOf(year);
    if (index === -1) {
      yearLabels.push(year);
      enrollmentData.push(enrollment);
    } else {
      enrollmentData[index] += enrollment;
    }
  });

  if (charts.enrollmentTrendChart) {
    charts.enrollmentTrendChart.destroy();
  }

  const ctx = document.getElementById('line-chart').getContext('2d');
  charts.enrollmentTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: yearLabels,
      datasets: [{
        label: 'Enrollment Trends',
        data: enrollmentData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
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