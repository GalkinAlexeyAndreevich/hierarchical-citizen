<template>
  <div class="hierarchy-tree">
    <div v-if="!data || Object.keys(data).length === 0" class="empty-state">
      <p>Нет данных для отображения</p>
    </div>
    
    <div v-else class="tree-container">
      <TreeNode 
        v-for="(node, key) in data" 
        :key="key"
        :node="node"
        :nodeKey="key"
        :level="0"
        :config="config"
        @node-click="$emit('node-click', $event)"
      />
    </div>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue';
  import TreeNode from './TreeNode.vue';

  const props = defineProps({
    data: {
      type: Object,
      required: true
    },
    config: {
      type: Array,
      required: true
    }
  });

  defineEmits(['node-click']);
</script>

<style scoped>
  .hierarchy-tree {
    width: 100%;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #666;
    font-style: italic;
  }

  .tree-container {
    padding: 10px 0;
  }
</style>
