// sliderConfig.js
import { getLastClickedFeature } from './filters.js';
import { createEnrollmentChart, createEnrollmentTrendChart } from './chart.js';
import { schoolData } from './main.js';


export let cumulative_permits = 1500;
export let pct_change_capacity = 0;

// 设置 slider 显示值数组
const cumulativeValues = [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 4000, 6000, 8000];
const capacityValues = [-0.5, -0.25, -0.1, -0.05, 0, 0.05, 0.1, 0.25, 0.5, 1, 1.5];

// 获取 DOM 元素
const constructionSlider = document.getElementById('construction-slider');
const constructionValue = document.getElementById('construction-value');
const enrollmentSlider = document.getElementById('enrollment-slider');
const enrollmentValue = document.getElementById('enrollment-value');

// 初始化 slider 设置（使用 index）
constructionSlider.min = 0;
constructionSlider.max = cumulativeValues.length - 1;
constructionSlider.value = cumulativeValues.indexOf(1500); // 默认值
constructionValue.textContent = cumulativeValues[+constructionSlider.value];

enrollmentSlider.min = 0;
enrollmentSlider.max = capacityValues.length - 1;
enrollmentSlider.value = capacityValues.indexOf(0); // 默认值
enrollmentValue.textContent = capacityValues[+enrollmentSlider.value];

constructionSlider.addEventListener('input', function () {
  cumulative_permits = cumulativeValues[+this.value];
  constructionValue.textContent = cumulative_permits;
  updateScenario();
});

enrollmentSlider.addEventListener('input', function () {
  pct_change_capacity = capacityValues[+this.value];
  // enrollmentValue.textContent = pct_change_capacity;
  enrollmentValue.textContent = (pct_change_capacity * 100).toFixed(0) + '%';

  updateScenario();
});

function updateScenario() {
  const selectedFeature = getLastClickedFeature();
  const selectedYear = document.getElementById('school-year-select').value;
  const absoluteCapacityElement = document.getElementById('absolute-capacity');

  if (!selectedFeature || !schoolData) return;

  const schoolName = selectedFeature.properties.school_name;

  const filtered = schoolData.features.filter(school =>
    school.properties.school_name === schoolName &&
    school.properties.school_year === selectedYear &&
    school.properties.cumulative_permits5yr === cumulative_permits &&
    school.properties.pct_change_capacity_5yrlater === pct_change_capacity
  );

  if (filtered.length > 0) {
    // 👇 新增：显示绝对 capacity
    const absCap = filtered[0].properties.abs_change_capacity_5yrlater;
    absoluteCapacityElement.textContent = absCap !== undefined ? absCap : '—';
  
    createEnrollmentChart(selectedFeature, schoolData);
    createEnrollmentTrendChart(selectedFeature, schoolData);
  } else {
    absoluteCapacityElement.textContent = '—';
  }
  
  if (filtered.length > 0) {
    createEnrollmentChart(selectedFeature, schoolData);
    createEnrollmentTrendChart(selectedFeature, schoolData);
  }
}
