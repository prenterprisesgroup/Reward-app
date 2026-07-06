import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Enterprise Query Retry Strategy
const enterpriseRetryStrategy = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    
    // Auth/Validation errors should NEVER retry
    if (status === 401 || status === 403 || status === 400 || status === 422) {
      return false;
    }
  }
  
  // Network failures or 500/503 server errors retry ONCE
  return failureCount < 1; 
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: enterpriseRetryStrategy,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      staleTime: 2 * 60 * 1000, // 2 minutes by default
      gcTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: false, // Generally don't retry mutations automatically unless specified
    }
  },
});
