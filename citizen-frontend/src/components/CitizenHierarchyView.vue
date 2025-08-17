<template>
  <div class="citizens-view">
    <h4>Все жители</h4>
    
    <div class="citizens-list">
      <div 
        v-for="citizen in citizens" 
        :key="citizen._id"
        class="citizen-item"
      >
        <div class="citizen-name">{{ citizen.name }}</div>
        <div class="citizen-hierarchy">
          <span 
            v-for="(group, index) in citizen.groups" 
            :key="index"
            class="hierarchy-level"
          >
            {{ group.name }}
            <span v-if="index < citizen.groups.length - 1" class="arrow">→</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  citizens: {
    type: Array,
    default: () => []
  },
  hierarchyConfig: {
    type: Array,
    required: true
  }
});
</script>

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
</style>
