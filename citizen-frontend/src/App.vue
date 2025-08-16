<script setup>
import { ref, computed, onMounted } from 'vue';
import HierarchyTree from './components/HierarchyTree.vue';
import InputSelect from './components/InputSelect.vue';
import { getCitizens, getCities, createCitizen } from './services/api';

const showHierarchyConfig = ref(false);
const showAddCitizen = ref(false);

const hierarchyConfig = ref([
  { type: 'city', name: 'Город', enabled: true },
  { type: 'district', name: 'Район', enabled: true },
  { type: 'street', name: 'Улица', enabled: true },
  { type: 'house', name: 'Дом', enabled: false }
]);

const citiesData = ref([]);
const citizensData = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedHierarchyNode = ref(null);
const newCitizen = ref({});

const hierarchicalData = computed(() => {
  return buildHierarchy(citizensData.value, hierarchyConfig.value, citiesData.value);
});

const activeCitizensCount = computed(() => {
  const enabledLevels = hierarchyConfig.value.filter(level => level.enabled);
  let count = 0;
  
  citizensData.value.forEach(citizen => {
    const hasAllLevels = enabledLevels.every(level => {
      return citizen.groups.some(group => group.type === level.type);
    });
    if (hasAllLevels) {
      count++;
    }
  });
  
  return count;
});

const refreshData = async () => {
  await loadData();
};

// Функция построения иерархии
function buildHierarchy(citizens, config, cities) {
  const hierarchy = {};
  
  citizens.forEach(citizen => {
    let currentLevel = hierarchy;
    let parentPath = '';
    
    const enabledLevels = config.filter(level => level.enabled);
    
    enabledLevels.forEach((level, index) => {
      const levelType = level.type;
      const group = citizen.groups.find(g => g.type === levelType);
      
      if (!group) return;
      
      const levelValue = group.name;
      
      if (!currentLevel[levelValue]) {
        currentLevel[levelValue] = {
          type: level.name,
          typeKey: levelType,
          children: {},
          citizens: [],
          parentPath: parentPath
        };
      }
      
      if (index === enabledLevels.length - 1) {
        const city = cities.find(c => c._id === citizen.city_id);
        currentLevel[levelValue].citizens.push({
          id: citizen._id,
          name: citizen.name,
          data: city ? city.data : 'Нет данных'
        });
      } else {
        currentLevel = currentLevel[levelValue].children;
        parentPath = parentPath ? parentPath + ' → ' + levelValue : levelValue;
      }
    });
  });
  
  return hierarchy;
}

function toggleLevelVisibility(index) {
  hierarchyConfig.value[index].enabled = !hierarchyConfig.value[index].enabled;
}

function enableAllLevels() {
  hierarchyConfig.value.forEach(level => {
    level.enabled = true;
  });
}

function disableAllLevels() {
  hierarchyConfig.value.forEach(level => {
    level.enabled = false;
  });
}

function enableBasicLevels() {
  hierarchyConfig.value.forEach(level => {
    if (['city', 'district', 'street'].includes(level.type)) {
      level.enabled = true;
    } else {
      level.enabled = false;
    }
  });
}

function getLevelOptions(levelType) {
  const options = new Set();
  citizensData.value.forEach(citizen => {
    const group = citizen.groups.find(g => g.type === levelType);
    if (group) {
      options.add(group.name);
    }
  });
  return Array.from(options).sort();
}

function getCityOptions() {
  return citiesData.value.map(city => ({
    value: city._id,
    label: city.name
  }));
}

function addLevel() {
  hierarchyConfig.value.push({ type: '', name: '', enabled: true });
}

function removeLevel(index) {
  hierarchyConfig.value.splice(index, 1);
}

function saveHierarchyConfig() {
  showHierarchyConfig.value = false;
}

// Добавление нового жителя
async function addNewCitizen() {
  try {
    const citizen = { ...newCitizen.value };
    
    citizen.groups = [];
    hierarchyConfig.value.forEach(level => {
      if (citizen[level.type]) {
        citizen.groups.push({
          type: level.type,
          name: citizen[level.type]
        });
      }
    });
    
    if (!citizen.city_id) {
      throw new Error('Необходимо выбрать город');
    }
    
    const response = await createCitizen(citizen);
    citizensData.value.push(response.data);
    
    Object.keys(newCitizen.value).forEach(key => {
      newCitizen.value[key] = '';
    });
    
    showAddCitizen.value = false;
  } catch (err) {
    error.value = err.message;
    console.error('Ошибка добавления жителя:', err);
  }
}

