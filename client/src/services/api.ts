import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Car, Employee, Client, Rental, ApiResponse, PaginationParams } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

// Check if error is retryable (transient network errors, 5xx errors, timeouts)
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors (no response received)
    return true;
  }
  
  const status = error.response.status;
  // Retry on server errors (5xx) and rate limiting (429)
  return status >= 500 || status === 429;
};

// Sleep utility for delays
const sleep = (ms: number): Promise<void> => 
  new Promise((resolve) => setTimeout(resolve, ms));

// Retry mechanism with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retryCount = 0
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Don't retry if max retries reached or error is not retryable
    if (retryCount >= RETRY_CONFIG.maxRetries || !isRetryableError(axiosError)) {
      throw error;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
      RETRY_CONFIG.maxDelay
    );

    console.log(`Retry attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms`);
    
    await sleep(delay);
    return retryWithBackoff(fn, retryCount + 1);
  }
};

// Error handler
const handleError = (error: AxiosError): never => {
  if (error.response?.data) {
    const errorData = error.response.data as { error?: string; message?: string };
    throw new Error(errorData.error || errorData.message || 'An error occurred');
  }
  throw new Error(error.message || 'Network error');
};

// Car API
export const carApi = {
  getAll: async (params?: Partial<PaginationParams>): Promise<Car[]> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Car[]>>('/cars', { params });
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  getById: async (id: string): Promise<Car> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Car>>(`/cars/${id}`);
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  create: async (data: Partial<Car>): Promise<Car> => {
    try {
      const response = await api.post<ApiResponse<Car>>('/cars', data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  update: async (id: string, data: Partial<Car>): Promise<Car> => {
    try {
      const response = await api.put<ApiResponse<Car>>(`/cars/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/cars/${id}`);
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },
};

// Employee API
export const employeeApi = {
  getAll: async (params?: Partial<PaginationParams>): Promise<Employee[]> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Employee[]>>('/employees', { params });
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  getById: async (id: string): Promise<Employee> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  create: async (data: Partial<Employee>): Promise<Employee> => {
    try {
      const response = await api.post<ApiResponse<Employee>>('/employees', data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    try {
      const response = await api.put<ApiResponse<Employee>>(`/employees/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/employees/${id}`);
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },
};

// Client API
export const clientApi = {
  getAll: async (params?: Partial<PaginationParams>): Promise<Client[]> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Client[]>>('/clients', { params });
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  getById: async (id: string): Promise<Client> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  create: async (data: Partial<Client>): Promise<Client> => {
    try {
      const response = await api.post<ApiResponse<Client>>('/clients', data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    try {
      const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },
};

// Rental API
export const rentalApi = {
  getAll: async (params?: Partial<PaginationParams>): Promise<Rental[]> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Rental[]>>('/rentals', { params });
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  getById: async (id: string): Promise<Rental> => {
    try {
      return await retryWithBackoff(async () => {
        const response = await api.get<ApiResponse<Rental>>(`/rentals/${id}`);
        return response.data.data;
      });
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  create: async (data: Partial<Rental>): Promise<Rental> => {
    try {
      const response = await api.post<ApiResponse<Rental>>('/rentals', data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  update: async (id: string, data: Partial<Rental>): Promise<Rental> => {
    try {
      const response = await api.put<ApiResponse<Rental>>(`/rentals/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/rentals/${id}`);
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },
};

export default api;

