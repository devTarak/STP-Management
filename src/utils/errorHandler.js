export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function parseApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || 'An unexpected error occurred';
    const errors = data?.errors || null;
    return new ApiError(message, status, errors);
  }

  if (error.request) {
    return new ApiError('Network error. Please check your connection.', 0);
  }

  return new ApiError(error.message || 'An unexpected error occurred', 0);
}

export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function getFieldErrors(error) {
  if (error instanceof ApiError) {
    return error.errors;
  }
  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }
  return null;
}
