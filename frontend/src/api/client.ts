import axios from 'axios';

// Use environment variable for the base URL. If not set, fallback to empty string (relative path)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  username: string;
  role: string;
}

export interface ProcessRunResponse {
  runId: number;
  status: 'READY' | 'RUNNING' | 'STOPPED' | 'ERROR';
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

export interface EnvironmentLogResponse {
  envLogId: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  measuredAt: string;
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
  result: 'PASS' | 'FAIL';
  confidence: number;
  rawImageUrl: string;
  resultImageUrl: string;
  inspectedAt: string;
  defects: InspectionDefectResponse[];
}

export interface SystemLogResponse {
  logId: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DANGER';
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
