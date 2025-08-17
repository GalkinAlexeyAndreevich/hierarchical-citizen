<script setup>
import { ref, watch } from 'vue';
import CitySelect from './CitySelect.vue';
import InputSelect from './InputSelect.vue';

const props = defineProps({
  show: Boolean,
  hierarchyConfig: Array,
  cities: Array,
  hierarchyOptions: Object
});

const emit = defineEmits(['submit', 'city-selected', 'new-hierarchy-value']);

const formData = ref({
  name: '',
  city_id: ''
});

// Инициализируем поля для каждого уровня иерархии
watch(() => props.hierarchyConfig, (newConfig) => {
  if (newConfig) {
    formData.value = {
      name: '',
      city_id: ''
    };
    newConfig.forEach(level => {
      formData.value[level.type] = '';
    });
  }
}, { immediate: true });

function getLevelOptions(levelType) {
  return props.hierarchyOptions[levelType] || [];
}

function handleSubmit() {
  console.log("formData",{ ...formData.value });
  emit('submit', { ...formData.value });
}

function handleCitySelected(city) {
  emit('city-selected', city);
}

function handleNewHierarchyValue(value) {
  emit('new-hierarchy-value', value);
}
</script>

<template>
  <div class="add-citizen">
    <h3>Добавить нового жителя</h3>
    <form @submit.prevent="handleSubmit" class="citizen-form">
      <div v-for="level in hierarchyConfig" :key="level.type" class="form-group">
        <label>{{ level.name }}:</label>
        <!-- Для города используем CitySelect, для остальных - InputSelect -->
        <CitySelect 
          v-if="level.type === 'city'"
          v-model="formData.city_id" 
          :cities="cities"
          :placeholder="'Выберите город'"
          @city-selected="handleCitySelected"
          required
        />
        <InputSelect 
          v-else
          v-model="formData[level.type]" 
          :options="getLevelOptions(level.type)"
          :placeholder="`Введите или выберите ${level.name.toLowerCase()}`"
          @new-value="handleNewHierarchyValue"
          required
        />
      </div>
      <div class="form-group">
        <label>Имя жителя:</label>
        <input v-model="formData.name" required class="form-input" />
      </div>
      <button type="submit" class="btn btn-success">Добавить жителя</button>
    </form>
  </div>
</template>

<style scoped>
.add-citizen {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.add-citizen h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
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

.form-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
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

.btn-success {
  background: #28a745;
  color: white;
}
</style>
