<template>
  <div class="hierarchy-info">
    <h3>Дерево иерархии</h3>
    <div class="hierarchy-status">
      <p>
        <strong>Активные уровни:</strong> 
        {{ activeLevelsText }}
      </p>
      <p>
        <strong>Всего уровней:</strong> {{ hierarchyConfig.length }}
      </p>
      <p>
        <strong>Всего жителей:</strong> {{ totalCitizens }}
      </p>
      
      <!-- Простой переключатель для показа всех жителей -->
      <div class="citizens-toggle">
        <label class="toggle-switch">
          <input
            type="checkbox"
            :checked="showAllCitizens"
            @change="$emit('toggle-citizens')"
          />
          <span class="slider"></span>
        </label>
        <span class="toggle-label">
          Показать всех жителей
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  hierarchyConfig: Array,
  totalCitizens: Number,
  showAllCitizens: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-citizens']);

const activeLevelsText = computed(() => {
  return props.hierarchyConfig
    .filter(level => level.enabled)
    .map(level => level.name)
    .join(' → ');
});
</script>

<style scoped>
.hierarchy-info {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.hierarchy-info h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
}

.hierarchy-status {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.hierarchy-status p {
  margin: 8px 0;
}

.citizens-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
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
  background-color: #007bff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>
