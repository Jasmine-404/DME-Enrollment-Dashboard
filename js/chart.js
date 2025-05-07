import { cumulative_permits, pct_change_capacity } from './sliderConfig.js';

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
    (selectedSchoolYear === '' || school.properties.school_year === selectedSchoolYear) &&
    school.properties.cumulative_permits5yr === cumulative_permits &&
    school.properties.pct_change_capacity_5yrlater === pct_change_capacity
  );
  

  const gradeLabels = [];
  const enrollmentData = [];
  const backgroundColors = [];

  schoolGrades.forEach(school => {
    const grade = school.properties.grade_level;
    const enrollment = Math.round(school.properties["enrollment"] || 0);

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

  console.log("Drawing chart for:", schoolName, "year:", selectedSchoolYear);
  console.log("Filtered records:", schoolGrades.length);
  console.log("gradeLabels:", gradeLabels);
  console.log("enrollmentData:", enrollmentData);

}

// Create a line chart for enrollment trends
export function createEnrollmentTrendChart(feature, schoolData) {
  const schoolName = feature.properties.school_name;

  const trendData = schoolData.features.filter(school =>
    school.properties.school_name === schoolName &&
    school.properties.cumulative_permits5yr === cumulative_permits &&
    school.properties.pct_change_capacity_5yrlater === pct_change_capacity
  );

  // 固定 school years 横轴顺序（如你项目范围）
  const allYears = ["SY24-25", "SY25-26", "SY26-27", "SY27-28", "SY28-29", "SY29-30"];

  // 构造：grade -> { year -> enrollment }
  const gradeMap = {};

  trendData.forEach(school => {
    const grade = school.properties.grade_level;
    const year = school.properties.school_year;
    const enrollment = Math.round(school.properties.enrollment || 0);

    if (!gradeMap[grade]) {
      gradeMap[grade] = {};
    }
    gradeMap[grade][year] = (gradeMap[grade][year] || 0) + enrollment;
  });

  // 排序 grade：K, 1, 2, ..., 5
  const sortedGrades = Object.keys(gradeMap).sort((a, b) => {
    if (a === "K") return -1;
    if (b === "K") return 1;
    return parseInt(a) - parseInt(b);
  });

  // 构造 datasets：每个 grade 一条线，按年份对齐
  const datasets = sortedGrades.map(grade => {
    return {
      label: grade,
      data: allYears.map(year => gradeMap[grade][year] ?? null),
      borderColor: gradeColors[grade] || '#000000',
      borderWidth: 2,
      tension: 0.3,
      spanGaps: false,
      fill: false
    };
  });

  if (charts.enrollmentTrendChart) charts.enrollmentTrendChart.destroy();

  const ctx = document.getElementById('line-chart').getContext('2d');

  // 计算数据最大最小值
  const allValues = datasets.flatMap(d => d.data).filter(v => v !== null);
  const minVal = Math.floor(Math.min(...allValues) * 0.95);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.05);

  charts.enrollmentTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allYears,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'line'
          }
        }
      },

      scales: {
        y: {
          beginAtZero: false,
          min: minVal,
          max: maxVal,
          title: {
            display: true,
            text: 'Enrollment'
          }
        },

      // scales: {
      //   y: {
      //     beginAtZero: true,
      //     title: {
      //       display: true,
      //       text: 'Enrollment'
      //     }
      //   },
        x: {
          title: {
            display: true,
            text: 'School Year'
          }
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
    const enrollment = Math.round(school.properties["enrollment"] || 0);

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