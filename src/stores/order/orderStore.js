import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_ENDPOINT + '/orders'

export const useOrderStore = defineStore('orderStore', () => {
  const orders = ref([])
  const order = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(0)
  const pageSize = ref(8)
  const totalPages = ref(0)
  const accessToken = computed(() => localStorage.getItem('access_token'))

  const getAuthHeaders = () => {
    if (!accessToken.value) {
      throw new Error('Unauthorized: No access token found')
    }
    return {
      Authorization: `Bearer ${accessToken.value}`
    }
  }

  const fetchOrders = async (url, params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get(url, { params })
      orders.value = response.data.content ? response.data.content : response.data
      currentPage.value = response.data.number || 0
      pageSize.value = response.data.size || 8
      totalPages.value = response.data.totalPages || 1
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllOrders = async (page = 0, size = 8, sortBy = 'createdAt', sortOrder = 'desc') => {
    const url = BASE_URL
    const params = { page, size, sort: `${sortBy},${sortOrder}` }
    await fetchOrders(url, params)
  }

  const fetchOrderById = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders()
      })
      order.value = response.data
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (orderData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post(BASE_URL, orderData, {
        headers: getAuthHeaders()
      })
      orders.value.push(response.data)
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  const updateOrder = async (id, orderData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, orderData, {
        headers: getAuthHeaders()
      })
      order.value = response.data
      const index = orders.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        orders.value[index] = response.data
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  const deleteOrder = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders()
      })
      orders.value = orders.value.filter((order) => order.id !== id)
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrdersByUser = async (userId) => {
    const url = `${BASE_URL}/user/${userId}`
    await fetchOrders(url)
  }

  const addOrderItemToOrder = async (orderId, orderItemData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post(`${BASE_URL}/${orderId}/items`, orderItemData, {
        headers: getAuthHeaders()
      })
      const index = orders.value.findIndex((order) => order.id === orderId)
      if (index !== -1) {
        orders.value[index].items.push(response.data)
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  const removeOrderItemFromOrder = async (orderId, orderItemId) => {
    isLoading.value = true
    error.value = null
    try {
      await axios.delete(`${BASE_URL}/${orderId}/items/${orderItemId}`, {
        headers: getAuthHeaders()
      })
      const index = orders.value.findIndex((order) => order.id === orderId)
      if (index !== -1) {
        orders.value[index].items = orders.value[index].items.filter(
          (item) => item.id !== orderItemId
        )
      }
    } catch (err) {
      handleError(err)
    } finally {
      isLoading.value = false
    }
  }

  const handleError = (err) => {
    error.value = err.response
      ? `Server Error: ${err.response.status} - ${err.response.data.message || err.response.statusText}`
      : err.request
        ? 'No response from server. Please check your network or server status.'
        : `Error: ${err.message}`
  }

  return {
    orders,
    order,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalPages,
    fetchAllOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    fetchOrdersByUser,
    addOrderItemToOrder,
    removeOrderItemFromOrder
  }
})
