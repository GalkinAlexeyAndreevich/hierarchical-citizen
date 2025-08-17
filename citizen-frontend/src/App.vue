<script setup>
import { ref, computed, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import MainContent from './components/MainContent.vue';
import { getCitizens, getCities, createCitizen, getHierarchyValues, getHierarchy, updateHierarchy } from './services/api';

const showHierarchyConfig = ref(false);
const showAddCitizen = ref(false);
const showAddCity = ref(false);
const showAllCitizens = ref(false);

const hierarchyConfig = ref([
  { type: 'city', name: 'Город', enabled: true, required: true },
  { type: 'district', name: 'Район', enabled: true },
  { type: 'street', name: 'Улица', enabled: true }
]);

const citiesData = ref([]);
const citizensData = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedHierarchyNode = ref(null);
const newCitizen = ref({});
const hierarchyOptions = ref({});

const hierarchicalData = computed(() => {
  return buildHierarchy(citizensData.value, hierarchyConfig.value, citiesData.value);
});

// Убрали сложную логику подсчета активных жителей

const refreshData = async () => {
  await loadData();
};

// Функция построения иерархии
function buildHierarchy(citizens, config, cities) {
  console.log("Информация о жителях", citizens);
  const hierarchy = {};
  
  const enabledLevels = config.filter(level => level.enabled);
  console.log("Активные уровни:", enabledLevels);
  
  citizens.forEach(citizen => {
    // Проверяем, есть ли у жителя ВСЕ активные уровни
    const hasAllLevels = enabledLevels.every(level => {
      const hasLevel = citizen.groups.some(g => g.type === level.type);
      console.log(`Гражданин ${citizen.name}: уровень ${level.type} (${level.name}) - ${hasLevel ? 'ЕСТЬ' : 'ОТСУТСТВУЕТ'}`);
      return hasLevel;
    });
    
    // Если у жителя нет всех уровней, пропускаем его
    if (!hasAllLevels) {
      console.log(`Гражданин ${citizen.name} пропущен - не все уровни`);
      return;
    }
    
    console.log(`Гражданин ${citizen.name} добавлен в иерархию`);
    
    let currentLevel = hierarchy;
    let parentPath = '';
    
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
          data: city ? city.population : 'Нет данных'
        });
      } else {
        currentLevel = currentLevel[levelValue].children;
        parentPath = parentPath ? parentPath + ' → ' + levelValue : levelValue;
      }
    });
  });
  
  return hierarchy;
}

function getLevelOptions(levelType) {
  return hierarchyOptions.value[levelType] || [];
}

