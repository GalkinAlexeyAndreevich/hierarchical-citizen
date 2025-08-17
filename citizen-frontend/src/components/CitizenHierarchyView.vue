<script setup>
import { ref } from 'vue';

const props = defineProps({
  citizens: {
    type: Array,
    default: () => []
  },
  hierarchyConfig: {
    type: Array,
    required: true
  },
  cities: {
    type: Array,
    default: () => []
  }
});

// Состояние для tooltip
const activeTooltip = ref(null);
const tooltipStyle = ref({});

// Функция для получения отображаемого названия уровня
function getLevelDisplayName(levelType) {
  const level = props.hierarchyConfig.find(l => l.type === levelType);
  return level ? level.name : levelType;
}

// Функция для получения информации о городе жителя
function getCitizenCityInfo(citizen) {
  // Проверяем, есть ли уже загруженные данные города
  if (citizen.city && citizen.city.name) {
    return {
      name: citizen.city.name,
      population: citizen.city.population
    };
  }
  
  // Fallback на поиск по cities массиву
  if (citizen.city_id) {
    const city = props.cities.find(c => c._id === citizen.city_id);
    if (city) {
      return {
        name: city.name,
        population: city.population
      };
    }
  }
  
  return null;
}

// Функция для показа tooltip
function showTooltip(citizen, event) {
  activeTooltip.value = citizen._id;
  
  const rect = event.target.getBoundingClientRect();
  tooltipStyle.value = {
    left: rect.left + 'px',
    top: (rect.top - 60) + 'px'
  };
}

// Функция для скрытия tooltip
function hideTooltip() {
  activeTooltip.value = null;
}
</script>

<template>
  <div class="citizens-view">
    <h4>Все жители ({{ citizens.length }})</h4>
    
    <div class="citizens-list">
      <div 
        v-for="citizen in citizens" 
        :key="citizen._id"
        class="citizen-item"
      >
        <div 
          class="citizen-name"
          @mouseenter="showTooltip(citizen, $event)"
          @mouseleave="hideTooltip"
        >
          {{ citizen.name }}
          
          <div 
            v-if="activeTooltip === citizen._id"
            class="tooltip"
            :style="tooltipStyle"
          >
            <div class="tooltip-content">
              {{ getCitizenCityInfo(citizen) ? `${getCitizenCityInfo(citizen).name}, ${getCitizenCityInfo(citizen).population} жителей` : 'Город не указан' }}
            </div>
          </div>
        </div>
        
        <div class="citizen-hierarchy">
          <span 
            v-for="(group, index) in citizen.groups" 
            :key="index"
            class="hierarchy-level"
          >
            <span class="level-type">{{ getLevelDisplayName(group.type) }}</span>
            {{ group.name }}
            <span v-if="index < citizen.groups.length - 1" class="arrow">→</span>
          </span>
        </div>
        
        <div class="citizen-debug" v-if="citizen.groups.length === 0">
          <span class="no-groups">Нет групп иерархии</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.citizens-view {
  padding: 20px;
}

.citizens-view h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.citizens-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.citizen-item {
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
}

.citizen-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 16px;
  position: relative;
}

.citizen-hierarchy {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hierarchy-level {
  color: #666;
  font-size: 14px;
}

.arrow {
  color: #007bff;
  font-weight: bold;
  margin: 0 4px;
}

.level-type {
  color: #007bff;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
  background: rgba(0, 123, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.citizen-debug {
  margin-top: 8px;
  font-size: 12px;
}

.no-groups {
  color: #dc3545;
  font-style: italic;
}

.tooltip {
  position: fixed;
  z-index: 1000;
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 250px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.tooltip-content {
  line-height: 1.4;
}
</style>
