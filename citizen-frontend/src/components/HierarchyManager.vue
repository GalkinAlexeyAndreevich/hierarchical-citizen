<script setup>
import { ref, watch, computed } from "vue";
import { Trash2, Plus, Save, RotateCcw, ChevronUp, ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  hierarchyConfig: {
    type: Array,
    required: true,
  }
});

const emit = defineEmits(["update:hierarchyConfig"]);



const localHierarchyConfig = ref([...props.hierarchyConfig]);

// Убрали локальное состояние, теперь используем пропс

// Синхронизируем локальное состояние с пропсами
watch(() => props.hierarchyConfig, (newConfig) => {
  if (newConfig) {
    localHierarchyConfig.value = [...newConfig];
  }
}, { deep: true });

// Проверяем, есть ли изменения
const hasChanges = computed(() => {
  if (!props.hierarchyConfig || !localHierarchyConfig.value) return false;
  
  const original = JSON.stringify(props.hierarchyConfig);
  const current = JSON.stringify(localHierarchyConfig.value);
  
  const changed = original !== current;
  return changed;
});

// Функция для обновления иерархии
function updateHierarchy(newConfig) {
  localHierarchyConfig.value = [...newConfig];
}

// Функция для сохранения изменений
function saveChanges() {
  // Валидация перед сохранением
  if (!validateTypeUniqueness()) {
    alert('Ошибка: Типы уровней должны быть уникальными!');
    return;
  }

  // Проверяем, что все поля type и name заполнены
  const incompleteLevel = localHierarchyConfig.value.find(level => !level.type.trim() || !level.name.trim());
  if (incompleteLevel) {
    alert('Ошибка: Поля "Тип уровня" и "Название уровня" должны быть заполнены для всех уровней!');
    return;
  }

  // Отправляем изменения на сервер
  emit("update:hierarchyConfig", [...localHierarchyConfig.value]);
}

// Сбросить изменения
function resetChanges() {
  if (confirm('Вы уверены, что хотите сбросить все изменения?')) {
    localHierarchyConfig.value = [...props.hierarchyConfig];
  }
}

// Добавить уровень
function addLevel() {
  const newLevel = {
    type: "",
    name: "",
    enabled: true,
    required: false,
  };
  updateHierarchy([...localHierarchyConfig.value, newLevel]);
}

// Удалить уровень
function removeLevel(index) {
  const level = localHierarchyConfig.value[index];
  if (level.required) return;

  const newConfig = [...localHierarchyConfig.value];
  newConfig.splice(index, 1);
  updateHierarchy(newConfig);
}

// Переключить видимость уровня
function toggleLevelVisibility(index) {
  const newConfig = [...localHierarchyConfig.value];
  newConfig[index].enabled = !newConfig[index].enabled;
  updateHierarchy(newConfig);
}

// Обновить поле уровня
function updateLevelField(index, field, value) {
  const newConfig = [...localHierarchyConfig.value];
  newConfig[index][field] = value;
  updateHierarchy(newConfig);
}

// Валидация уникальности type
function validateTypeUniqueness() {
  const types = localHierarchyConfig.value.map(level => level.type).filter(type => type.trim());
  const uniqueTypes = new Set(types);
  return types.length === uniqueTypes.size;
}

// Переместить уровень вверх
function moveLevelUp(index) {
  if (index === 0) return; // Нельзя поднять первый элемент
  
  const newConfig = [...localHierarchyConfig.value];
  const currentElement = newConfig[index];
  const previousElement = newConfig[index - 1];
  
  // Меняем местами текущий и предыдущий элементы
  newConfig[index] = previousElement;
  newConfig[index - 1] = currentElement;
  
  updateHierarchy(newConfig);
}

// Переместить уровень вниз
function moveLevelDown(index) {
  if (index === localHierarchyConfig.value.length - 1) return; // Нельзя опустить последний элемент
  
  const newConfig = [...localHierarchyConfig.value];
  const currentElement = newConfig[index];
  const nextElement = newConfig[index + 1];
  
  // Меняем местами текущий и следующий элементы
  newConfig[index] = nextElement;
  newConfig[index + 1] = currentElement;
  
  updateHierarchy(newConfig);
}