// Добавление нового жителя
async function addNewCitizen(citizen) {
  try {
    console.log("citizen", structuredClone(citizen));
    citizen.groups = [];
    
    // Получаем активные уровни иерархии
    const activeLevels = hierarchyConfig.value.filter(level => level.enabled);
    console.log("Активные уровни для нового жителя:", activeLevels);
    
    // Проверяем, что все активные уровни заполнены
    const missingLevels = [];
    
          activeLevels.forEach(level => {
        if (level.type === 'city') {
          if (!citizen.city_id) {
            missingLevels.push(level.name);
          } else {
            // Для города находим название по ID
            const city = citiesData.value.find(c => c._id === citizen.city_id);
            if (city) {
              citizen.groups.push({
                type: 'city',
                name: city.name
              });
            }
          }
        } else if (citizen[level.type]) {
          // Для остальных уровней
          citizen.groups.push({
            type: level.type,
            name: citizen[level.type]
          });
        } else {
          missingLevels.push(level.name);
        }
      });
      
      // Убеждаемся, что поле city заполнено
      if (citizen.city_id) {
        citizen.city = citizen.city_id;
      }
    
    // Если есть незаполненные уровни, показываем ошибку
    if (missingLevels.length > 0) {
      throw new Error(`Необходимо заполнить все уровни иерархии: ${missingLevels.join(', ')}`);
    }
    
    console.log('Создаваемый житель:', citizen);
    console.log('Группы иерархии:', citizen.groups);
    
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
  if (node.type === 'Район') return 'district';
  if (node.type === 'Улица') return 'street';
  
  // Если не можем определить, возвращаем первый доступный тип
  return hierarchyConfig.value[0]?.type || 'district';
}

// Обработка нового значения иерархии
function handleNewHierarchyValue(value) {
  console.log('Создано новое значение иерархии:', value);
  // Добавляем новое значение в опции иерархии
  const levelType = Object.keys(newCitizen.value).find(key => 
    newCitizen.value[key] === value && hierarchyConfig.value.some(level => level.type === key)
  );
  
  if (levelType && !hierarchyOptions.value[levelType].includes(value)) {
    hierarchyOptions.value[levelType].push(value);
    hierarchyOptions.value[levelType].sort();
  }
}

// Обработка добавления нового города
function handleCityAdded(newCity) {
  console.log('Новый город добавлен:', newCity);
  // Добавляем новый город в список городов
  citiesData.value.push(newCity);
  // Скрываем форму добавления города
  showAddCity.value = false;
}

// Переключение отображения всех жителей
function toggleCitizens() {
  showAllCitizens.value = !showAllCitizens.value;
  console.log('Toggle all citizens:', showAllCitizens.value);
}

// Обработка выбора города
function handleCitySelected(city) {
  console.log('Выбран город:', city);
  // Город уже выбран через v-model
}

// Обработка обновления иерархии
async function handleHierarchyUpdate(newConfig) {
  console.log('Получено обновление иерархии:', newConfig);
  
  // Проверяем уникальность типов
  const types = newConfig.map(level => level.type).filter(type => type.trim());
  const uniqueTypes = new Set(types);
  
  if (types.length !== uniqueTypes.size) {
    alert('Ошибка: Типы уровней должны быть уникальными!');
    return;
  }
  
  // Проверяем, что все обязательные поля заполнены
  const hasEmptyFields = newConfig.some(level => !level.type.trim() || !level.name.trim());
  if (hasEmptyFields) {
    alert('Ошибка: Все поля должны быть заполнены!');
    return;
  }
  
  hierarchyConfig.value = newConfig;
  console.log("Новая конфигурация иерархии",newConfig);
  try {
    // Сохраняем изменения в БД
    await updateHierarchy({levels: newConfig});
    console.log('Иерархия сохранена в БД');
  } catch (error) {
    console.error('Ошибка сохранения иерархии:', error);
    alert('Ошибка сохранения иерархии: ' + error.message);
  }
  
  // Перезагружаем опции иерархии
  loadHierarchyOptions();
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
    // Загружаем города, жителей и активную конфигурацию иерархии параллельно
    const [citiesResponse, citizensResponse, hierarchyResponse] = await Promise.all([
      getCities(),
      getCitizens(),
      getHierarchy()
    ]);
    
    citiesData.value = citiesResponse.data;
    citizensData.value = citizensResponse.data;
    console.log("citizensData",citizensResponse.data);
    // Если есть конфигурация иерархии, используем её
    if (hierarchyResponse.data) {
      console.log('Загружена иерархия из БД:', hierarchyResponse.data);
      hierarchyConfig.value = hierarchyResponse.data;
    } else {
      console.log('Иерархия не найдена в БД, используем значение по умолчанию');
    }
    
    // Загружаем опции для каждого уровня иерархии
    await loadHierarchyOptions();
  } catch (err) {
    error.value = err.message;
    console.error('Ошибка загрузки данных:', err);
  } finally {
    loading.value = false;
  }
}

// Загрузка опций иерархии
async function loadHierarchyOptions() {
  try {
    for (const level of hierarchyConfig.value) {
      const response = await getHierarchyValues(level.type);
      hierarchyOptions.value[level.type] = response.data || [];
    }
  } catch (error) {
    console.error('Ошибка загрузки опций иерархии:', error);
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
  
  // Устанавливаем город как обязательный уровень
  const cityLevel = hierarchyConfig.value.find(level => level.type === 'city');
  if (cityLevel) {
    cityLevel.enabled = true;
    cityLevel.required = true;
  }
});
</script>

<template>
  <div id="app">
    <AppHeader
      :show-hierarchy-config="showHierarchyConfig"
      :show-add-citizen="showAddCitizen"
      :show-add-city="showAddCity"
      @toggle-hierarchy="showHierarchyConfig = !showHierarchyConfig"
      @toggle-add-citizen="showAddCitizen = !showAddCitizen"
      @toggle-add-city="showAddCity = !showAddCity"
      @refresh-data="refreshData"
    />

    <MainContent
      :loading="loading"
      :error="error"
      :show-hierarchy-config="showHierarchyConfig"
      :show-add-city="showAddCity"
      :show-add-citizen="showAddCitizen"
      :hierarchy-config="hierarchyConfig"
      :cities="citiesData"
      :citizens="citizensData"
      :hierarchy-options="hierarchyOptions"
      :hierarchical-data="hierarchicalData"
      :total-citizens="citizensData.length"
      :show-all-citizens="showAllCitizens"
      @retry="loadData"
      @hierarchy-update="handleHierarchyUpdate"
      @city-added="handleCityAdded"
      @add-citizen="addNewCitizen"
      @city-selected="handleCitySelected"
      @new-hierarchy-value="handleNewHierarchyValue"
      @node-click="handleNodeClick"
      @toggle-citizens="toggleCitizens"
    />
  </div>
</template>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
