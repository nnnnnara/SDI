import axios from 'axios';

// In production nginx exposes the backend under /api and strips that prefix.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function createApiUrl(path: string) {
  const baseURL = apiClient.defaults.baseURL || '/api';
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
    const normalizedBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
    return new URL(normalizedPath, normalizedBase).toString();
  }

  return `${baseURL.replace(/\/$/, '')}/${normalizedPath}`;
}

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Centralized type definitions corresponding to backend DTOs
export interface UserSummaryResponse {
  userId: number;
  name: string;
}

export interface ProcessRunResponse {
  runId: number;
  status: 'READY' | 'RUNNING' | 'COMPLETED' | 'STOPPED' | 'ERROR';
  startedAt: string;
  endedAt?: string;
  stopReason?: string;
  startedBy?: UserSummaryResponse;
}

export interface ControlCommandResponse {
  commandId: number;
  runId?: number;
  commandType: 'START' | 'STOP';
  commandStatus: 'REQUESTED' | 'SENT' | 'SUCCESS' | 'FAILED';
  issuedAt: string;
  executedAt?: string;
  user?: UserSummaryResponse;
}

export interface InspectionDefectResponse {
  defectId: number;
  defectType: string;
  bboxX: number;
  bboxY: number;
  bboxW: number;
  bboxH: number;
}

export interface InspectionResponse {
  inspectionId: number;
  serialNo: string;
  result: 'GOOD' | 'BAD';
  confidence: number;
  rawImageUrl: string;
  resultImageUrl: string;
  inspectedAt: string;
  defects: InspectionDefectResponse[];
}

export interface SystemLogResponse {
  logId: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
  runId?: number;
  createdAt: string;
}

// Global ApiResponse wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  errorCode?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}
