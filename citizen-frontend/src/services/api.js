// API сервис для взаимодействия с бэкендом
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Общий метод для HTTP запросов
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Invalid JSON response from server');
    }
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Не удается подключиться к серверу. Проверьте, запущен ли бэкенд.');
    }
    throw error;
  }
}

// Граждане
export async function getCitizens(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return request(`/api/citizens${queryString ? `?${queryString}` : ''}`);
}

export async function getCitizen(id) {
  return request(`/api/citizens/${id}`);
}

export async function createCitizen(citizenData) {
  return request('/api/citizens', {
    method: 'POST',
    body: JSON.stringify(citizenData),
  });
}

export async function updateCitizen(id, citizenData) {
  return request(`/api/citizens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(citizenData),
  });
}

export async function getHierarchyValues(type) {
  return request(`/api/citizens/hierarchy/values/${type}`);
}

export async function deleteCitizen(id) {
  return request(`/api/citizens/${id}`, {
    method: 'DELETE',
  });
}

export async function getCitizensHierarchy() {
  return request('/api/citizens/hierarchy/tree');
}

// Города
export async function getCities(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return request(`/api/cities${queryString ? `?${queryString}` : ''}`);
}

export async function getCity(id) {
  return request(`/api/cities/${id}`);
}

export async function createCity(cityData) {
  return request('/api/cities', {
    method: 'POST',
    body: JSON.stringify(cityData),
  });
}

export async function updateCity(id, cityData) {
  return request(`/api/cities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cityData),
  });
}

export async function deleteCity(id) {
  return request(`/api/cities/${id}`, {
    method: 'DELETE',
  });
}

// Иерархия
export async function getHierarchy() {
  return request('/api/hierarchy');
}

export async function updateHierarchy(config) {
  return request('/api/hierarchy', {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
}
