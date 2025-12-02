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
  console.error(`[${context}]:`, {
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}
