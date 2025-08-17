<template>
  <div class="add-city">
    <h3>Добавить новый город</h3>
    <form @submit.prevent="addNewCity" class="city-form">
      <div class="form-group">
        <label for="cityName">Название города:</label>
        <input 
          id="cityName"
          v-model="cityData.name" 
          type="text" 
          required 
          class="form-input"
          :class="{ 'error': nameError }"
          placeholder="Введите название города"
          @input="clearNameError"
        />
        <span v-if="nameError" class="error-message">{{ nameError }}</span>
      </div>
      
      <div class="form-group">
        <label for="cityPopulation">Численность населения:</label>
        <input 
          id="cityPopulation"
          v-model="cityData.population" 
          type="number" 
          required 
          class="form-input"
          min="0"
          placeholder="Введите численность населения"
        />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-success" :disabled="loading">
          {{ loading ? 'Добавление...' : 'Добавить город' }}
        </button>
        <button type="button" @click="resetForm" class="btn btn-secondary">
          Очистить
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createCity } from '../services/api';

const emit = defineEmits(['city-added', 'close']);

const cityData = ref({
  name: '',
  population: ''
});

const loading = ref(false);
const nameError = ref('');

const clearNameError = () => {
  if (nameError.value) {
    nameError.value = '';
  }
};

const resetForm = () => {
  cityData.value = {
    name: '',
    population: ''
  };
  nameError.value = '';
};

const addNewCity = async () => {
  try {
    loading.value = true;
    nameError.value = '';
    
    // Валидация
    if (!cityData.value.name.trim()) {
      nameError.value = 'Название города обязательно для заполнения';
      return;
    }
    
    if (!cityData.value.population || cityData.value.population < 0) {
      alert('Численность населения должна быть положительным числом');
      return;
    }
    
    const response = await createCity({
      name: cityData.value.name.trim(),
      population: parseInt(cityData.value.population)
    });
    
    // Успешно добавлен
    emit('city-added', response.data);
    resetForm();
    
  } catch (error) {
    // Обработка ошибки дублирования имени
    if (error.message.includes('уже существует')) {
      nameError.value = 'Город с таким названием уже существует';
    } else {
      alert(`Ошибка при добавлении города: ${error.message}`);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.add-city {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  margin-bottom: 20px;
}

.add-city h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #28a745;
  padding-bottom: 10px;
}

.city-form {
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
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

.form-input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.9em;
  margin-top: 2px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
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

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
