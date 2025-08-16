<template>
  <div class="tree-node" :style="{ marginLeft: level * 20 + 'px' }">
    <div class="node-content" @click="toggleNode">
      <div class="node-header">
        <span 
          v-if="hasChildren" 
          class="expand-icon"
          :class="{ expanded: isExpanded }"
        >
          ▼
        </span>
        <span v-else class="expand-icon-placeholder"></span>
        
        <span class="node-type">{{ node.type }}</span>
        <span class="node-name">{{ nodeKey }}</span>
        
        <span v-if="node.citizens && node.citizens.length > 0" class="citizens-count">
          ({{ node.citizens.length }} жителей)
        </span>
      </div>
    </div>
    
    <div v-if="node.citizens && node.citizens.length > 0 && isExpanded" class="citizens-list">
      <div 
        v-for="citizen in node.citizens" 
        :key="citizen.name"
        class="citizen-item"
        @mouseenter="showTooltip(citizen)"
        @mouseleave="hideTooltip"
      >
        <span class="citizen-name">{{ citizen.name }}</span>
        
        <div 
          v-if="activeTooltip === citizen.name"
          class="tooltip"
          :style="tooltipStyle"
        >
          <div class="tooltip-content">
            <strong>{{ getFullPath(nodeKey) }}</strong><br>
            {{ citizen.data }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="hasChildren && isExpanded" class="children">
      <TreeNode 
        v-for="(childNode, childKey) in node.children" 
        :key="childKey"
        :node="childNode"
        :nodeKey="childKey"
        :level="level + 1"
        :config="config"
        @node-click="$emit('node-click', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  nodeKey: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  config: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['node-click']);

const isExpanded = ref(true);
const activeTooltip = ref(null);
const tooltipStyle = ref({});

const hasChildren = computed(() => {
  return props.node?.children && Object.keys(props.node.children).length > 0;
});

function toggleNode() {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value;
  }
  emit('node-click', { node: props.node, key: props.nodeKey, level: props.level });
}

function showTooltip(citizen) {
  activeTooltip.value = citizen.name;
  
  const rect = event.target.getBoundingClientRect();
  tooltipStyle.value = {
    left: rect.left + 'px',
    top: (rect.top - 60) + 'px'
  };
}

function hideTooltip() {
  activeTooltip.value = null;
}

function getFullPath(currentKey) {
  let path = currentKey;
  let parent = props.node;
  
  while (parent && parent.parentPath) {
    path = parent.parentPath + ' → ' + path;
    parent = parent.parent;
  }
  
  return path;
}
</script>

<style scoped>
.tree-node {
  margin-bottom: 5px;
}

.node-content {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.node-content:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  font-size: 12px;
  color: #666;
  transition: transform 0.2s ease;
  width: 16px;
  text-align: center;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-icon-placeholder {
  width: 16px;
}

.node-type {
  font-size: 12px;
  color: #666;
  background: #007bff;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 500;
}

.node-name {
  font-weight: 600;
  color: #333;
}

.citizens-count {
  font-size: 12px;
  color: #666;
  background: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
}

.citizens-list {
  margin-top: 5px;
  margin-left: 20px;
}

.citizen-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin-bottom: 3px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.citizen-item:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.citizen-icon {
  font-size: 16px;
}

.citizen-name {
  font-weight: 500;
  color: #333;
}

.children {
  margin-top: 5px;
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

.tooltip-content strong {
  color: #fff;
}

@media (max-width: 768px) {
  .node-header {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .citizen-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
