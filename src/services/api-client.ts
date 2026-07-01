/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { useUiStore } from '../store/useUiStore';

// Create an Axios instance
export const apiClient = axios.create({
  baseURL: 'https://api.irplus.co.kr/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request Interceptor: Auto-inject JWT tokens
apiClient.interceptors.request.use(
  (config) => {
    // In a real production app, we would fetch from localStorage or a state cookie
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi11dWlkIiwiZXhwIjoxNzg4NzA0MDAwfQ';
    
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request to our system logger for visibility
    const logMsg = `[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`;
    useUiStore.getState().addLog(
      'INFO',
      'API',
      logMsg,
      `Payload: ${config.data ? JSON.stringify(config.data) : 'None'}`
    );

    return config;
  },
  (error) => {
    useUiStore.getState().addLog(
      'ERROR',
      'API',
      'API 요청 생성 실패',
      error.message
    );
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error & success handler
apiClient.interceptors.response.use(
  (response) => {
    const logMsg = `[API RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`;
    useUiStore.getState().addLog(
      'SUCCESS',
      'API',
      logMsg,
      `Data size: ${JSON.stringify(response.data).length} bytes`
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMsg = `[API ERROR] ${status || 'Network Error'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`;
    const errorDetails = error.response?.data?.message || error.message;

    useUiStore.getState().addLog(
      'ERROR',
      'API',
      errorMsg,
      `디버그 가이드: ${errorDetails}. (자동 401/403 전역 핸들링 트리거됨)`
    );

    if (status === 401 || status === 403) {
      // In a real application, refresh token rotation or logout would trigger here
      console.warn('인가 제한 (401/403) 감지 - 세션 토큰 점검 필요');
    }

    return Promise.reject(error);
  }
);
