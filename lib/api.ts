import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface UploadResponse {
  job_id: string
  status: 'waiting' | 'completed' | 'failed'
  message: string
  data?: ProcessedData
}

export interface ProcessedData {
  summary: {
    count: number
    invoiceAmount: number
    netAmount: number
  }
  charts: {
    transactionsByDate: Array<{
      date: string
      amount: number
      count: number
    }>
    transactionTypes: Array<{
      type: string
      amount: number
      count: number
    }>
  }
}

export const api = {
  async uploadFile(file: File, type: 'payment' | 'mtr'): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post<UploadResponse>(
        `${API_BASE_URL}/api/upload/${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.message
        throw new Error(message)
      }
      throw error
    }
  },

  async getJobStatus(jobId: string): Promise<UploadResponse> {
    try {
      const response = await axios.get<UploadResponse>(
        `${API_BASE_URL}/api/status/${jobId}`
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.message
        throw new Error(message)
      }
      throw error
    }
  },
}
