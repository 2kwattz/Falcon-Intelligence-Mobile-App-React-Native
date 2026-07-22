export interface ApiErrorShape {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
