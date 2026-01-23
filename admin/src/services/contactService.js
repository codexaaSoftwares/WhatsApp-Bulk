import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

const contactService = {
  /**
   * Get all contacts
   */
  async getContacts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTACTS.LIST, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get contact by ID
   */
  async getContactById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTACTS.GET_BY_ID(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Create contact
   */
  async createContact(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTACTS.CREATE, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Update contact
   */
  async updateContact(id, data) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CONTACTS.UPDATE(id), data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete contact
   */
  async deleteContact(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CONTACTS.DELETE(id))
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default contactService

