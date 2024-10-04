import { defineStore } from 'pinia'
import axios from 'axios'

// Base URL de la API desde las variables de entorno
const BASE_URL = import.meta.env.VITE_API_ENDPOINT

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [],
    order: null,
    loading: false,
    error: null
  }),

  actions: {
    // Obtener el token JWT desde el localStorage o cualquier otro método
    getAuthToken() {
      return localStorage.getItem('token') // Asegúrate de que el token esté guardado en el localStorage
    },

    // Configuración de Axios con el Token de Autorización
    getAxiosConfig() {
      const token = this.getAuthToken()
      return {
        headers: {
          Authorization: `Bearer ${token}` // Incluir el token en el encabezado de autorización
        }
      }
    },

    async fetchAllOrders() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`${BASE_URL}/orders`, this.getAxiosConfig())
        this.orders = response.data
        this.error = null
      } catch (error) {
        console.error(error)
        if (error.response.status === 403) {
          this.error = 'No tienes permisos para ver las órdenes.'
        } else {
          this.error = 'Error al obtener las órdenes.'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchOrderById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`${BASE_URL}/orders/${id}`, this.getAxiosConfig())
        this.order = response.data
        this.error = null
      } catch (error) {
        console.error(error)
        if (error.response.status === 403) {
          this.error = 'No tienes permisos para ver esta orden.'
        } else {
          this.error = 'Error al obtener la orden.'
        }
      } finally {
        this.loading = false
      }
    },

    async createOrder(orderData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${BASE_URL}/orders`, orderData, this.getAxiosConfig())
        this.orders.push(response.data)
        this.error = null
      } catch (error) {
        console.error(error)
        this.error = 'Error al crear la orden.'
      } finally {
        this.loading = false
      }
    },

    async updateOrder(id, orderData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.put(
          `${BASE_URL}/orders/${id}`,
          orderData,
          this.getAxiosConfig()
        )
        const index = this.orders.findIndex((order) => order.id === id)
        if (index !== -1) {
          this.orders[index] = response.data
        }
        this.error = null
      } catch (error) {
        console.error(error)
        this.error = 'Error al actualizar la orden.'
      } finally {
        this.loading = false
      }
    },

    async deleteOrder(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`${BASE_URL}/orders/${id}`, this.getAxiosConfig())
        this.orders = this.orders.filter((order) => order.id !== id)
        this.error = null
      } catch (error) {
        console.error(error)
        this.error = 'Error al eliminar la orden.'
      } finally {
        this.loading = false
      }
    }
  }
})
