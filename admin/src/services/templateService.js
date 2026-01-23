import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

const templateService = {
  /**
   * Get all templates
   */
  async getTemplates(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TEMPLATES.LIST, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TEMPLATES.GET_BY_ID(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Create template
   */
  async createTemplate(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEMPLATES.CREATE, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Update template
   */
  async updateTemplate(id, data) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.TEMPLATES.UPDATE(id), data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.TEMPLATES.DELETE(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Preview template
   */
  async previewTemplate(id, variables = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TEMPLATES.PREVIEW(id), {
        params: { variables }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Approve template
   */
  async approveTemplate(id) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEMPLATES.APPROVE(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Reject template
   */
  async rejectTemplate(id, reason = null) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEMPLATES.REJECT(id), { reason })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Submit template for approval
   */
  async submitForApproval(id) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEMPLATES.SUBMIT_FOR_APPROVAL(id))
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default templateService

