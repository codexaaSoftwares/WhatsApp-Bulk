import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

const businessProfileService = {
  /**
   * Get business profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BUSINESS_PROFILE.GET)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Update business profile
   */
  async updateProfile(data) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.BUSINESS_PROFILE.UPDATE, data)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default businessProfileService