// Обработка клика по узлу дерева
function handleNodeClick(node) {
  console.log('Клик по узлу:', node);
  
  // Если это узел с жителями, предлагаем добавить туда нового жителя
  if (node.node && node.node.citizens && node.node.citizens.length > 0) {
    selectedHierarchyNode.value = {
      node: node.node,
      key: node.key,
      level: node.level,
      path: getNodePath(node.node, node.key)
    };
    
    // Автоматически заполняем форму иерархии
    fillHierarchyFromNode(selectedHierarchyNode.value);
    
    // Показываем форму добавления жителя
    showAddCitizen.value = true;
  }
}

// Получение пути к узлу
function getNodePath(node, key) {
  let path = key;
  let current = node;
  
  while (current && current.parentPath) {
    path = current.parentPath + ' → ' + path;
    current = current.parent;
  }
  
  return path;
}

// Заполнение иерархии на основе выбранного узла
function fillHierarchyFromNode(hierarchyNode) {
  if (!hierarchyNode || !hierarchyNode.node) return;
  
  // Определяем тип узла по его структуре
  const nodeType = determineNodeType(hierarchyNode.node);
  
  // Находим соответствующий уровень в конфигурации
  const levelIndex = hierarchyConfig.value.findIndex(level => level.type === nodeType);
  
  if (levelIndex !== -1) {
    // Устанавливаем значение для этого уровня
    newCitizen.value[nodeType] = hierarchyNode.key;
  }
}

// Определение типа узла
function determineNodeType(node) {
  // Простая логика определения типа по структуре узла
  if (node.type === 'Город') return 'city';
  if (node.type === 'Район') return 'district';
  if (node.type === 'Улица') return 'street';
  if (node.type === 'Дом') return 'house';
  
  // Если не можем определить, возвращаем первый доступный тип
  return hierarchyConfig.value[0]?.type || 'city';
}

// Обработка нового значения иерархии
function handleNewHierarchyValue(value) {
  console.log('Создано новое значение иерархии:', value);
  // Здесь можно добавить логику для сохранения нового значения
}

// Очистка формы
function clearForm() {
  Object.keys(newCitizen.value).forEach(key => {
    newCitizen.value[key] = '';
  });
  selectedHierarchyNode.value = null;
}

// Загрузка данных с API
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Загружаем города и жителей параллельно
    const [citiesResponse, citizensResponse] = await Promise.all([
      getCities(),
      getCitizens()
    ]);
    
    citiesData.value = citiesResponse.data;
    citizensData.value = citizensResponse.data;
  } catch (err) {
    error.value = err.message;
    console.error('Ошибка загрузки данных:', err);
  } finally {
    loading.value = false;
  }
}

// Инициализация формы нового жителя
onMounted(() => {
  // Загружаем данные при монтировании компонента
  loadData();
  
  hierarchyConfig.value.forEach(level => {
    newCitizen.value[level.type] = '';
  });
  newCitizen.value.name = '';
});
</script>

