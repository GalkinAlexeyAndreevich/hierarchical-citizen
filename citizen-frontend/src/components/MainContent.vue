<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import HierarchyManager from './HierarchyManager.vue';
import AddCity from './AddCity.vue';
import AddCitizenForm from './AddCitizenForm.vue';
import HierarchyInfo from './HierarchyInfo.vue';
import HierarchyTree from './HierarchyTree.vue';
import CitizenHierarchyView from './CitizenHierarchyView.vue';
import { useUIStore } from '../stores/ui';
import { useCitizensStore } from '../stores/citizens';
import { useCitiesStore } from '../stores/cities';
import { useHierarchyStore } from '../stores/hierarchy';

// Используем UI store напрямую
const uiStore = useUIStore();
const { 
  showHierarchyConfig, 
  showAddCity, 
  showAddCitizen, 
  showAllCitizens
} = storeToRefs(uiStore);

const {
  toggleHierarchyConfig,
  toggleAddCity,
  toggleAddCitizen,
  toggleAllCitizens,
  resetAllStates
} = uiStore;

// Используем store'ы напрямую
const citizensStore = useCitizensStore();
const citiesStore = useCitiesStore();
const hierarchyStore = useHierarchyStore();

// Получаем реактивные данные через storeToRefs
const { 
  citizens, 
  totalCitizens, 
  hierarchicalData,
  loading: citizensLoading,
  error: citizensError
} = storeToRefs(citizensStore);

const { 
  cities, 
  loading: citiesLoading,
  error: citiesError
} = storeToRefs(citiesStore);

const { 
  hierarchyConfig, 
  loading: hierarchyLoading,
  error: hierarchyError
} = storeToRefs(hierarchyStore);

// Локальные состояния
const loading = ref(false);
const error = ref(null);

// Загрузка всех данных
async function loadAllData() {
  loading.value = true;
  error.value = null;
  
  try {
    await Promise.all([
      citiesStore.fetchCities(),
      citizensStore.fetchCitizens(),
      hierarchyStore.fetchHierarchy()
    ]);
  } catch (err) {
    console.error('Общая ошибка загрузки данных:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Обработчики событий
async function handleHierarchyUpdate(newConfig) {
  try {
    await hierarchyStore.updateHierarchyConfig(newConfig);
  } catch (err) {
    error.value = err.message;
  }
}

async function handleCityAdded(cityData) {
  try {
    const newCity = await citiesStore.addCity(cityData);
    // Закрываем форму
    toggleAddCity();
    // Обновляем данные
    await loadAllData();
  } catch (err) {
    error.value = err.message;
  }
}

async function handleAddCitizen(citizenData) {
  try {
    // Создаем жителя через store
    await citizensStore.addCitizen(citizenData);
    // Закрываем форму
    toggleAddCitizen();
    // Обновляем данные
    await loadAllData();
  } catch (err) {
    error.value = err.message;
  }
 }

function handleToggleCitizens() {
  toggleAllCitizens();
}

function handleCitySelected(city) {
  // Город выбран
}

function handleNewHierarchyValue(value) {
  // Новое значение иерархии
}

// Загружаем данные при монтировании
onMounted(async () => {
  try {
    // Сбрасываем все состояния перед загрузкой
    resetAllStates();
    await loadAllData();
  } catch (err) {
    console.error('Ошибка при загрузке данных при монтировании:', err);
  }
});

// Функция для закрытия всех форм
function closeAllForms() {
  resetAllStates();
}




</script>

<template>
  <main class="main">
    <div v-if="loading" class="loading">
      <p>Загрузка данных...</p>
    </div>
    
    <div v-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="loadAllData" class="btn btn-primary">Повторить</button>
    </div>

    <div v-if="showHierarchyConfig && hierarchyConfig" class="hierarchy-config">
      <HierarchyManager 
        :hierarchy-config="hierarchyConfig"
        @update:hierarchy-config="handleHierarchyUpdate"
      />
    </div>

    <div v-if="showAddCity" class="add-city-section">
      <AddCity @city-added="handleCityAdded" />
    </div>

    <div v-if="showAddCitizen && hierarchyConfig && cities" class="add-citizen-section">
      <AddCitizenForm
        :hierarchy-config="hierarchyConfig"
        :cities="cities"
        :hierarchy-options="{}"
        @submit="handleAddCitizen"
        @city-selected="handleCitySelected"
        @new-hierarchy-value="handleNewHierarchyValue"
      />
    </div>

    <div class="hierarchy-tree">
      <HierarchyInfo
        v-if="hierarchyConfig"
        :hierarchy-config="hierarchyConfig"
        :total-citizens="totalCitizens"
        :show-all-citizens="showAllCitizens"
        @toggle-citizens="handleToggleCitizens"
      />
      

      <HierarchyTree 
        v-if="hierarchicalData && hierarchyConfig"
        :data="hierarchicalData" 
        :config="hierarchyConfig"
      />
    </div>

    <!-- Отображение всех жителей -->
    <div v-if="showAllCitizens && citizens && hierarchyConfig && cities" class="citizens-section">
      <CitizenHierarchyView 
        :citizens="citizens"
        :hierarchy-config="hierarchyConfig"
        :cities="cities"
      />
    </div>
  </main>
</template>

<style scoped>
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

.hierarchy-config, .add-city-section, .add-citizen-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.hierarchy-tree {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  min-height: 400px;
}

.citizens-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.status-info h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}
</style>
