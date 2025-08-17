import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCitizens, createCitizen } from '../services/api'
import { useCitiesStore } from './cities'
import { useHierarchyStore } from './hierarchy'

export const useCitizensStore = defineStore('citizens', () => {
  const citizens = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Загрузить всех жителей
  async function fetchCitizens() {
    loading.value = true
    error.value = null
    try {
      const response = await getCitizens()
      citizens.value = [...response.data]
    } catch (err) {
      error.value = err.message
      console.error('Ошибка загрузки жителей:', err)
      citizens.value = []
    } finally {
      loading.value = false
    }
  }

  // Добавить нового жителя
  async function addCitizen(citizenData) {
    try {
      // Подготавливаем данные жителя
      const preparedData = await prepareCitizenData(citizenData)

      const response = await createCitizen(preparedData)
      citizens.value.push(response.data)

      // Автоматически обновляем иерархические данные
      // computed свойство hierarchicalData автоматически пересчитается

      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Подготовка данных жителя с учетом иерархии
  async function prepareCitizenData(citizenData) {
    const citiesStore = useCitiesStore()
    const hierarchyStore = useHierarchyStore()

    citizenData.groups = []

    // Получаем активные уровни иерархии
    const activeLevels = hierarchyStore.activeLevels

    if (!activeLevels || activeLevels.length === 0) {
      throw new Error(
        'Нет активных уровней иерархии. Сначала настройте иерархию.',
      )
    }

    // Проверяем, что все активные уровни заполнены
    const missingLevels = []

    activeLevels.forEach((level) => {
      if (level.type === 'city') {
        if (!citizenData.city_id) {
          missingLevels.push(level.name)
        } else {
          // Для города находим название по ID
          const city = citiesStore.getCityById(citizenData.city_id)
          if (city) {
            citizenData.groups.push({
              type: 'city',
              name: city.name,
            })
          } else {
            missingLevels.push(`Город с ID ${citizenData.city_id} не найден`)
          }
        }
      } else if (citizenData[level.type]) {
        // Для остальных уровней
        citizenData.groups.push({
          type: level.type,
          name: citizenData[level.type],
        })
      } else {
        missingLevels.push(level.name)
      }
    })

    // Убеждаемся, что поле city заполнено
    if (citizenData.city_id) {
      citizenData.city = citizenData.city_id
    }

    // Если есть незаполненные уровни, показываем ошибку
    if (missingLevels.length > 0) {
      throw new Error(
        `Необходимо заполнить все уровни иерархии: ${missingLevels.join(', ')}`,
      )
    }

    return citizenData
  }

  // Получить жителя по ID
  function getCitizenById(id) {
    return citizens.value.find((citizen) => citizen._id === id)
  }

  // Получить жителей по городу
  function getCitizensByCity(cityId) {
    return citizens.value.filter((citizen) => citizen.city_id === cityId)
  }

  // Получить жителей по уровню иерархии
  function getCitizensByHierarchyLevel(levelType, levelValue) {
    return citizens.value.filter((citizen) => {
      if (!citizen.groups || !Array.isArray(citizen.groups)) {
        return false
      }
      return citizen.groups.some(
        (group) => group.type === levelType && group.name === levelValue,
      )
    })
  }

  // Количество жителей
  const totalCitizens = computed(() => {
    return citizens.value.length
  })

  // Построение иерархического дерева
  const hierarchicalData = computed(() => {
    const citiesStore = useCitiesStore()
    const hierarchyStore = useHierarchyStore()

    const cities = citiesStore.cities
    const config = hierarchyStore.hierarchyConfig

    // Проверяем, что все необходимые данные доступны
    if (
      !citizens.value ||
      !Array.isArray(citizens.value) ||
      citizens.value.length === 0
    ) {
      return {}
    }

    if (!config || !Array.isArray(config) || config.length === 0) {
      return {}
    }

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return {}
    }

    const hierarchy = {}

    const enabledLevels = config.filter((level) => level.enabled)

    if (enabledLevels.length === 0) {
      return {}
    }

    citizens.value.forEach((citizen) => {
      // Проверяем, что у жителя есть поле groups
      if (!citizen.groups || !Array.isArray(citizen.groups)) {
        return
      }

      // Проверяем, есть ли у жителя ВСЕ активные уровни
      const hasAllLevels = enabledLevels.every((level) => {
        const hasLevel = citizen.groups.some((g) => g.type === level.type)
        return hasLevel
      })

      // Если у жителя нет всех уровней, пропускаем его
      if (!hasAllLevels) {
        return
      }

      let currentLevel = hierarchy
      let parentPath = ''

      enabledLevels.forEach((level, index) => {
        const levelType = level.type
        const group = citizen.groups.find((g) => g.type === levelType)

        if (!group) return

        const levelValue = group.name

        if (!currentLevel[levelValue]) {
          currentLevel[levelValue] = {
            type: level.name,
            typeKey: levelType,
            children: {},
            citizens: [],
            parentPath: parentPath,
          }
        }

        if (index === enabledLevels.length - 1) {
          const city = cities.find((c) => c._id === citizen.city_id)
          currentLevel[levelValue].citizens.push({
            id: citizen._id,
            name: citizen.name,
            city: city,
          })
        } else {
          currentLevel = currentLevel[levelValue].children
          parentPath = parentPath ? parentPath + ' → ' + levelValue : levelValue
        }
      })
    })

    return hierarchy
  })

  return {
    citizens,
    loading,
    error,
    totalCitizens,
    hierarchicalData,
    fetchCitizens,
    addCitizen,
    getCitizenById,
    getCitizensByCity,
    getCitizensByHierarchyLevel,
  }
})
