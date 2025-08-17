import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const showHierarchyConfig = ref(false)
  const showAddCitizen = ref(false)
  const showAddCity = ref(false)
  const showAllCitizens = ref(false)

  // Функция для сброса всех состояний
  function resetAllStates() {
    showHierarchyConfig.value = false
    showAddCitizen.value = false
    showAddCity.value = false
    showAllCitizens.value = false
  }

  function toggleHierarchyConfig() {
    showHierarchyConfig.value = !showHierarchyConfig.value
  }

  function toggleAddCitizen() {
    showAddCitizen.value = !showAddCitizen.value
  }

  function toggleAddCity() {
    showAddCity.value = !showAddCity.value
  }

  function toggleAllCitizens() {
    showAllCitizens.value = !showAllCitizens.value
  }

  function closeAllModals() {
    showHierarchyConfig.value = false
    showAddCitizen.value = false
    showAddCity.value = false
  }

  return {
    // Состояния
    showHierarchyConfig,
    showAddCitizen,
    showAddCity,
    showAllCitizens,

    // Методы
    toggleHierarchyConfig,
    toggleAddCitizen,
    toggleAddCity,
    toggleAllCitizens,
    closeAllModals,
    resetAllStates,
  }
})
