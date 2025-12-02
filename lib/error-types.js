export const ErrorTypes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT'
};

export function createError(type, message, details = null) {
  const error = { error: type, message };
  if (details) {
    error.details = process.env.NODE_ENV === 'development' ? details : undefined;
  }
  return error;
}

export function logError(context, error) {
  const errorInfo = {
    message: error?.message || String(error) || 'Unknown error',
    code: error?.code,
    name: error?.name,
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorInfo.stack = error?.stack;
  }
  
  const cleanedInfo = Object.fromEntries(
    Object.entries(errorInfo).filter(([_, v]) => v !== undefined)
  );
  
  console.error(`[${context}]:`, cleanedInfo);
}
