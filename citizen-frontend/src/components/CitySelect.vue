<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  cities: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Выберите город'
  },
  required: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'city-selected']);

const inputValue = ref('');
const showDropdown = ref(false);
const selectedCityId = ref('');
const showError = ref(false);

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const city = props.cities.find(c => c._id === newValue);
    if (city) {
      inputValue.value = city.name;
      selectedCityId.value = city._id;
    }
  }
});

const filteredCities = computed(() => {
  if (!inputValue.value) return props.cities;
  return props.cities.filter(city => 
    city.name.toLowerCase().includes(inputValue.value.toLowerCase())
  );
});

function handleInput() {
  showDropdown.value = true;
  showError.value = false;
  selectedCityId.value = '';
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false;
    validateSelection();
  }, 200);
}

function handleKeydown(event) {
  if (!showDropdown.value) return;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      const currentIndex = filteredCities.value.findIndex(city => city._id === selectedCityId.value);
      const nextIndex = Math.min(currentIndex + 1, filteredCities.value.length - 1);
      selectedCityId.value = filteredCities.value[nextIndex]?._id || '';
      break;
    case 'ArrowUp':
      event.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      selectedCityId.value = filteredCities.value[prevIndex]?._id || '';
      break;
    case 'Enter':
      event.preventDefault();
      if (selectedCityId.value) {
        const city = props.cities.find(c => c._id === selectedCityId.value);
        if (city) selectCity(city);
      }
      break;
    case 'Escape':
      showDropdown.value = false;
      break;
  }
}

function selectCity(city) {
  inputValue.value = city.name;
  selectedCityId.value = city._id;
  emit('update:modelValue', city._id);
  emit('city-selected', city);
  showDropdown.value = false;
  showError.value = false;
}

function validateSelection() {
  if (props.required && !selectedCityId.value) {
    showError.value = true;
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function formatPopulation(population) {
  if (!population) return '0';
  return new Intl.NumberFormat('ru-RU').format(population);
}
</script>

<template>
  <div class="city-select-container">
    <div class="input-wrapper">
      <input
        v-model="inputValue"
        :placeholder="placeholder"
        class="city-input-field"
        :class="{ 'error': showError }"
        @input="handleInput"
        @focus="showDropdown = true; showError = false"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <div class="input-arrow" @click="toggleDropdown">▼</div>
    </div>
    
    <div v-if="showError" class="error-message">
      Пожалуйста, выберите город из списка
    </div>
    
    <div v-if="showDropdown && filteredCities.length > 0" class="dropdown">
      <div
        v-for="city in filteredCities"
        :key="city._id"
        :class="['dropdown-item', { 'selected': city._id === selectedCityId }]"
        @click="selectCity(city)"
        @mouseenter="selectedCityId = city._id"
      >
        <div class="city-name">{{ city.name }}</div>
        <div class="city-population">{{ formatPopulation(city.population) }}</div>
      </div>
    </div>
    
    <div v-if="showDropdown && filteredCities.length === 0 && inputValue" class="dropdown">
      <div class="dropdown-item no-results">
        Город не найден. Введите другое название.
      </div>
    </div>
  </div>
</template>

<style scoped>
.city-select-container {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.city-input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.city-input-field:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.city-input-field.error {
  border-color: #dc3545;
}

.input-arrow {
  position: absolute;
  right: 12px;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  transition: color 0.2s ease;
  user-select: none;
}

.input-arrow:hover {
  color: #007bff;
}

.error-message {
  color: #dc3545;
  font-size: 0.9em;
  margin-top: 4px;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 5px 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover,
.dropdown-item.selected {
  background-color: #f8f9fa;
}

.city-name {
  font-weight: 500;
  color: #333;
}

.city-population {
  font-size: 0.9em;
  color: #666;
}

.no-results {
  color: #666;
  font-style: italic;
  justify-content: center;
}
</style>