<template>
  <div id="app">
    <header class="header">
      <h1>Иерархия жителей</h1>
      <div class="controls">
        <button @click="showHierarchyConfig = !showHierarchyConfig" class="btn btn-primary">
          {{ showHierarchyConfig ? 'Скрыть' : 'Показать' }} настройки иерархии
        </button>
        <button @click="showAddCitizen = !showAddCitizen" class="btn btn-success">
          {{ showAddCitizen ? 'Скрыть' : 'Добавить' }} жителя
        </button>
        <button @click="refreshData" class="btn btn-info">
          Обновить данные
        </button>
      </div>
    </header>

    <main class="main">
      <div v-if="loading" class="loading">
        <p>Загрузка данных...</p>
      </div>
      
      <div v-if="error" class="error">
        <p>Ошибка: {{ error }}</p>
        <button @click="loadData" class="btn btn-primary">Повторить</button>
      </div>

      <div v-if="showHierarchyConfig" class="hierarchy-config">
        <h3>Настройка иерархии</h3>
        <p class="config-description">
          Включите или выключите уровни иерархии для отображения в дереве. 
          Жители будут группироваться только по включенным уровням.
        </p>
        <div class="hierarchy-levels">
          <div v-for="(level, index) in hierarchyConfig" :key="index" class="level-item">
            <div class="level-controls">
              <input 
                v-model="level.type" 
                placeholder="Тип уровня (city, district, street)"
                class="level-input"
              />
              <input 
                v-model="level.name" 
                placeholder="Название уровня"
                class="level-input"
              />
              <button @click="removeLevel(index)" class="btn btn-danger btn-sm">Удалить</button>
            </div>
            <div class="level-visibility">
              <span class="visibility-label">{{ level.enabled ? 'Включен' : 'Выключен' }}</span>
              <label class="toggle-switch">
                <input type="checkbox" :checked="level.enabled" @change="toggleLevelVisibility(index)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="quick-actions">
          <button @click="enableAllLevels" class="btn btn-success btn-sm">Включить все</button>
          <button @click="disableAllLevels" class="btn btn-secondary btn-sm">Выключить все</button>
          <button @click="enableBasicLevels" class="btn btn-info btn-sm">Только основные</button>
        </div>
        <button @click="addLevel" class="btn btn-secondary">Добавить уровень</button>
        <button @click="saveHierarchyConfig" class="btn btn-primary">Сохранить</button>
      </div>

      <div v-if="showAddCitizen" class="add-citizen">
        <h3>Добавить нового жителя</h3>
        <form @submit.prevent="addNewCitizen" class="citizen-form">
          <div v-for="level in hierarchyConfig" :key="level.type" class="form-group">
            <label>{{ level.name }}:</label>
            <select v-model="newCitizen[level.type]" required class="form-select">
              <option value="">Выберите {{ level.name.toLowerCase() }}</option>
              <option v-for="option in getLevelOptions(level.type)" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Город:</label>
            <select v-model="newCitizen.city_id" required class="form-select">
              <option value="">Выберите город</option>
              <option v-for="city in getCityOptions()" :key="city.value" :value="city.value">
                {{ city.label }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Имя жителя:</label>
            <input v-model="newCitizen.name" required class="form-input" />
          </div>
          <button type="submit" class="btn btn-success">Добавить жителя</button>
        </form>
      </div>

      <div class="hierarchy-tree">
        <div class="hierarchy-info">
          <h3>Дерево иерархии</h3>
          <div class="hierarchy-status">
            <p>
              <strong>Активные уровни:</strong> 
              {{ hierarchyConfig.filter(level => level.enabled).map(level => level.name).join(' → ') }}
            </p>
            <p>
              <strong>Всего жителей:</strong> {{ citizensData.length }}
            </p>
            <p>
              <strong>В текущей иерархии:</strong> {{ activeCitizensCount }}
              <span v-if="activeCitizensCount < citizensData.length" class="warning-text">
                ({{ citizensData.length - activeCitizensCount }} не попадают в иерархию)
              </span>
            </p>
            <p>
              <strong>Уровней в иерархии:</strong> {{ hierarchyConfig.filter(level => level.enabled).length }}
            </p>
          </div>
        </div>
        <HierarchyTree 
          :data="hierarchicalData" 
          :config="hierarchyConfig"
          @node-click="handleNodeClick"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0 0 15px 0;
  font-size: 2.5em;
  text-align: center;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-actions .btn {
  margin: 0;
}

  .main {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .loading, .error {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    text-align: center;
  }

  .loading p {
    color: #666;
    font-size: 1.1em;
    margin: 0;
  }

  .error {
    border-color: #dc3545;
    background-color: #f8d7da;
  }

  .error p {
    color: #721c24;
    font-size: 1.1em;
    margin: 0 0 15px 0;
  }

  .selected-hierarchy {
    background: #e8f5e8;
    border: 1px solid #28a745;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .selected-hierarchy h4 {
    margin: 0 0 10px 0;
    color: #28a745;
    font-size: 1.1em;
  }

  .hierarchy-path {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .path-label {
    font-weight: 500;
    color: #555;
    min-width: 60px;
  }

  .path-value {
    background: white;
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-family: monospace;
    color: #333;
  }

  .hierarchy-info {
    display: flex;
    gap: 20px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .info-item strong {
    color: #555;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    margin-top: 20px;
  }

.hierarchy-config, .add-citizen {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.hierarchy-config h3, .add-citizen h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.hierarchy-config .config-description {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 15px;
  text-align: center;
}

.hierarchy-levels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.level-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.level-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.level-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.level-visibility {
  display: flex;
  align-items: center;
  gap: 10px;
}

.visibility-label {
  font-size: 0.9em;
  color: #555;
}

.citizen-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-input, .form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.hierarchy-tree {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  min-height: 400px;
}

.hierarchy-info {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff;
}

.hierarchy-info h3 {
  margin-top: 0;
  color: #333;
  border-bottom: none;
  padding-bottom: 0;
}

.hierarchy-status {
  font-size: 0.9em;
  color: #666;
  line-height: 1.5;
}

.warning-text {
  color: #dc3545; /* Красный цвет для предупреждения */
  font-weight: bold;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  margin-left: 10px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .slider {
  background-color: #28a745;
}

input:focus + .slider {
  box-shadow: 0 0 1px #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Анимации для переключателей */
.toggle-switch:hover .slider {
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
}

.toggle-switch:hover input:checked + .slider {
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.3), 0 0 8px rgba(40, 167, 69, 0.4);
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  .level-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
