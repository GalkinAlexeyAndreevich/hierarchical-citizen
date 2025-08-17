<script setup>
  import { storeToRefs } from 'pinia'
  import { useUIStore } from '../../stores/ui'
  import { useCitizensStore } from '../../stores/citizens'
  import { useCitiesStore } from '../../stores/cities'
  import { useHierarchyStore } from '../../stores/hierarchy'

  const uiStore = useUIStore()
  const { showHierarchyConfig, showAddCitizen, showAddCity } =
    storeToRefs(uiStore)

  const { toggleHierarchyConfig, toggleAddCitizen, toggleAddCity } = uiStore

  const citizensStore = useCitizensStore()
  const citiesStore = useCitiesStore()
  const hierarchyStore = useHierarchyStore()

  // Функция обновления данных
  async function refreshData() {
    try {
      await Promise.all([
        citiesStore.fetchCities(),
        citizensStore.fetchCitizens(),
        hierarchyStore.fetchHierarchy(),
      ])
      console.log('Данные успешно обновлены')
    } catch (err) {
      console.error('Ошибка обновления данных:', err)
    }
  }
</script>

<template>
  <header class="header">
    <h1>Иерархия жителей</h1>
    <div class="controls">
      <button @click="toggleHierarchyConfig" class="btn btn-primary">
        {{ showHierarchyConfig ? 'Скрыть' : 'Показать' }} настройки иерархии
      </button>
      <button @click="toggleAddCitizen" class="btn btn-success">
        {{ showAddCitizen ? 'Скрыть' : 'Добавить' }} жителя
      </button>
      <button @click="toggleAddCity" class="btn btn-warning">
        {{ showAddCity ? 'Скрыть' : 'Добавить' }} город
      </button>
      <button @click="refreshData" class="btn btn-info">Обновить данные</button>
    </div>
  </header>
</template>

<style scoped>
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .header h1 {
    margin: 0 0 15px 0;
    font-size: 2.5em;
    text-align: center;
  }

  .controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
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

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-success {
    background: #28a745;
    color: white;
  }

  .btn-warning {
    background: #ffc107;
    color: #212529;
  }

  .btn-info {
    background: #17a2b8;
    color: white;
  }

  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
