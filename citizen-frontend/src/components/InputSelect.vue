<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Введите или выберите значение'
  }
});

const emit = defineEmits(['update:modelValue', 'new-value']);

const inputValue = ref(props.modelValue);
const showDropdown = ref(false);
const selectedIndex = ref(0);

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue;
});

const filteredOptions = computed(() => {
  if (!inputValue.value) return props.options;
  return props.options.filter(option => 
    option.toLowerCase().includes(inputValue.value.toLowerCase())
  );
});

function handleInput() {
  emit('update:modelValue', inputValue.value);
  showDropdown.value = true;
  selectedIndex.value = 0;
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

function handleKeydown(event) {
  if (!showDropdown.value) return;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredOptions.value.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      break;
    case 'Enter':
      event.preventDefault();
      if (filteredOptions.value[selectedIndex.value]) {
        selectOption(filteredOptions.value[selectedIndex.value]);
      } else if (inputValue.value) {
        createNewValue();
      }
      break;
    case 'Escape':
      showDropdown.value = false;
      break;
  }
}

function selectOption(option) {
  inputValue.value = option;
  emit('update:modelValue', option);
  showDropdown.value = false;
}

function createNewValue() {
  emit('new-value', inputValue.value);
  showDropdown.value = false;
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}
</script>

<template>
  <div class="input-select-container">
    <div class="input-wrapper">
      <input
        v-model="inputValue"
        :placeholder="placeholder"
        class="input-select-field"
        @input="handleInput"
        @focus="showDropdown = true"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <div class="input-arrow" @click="toggleDropdown">▼</div>
    </div>
    
    <div v-if="showDropdown && filteredOptions.length > 0" class="dropdown">
      <div
        v-for="(option, index) in filteredOptions"
        :key="option"
        :class="['dropdown-item', { 'selected': index === selectedIndex }]"
        @click="selectOption(option)"
        @mouseenter="selectedIndex = index"
      >
        {{ option }}
      </div>
      
      <div
        v-if="inputValue && !filteredOptions.includes(inputValue)"
        class="dropdown-item new-value"
        @click="createNewValue"
      >
        Создать "{{ inputValue }}"
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-select-container {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-select-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.input-select-field:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover,
.dropdown-item.selected {
  background-color: #f8f9fa;
}

.dropdown-item.new-value {
  background-color: #e8f5e8;
  color: #28a745;
  font-weight: 500;
  border-top: 2px solid #28a745;
}

.dropdown-item.new-value:hover {
  background-color: #d4edda;
}


</style>

