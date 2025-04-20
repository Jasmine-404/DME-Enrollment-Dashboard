// 获取必要的 DOM 元素
const mapButton = document.getElementById('map-btn');
const predictionButton = document.getElementById('prediction-btn');
const filterPanel = document.getElementById('filter-panel');
const infoPanel = document.getElementById('info-panel');
const legendPanel = document.getElementById('legend');
const predictionPanel = document.getElementById('pred-panel');
const mapPanel =document.getElementById('map');

// 初始状态设置
function initializeUI() {
  filterPanel.style.display = 'block'; // 默认显示滑块
  infoPanel.style.display = 'block'; // 默认显示条形图
  mapPanel.style.display = 'block'; // 默认显示地图
  legendPanel.style.display = 'block'; // 默认显示图例

  predictionPanel.style.display = 'none'; // 默认隐藏表单
  aggregatePanel.style.display = 'none'; // 默认隐藏表单
  mapPanel2.style.display = 'none'; // 默认隐藏表单

  // 设置“Data Analysis”按钮为激活状态
  mapButton.classList.add('active');
}

// 点击“Map”按钮时的逻辑
mapButton.addEventListener('click', () => {
  filterPanel.style.display = 'block'; // 显示滑块
  infoPanel.style.display = 'block'; // 显示条形图
  mapPanel.style.display = 'block'; // 默认显示地图
  legendPanel.style.display = 'block'; // 默认显示图例

  predictionPanel.style.display = 'none'; // 隐藏表单
  aggregatePanel.style.display = 'none'; // 默认隐藏表单
  mapPanel2.style.display = 'none'; // 默认隐藏表单

  // 可选：添加按钮激活状态样式
  mapButton.classList.add('active');
  predictionButton.classList.remove('active');
});

// 点击“prediction"按钮时的逻辑
predictionButton.addEventListener('click', () => {
  filterPanel.style.display = 'none'; // 隐藏滑块
  infoPanel.style.display = 'none'; // 隐藏条形图
  legendPanel.style.display = 'none'; // 默认显示图例

  mapPanel.style.display = 'block'; // 默认显示地图
  predictionPanel.style.display = 'block'; // 显示表单
  aggregatePanel.style.display = 'block'; // 默认隐藏表单

    // 当显示第二个页面时，触发地图重新初始化事件
    window.dispatchEvent(new CustomEvent('initializeMap2'));
  // 可选：添加按钮激活状态样式
  predictionButton.classList.add('active');
  mapButton.classList.remove('active');
});

// 初始化
initializeUI();