// Убрали ненужные функции, теперь используем состояние из родительского компонента

// Функция для проверки, подходит ли житель по иерархии
function checkCitizenHierarchyMatch(citizen) {
  if (!citizen.groups || !Array.isArray(citizen.groups)) {
    return false;
  }
  
  // Получаем активные уровни иерархии
  const activeLevels = localHierarchyConfig.value.filter(level => level.enabled);
  
  // Проверяем, есть ли у жителя все необходимые уровни
  for (const level of activeLevels) {
    if (level.required && !citizen.groups.includes(level.name)) {
      return false; // Отсутствует обязательный уровень
    }
  }
  
  return true; // Житель подходит по иерархии
}

// Функция для фильтрации жителей по иерархии
function filterCitizensByHierarchy(citizens) {
  if (!Array.isArray(citizens)) return { matching: [], nonMatching: [] };
  
  const matching = [];
  const nonMatching = [];
  
  for (const citizen of citizens) {
    if (checkCitizenHierarchyMatch(citizen)) {
      matching.push(citizen);
    } else {
      nonMatching.push(citizen);
    }
  }
  
  return { matching, nonMatching };
}
</script>

<template>
  <div class="hierarchy-manager">
    <div class="header-row">
      <h3>Иерархия</h3>
    </div>
    
    <div class="levels-container">
      <div 
        v-for="(element, index) in localHierarchyConfig" 
        :key="index"
        class="level-item"
      >
        <div class="move-buttons">
          <button 
            @click="moveLevelUp(index)" 
            :disabled="index === 0"
            class="btn-move"
            title="Поднять уровень"
          >
            <ChevronUp class="icon" />
          </button>
          <button 
            @click="moveLevelDown(index)" 
            :disabled="index === localHierarchyConfig.length - 1"
            class="btn-move"
            title="Опустить уровень"
          >
            <ChevronDown class="icon" />
          </button>
        </div>
        
        <input
          :value="element.type"
          @input="updateLevelField(index, 'type', $event.target.value)"
          placeholder="Тип уровня"
          class="level-input type-input"
        />
        <input
          :value="element.name"
          @input="updateLevelField(index, 'name', $event.target.value)"
          placeholder="Название уровня"
          class="level-input"
        />
        
        <div class="level-toggle">
          <span class="toggle-label">{{ element.enabled ? "Вкл" : "Выкл" }}</span>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="element.enabled"
              @change="toggleLevelVisibility(index)"
            />
            <span class="slider"></span>
          </label>
        </div>
        
        <button
          v-if="!element.required"
          @click="removeLevel(index)"
          class="btn-remove"
          title="Удалить уровень"
        >
          <Trash2 class="icon" />
        </button>
      </div>
    </div>

    <div class="buttons-container">
      <button @click="addLevel" class="btn-add">
        <Plus class="icon" />
        Добавить уровень
      </button>
      
      <button @click="saveChanges" class="btn-save" :disabled="!hasChanges">
        <Save class="icon" />
        Сохранить изменения
      </button>
      
      <button @click="resetChanges" class="btn-reset" :disabled="!hasChanges">
        <RotateCcw class="icon" />
        Сбросить
      </button>
    </div>
  </div>
</template>

<style scoped>
.hierarchy-manager {
  padding: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.hierarchy-manager h3 {
  margin: 0;
  color: #333;
}

/* Убрали ненужные стили для старой ссылки */

.levels-container {
  margin-bottom: 20px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 5px;
}

.move-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-move {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-move:hover:not(:disabled) {
  background: #e9ecef;
  color: #007bff;
}

.btn-move:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.btn-move .icon {
  width: 16px;
  height: 16px;
}

.level-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.type-input {
  min-width: 120px;
  max-width: 150px;
}

.level-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toggle-label {
  font-size: 12px;
  color: #666;
  min-width: 30px;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 20px;
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
  transition: 0.3s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.btn-remove {
  background: none;
  color: #dc3545;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.btn-remove:hover {
  color: #c82333;
}

.buttons-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-add {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-save:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-reset:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-reset:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.icon {
  width: 18px;
  height: 18px;
}

.btn-remove .icon {
  width: 20px;
  height: 20px;
}


</style>
