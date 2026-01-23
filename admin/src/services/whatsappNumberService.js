import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

const whatsappNumberService = {
  /**
   * Get all WhatsApp numbers
   */
  async getNumbers(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WHATSAPP_NUMBERS.LIST, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get WhatsApp number by ID
   */
  async getNumberById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WHATSAPP_NUMBERS.GET_BY_ID(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Create WhatsApp number
   */
  async createNumber(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WHATSAPP_NUMBERS.CREATE, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Update WhatsApp number
   */
  async updateNumber(id, data) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.WHATSAPP_NUMBERS.UPDATE(id), data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete WhatsApp number
   */
  async deleteNumber(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.WHATSAPP_NUMBERS.DELETE(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Test WhatsApp connection
   */
  async testConnection(id) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WHATSAPP_NUMBERS.TEST_CONNECTION(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get WhatsApp number status
   */
  async getStatus(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WHATSAPP_NUMBERS.STATUS(id))
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default whatsappNumberService

