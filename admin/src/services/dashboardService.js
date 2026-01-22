import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'
import { API_ENDPOINTS } from '../constants/api'

const dashboardService = {
  /**
   * Get dashboard summary statistics
   * @returns {Promise<{success: boolean, data?: object}>}
   */
  async getSummary() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.BASE + '/summary')
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Failed to fetch dashboard data',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default dashboardService
