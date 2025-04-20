export function createEnrollmentChart(feature, schoolData) {
  const schoolName = feature.properties.school_name;

  // 获取当前选中的 school_year
  const selectedSchoolYear = document.getElementById('school-year-select').value;

  // 筛选出该学校当前 school_year 的数据
  const schoolGrades = schoolData.features.filter(school =>
    school.properties.school_name === schoolName &&
    (selectedSchoolYear === '' || school.properties.school_year_pred === selectedSchoolYear)
  );

  // 处理图表数据
  const gradeLabels = [];
  const enrollmentData = [];

  schoolGrades.forEach(school => {
    const grade = school.properties.grade_level;
    const enrollment = school.properties[".pred"] || 0;

    const index = gradeLabels.indexOf(grade);
    if (index === -1) {
      gradeLabels.push(grade);
      enrollmentData.push(enrollment);
    } else {
      enrollmentData[index] += enrollment;
    }
  });

  // 清除旧图表
  if (window.chartInstance) {
    window.chartInstance.destroy();
  }

  // 创建新图表
  const ctx = document.getElementById('bar-chart').getContext('2d');
  window.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gradeLabels,
      datasets: [{
        label: `Enrollment (${selectedSchoolYear})`,
        data: enrollmentData,
        backgroundColor: 'rgba(135, 206, 250, 0.5)',
        borderColor: 'rgba(135, 206, 250, 1)',
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
