import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCities, createCity } from '../services/api'

export const useCitiesStore = defineStore('cities', () => {
  const cities = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Загрузить все города
  async function fetchCities() {
    loading.value = true
    error.value = null
    try {
      const response = await getCities()
      
      if (response.data && Array.isArray(response.data)) {
        cities.value = response.data
      } else if (response && Array.isArray(response)) {
        // Если response сам является массивом
        cities.value = [...response]
      } else {
        cities.value = []
      }
    } catch (err) {
      error.value = err.message
      console.error('Ошибка загрузки городов:', err)
      cities.value = []
    } finally {
      loading.value = false
    }
  }

  // Добавить новый город
  async function addCity(cityData) {
    try {
      const response = await createCity(cityData)
      cities.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Получить город по ID
  function getCityById(id) {
    return cities.value.find(city => city._id === id)
  }

  return {
    cities,
    loading,
    error,
    fetchCities,
    addCity,
    getCityById
  }
})
