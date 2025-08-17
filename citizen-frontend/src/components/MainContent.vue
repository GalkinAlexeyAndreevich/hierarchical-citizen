<template>
  <main class="main">
    <div v-if="loading" class="loading">
      <p>Загрузка данных...</p>
    </div>
    
    <div v-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="$emit('retry')" class="btn btn-primary">Повторить</button>
    </div>

    <div v-if="showHierarchyConfig" class="hierarchy-config">
      <HierarchyManager 
        :hierarchy-config="hierarchyConfig"
        @update:hierarchy-config="$emit('hierarchy-update', $event)"
      />
    </div>

    <div v-if="showAddCity" class="add-city-section">
      <AddCity @city-added="$emit('city-added', $event)" />
    </div>

    <AddCitizenForm
      :show="showAddCitizen"
      :hierarchy-config="hierarchyConfig"
      :cities="cities"
      :hierarchy-options="hierarchyOptions"
      @submit="$emit('add-citizen', $event)"
      @city-selected="$emit('city-selected', $event)"
      @new-hierarchy-value="$emit('new-hierarchy-value', $event)"
    />

    <div class="hierarchy-tree">
      <HierarchyInfo
        :hierarchy-config="hierarchyConfig"
        :total-citizens="totalCitizens"
        :show-all-citizens="showAllCitizens"
        @toggle-citizens="$emit('toggle-citizens')"
      />
      <HierarchyTree 
        :data="hierarchicalData" 
        :config="hierarchyConfig"
        @node-click="$emit('node-click', $event)"
      />
    </div>

    <!-- Отображение всех жителей -->
    <div v-if="showAllCitizens" class="citizens-section">
             <CitizenHierarchyView 
         :citizens="citizens"
         :hierarchy-config="hierarchyConfig"
         :cities="cities"
       />
    </div>
  </main>
</template>

<script setup>
import HierarchyManager from './HierarchyManager.vue';
import AddCity from './AddCity.vue';
import AddCitizenForm from './AddCitizenForm.vue';
import HierarchyInfo from './HierarchyInfo.vue';
import HierarchyTree from './HierarchyTree.vue';
import CitizenHierarchyView from './CitizenHierarchyView.vue';

defineProps({
  loading: Boolean,
  error: String,
  showHierarchyConfig: Boolean,
  showAddCity: Boolean,
  showAddCitizen: Boolean,
  hierarchyConfig: Array,
  cities: Array,
  citizens: Array,
  hierarchyOptions: Object,
  hierarchicalData: Object,
  totalCitizens: Number,
  showAllCitizens: Boolean
});

defineEmits([
  'retry',
  'hierarchy-update',
  'city-added',
  'add-citizen',
  'city-selected',
  'new-hierarchy-value',
  'node-click',
  'toggle-citizens'
]);
</script>

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

.hierarchy-config, .add-city-section {
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
</style>
