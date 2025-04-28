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

  if (window.chartInstance) {
    window.chartInstance.destroy();
  }

  const ctx = document.getElementById('bar-chart').getContext('2d');
  window.chartInstance = new Chart(ctx, {
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