import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getHierarchy, updateHierarchy } from '../services/api'

export const useHierarchyStore = defineStore('hierarchy', () => {
  const hierarchyConfig = ref([
    { type: 'city', name: 'Город', enabled: true, required: true },
    { type: 'district', name: 'Район', enabled: true },
    { type: 'street', name: 'Улица', enabled: true },
  ])
  const loading = ref(false)
  const error = ref(null)

  // Загрузить иерархию из БД
  async function fetchHierarchy() {
    loading.value = true
    error.value = null
    try {
      const response = await getHierarchy()

      if (response.data && Array.isArray(response.data)) {
        hierarchyConfig.value = response.data
      } else if (response && Array.isArray(response)) {
        // Если response сам является массивом
        hierarchyConfig.value = [...response]
      } else if (
        response &&
        response.levels &&
        Array.isArray(response.levels)
      ) {
        // Если response имеет структуру { levels: [...] }
        hierarchyConfig.value = response.levels
      }
      // Если response не содержит валидных данных, оставляем дефолтную конфигурацию
    } catch (err) {
      error.value = err.message
      console.error('Ошибка загрузки иерархии:', err)
      // Оставляем дефолтную конфигурацию
    } finally {
      loading.value = false
    }
  }

  // Обновить иерархию
  async function updateHierarchyConfig(newConfig) {
    try {
      await updateHierarchy({ levels: newConfig })
      hierarchyConfig.value = newConfig
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Получить активные уровни
  const activeLevels = computed(() =>
    hierarchyConfig.value.filter((level) => level.enabled),
  )

  // Получить уровень по типу
  function getLevelByType(type) {
    return hierarchyConfig.value.find((level) => level.type === type)
  }

  return {
    hierarchyConfig,
    loading,
    error,
    activeLevels,
    fetchHierarchy,
    updateHierarchyConfig,
    getLevelByType,
  }
})
