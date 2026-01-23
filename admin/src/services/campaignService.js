import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

const campaignService = {
  /**
   * Get all campaigns
   */
  async getCampaigns(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CAMPAIGNS.LIST, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get campaign by ID
   */
  async getCampaignById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CAMPAIGNS.GET_BY_ID(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Create campaign
   */
  async createCampaign(data) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CAMPAIGNS.CREATE, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get campaign statistics
   */
  async getCampaignStats(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CAMPAIGNS.STATS(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Start campaign
   */
  async startCampaign(id) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CAMPAIGNS.START(id))
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Retry failed messages in campaign
   */
  async retryFailed(id) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CAMPAIGNS.RETRY_FAILED(id))
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default campaignService

