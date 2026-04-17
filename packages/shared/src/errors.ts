export type ErrorDetails = Record<string, unknown> | undefined;

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: ErrorDetails;

  public constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      details?: ErrorDetails;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code ?? "APP_ERROR";
    this.statusCode = options.statusCode ?? 500;
    this.details = options.details;
  }
}

export class ValidationError extends AppError {
  public constructor(message = "Validation failed", details?: ErrorDetails, cause?: unknown) {
    super(message, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details,
      cause
    });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  public constructor(message = "Unauthorized", details?: ErrorDetails, cause?: unknown) {
    super(message, {
      code: "UNAUTHORIZED",
      statusCode: 401,
      details,
      cause
    });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  public constructor(message = "Forbidden", details?: ErrorDetails, cause?: unknown) {
    super(message, {
      code: "FORBIDDEN",
      statusCode: 403,
      details,
      cause
    });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  public constructor(message = "Resource not found", details?: ErrorDetails, cause?: unknown) {
    super(message, {
      code: "NOT_FOUND",
      statusCode: 404,
      details,
      cause
    });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  public constructor(message = "Resource conflict", details?: ErrorDetails, cause?: unknown) {
    super(message, {
      code: "CONFLICT",
      statusCode: 409,
      details,
      cause
    });
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  public constructor(message = "Too many requests", details?: ErrorDetails, cause?: unknown) {
    super(message, {
      code: "RATE_LIMITED",
      statusCode: 429,
      details,
      cause
    });
    this.name = "RateLimitError";
  }
}

export class NotImplementedError extends AppError {
  public constructor(message = "Not implemented", details?: ErrorDetails, cause?: unknown) {
    super(message, {
      code: "NOT_IMPLEMENTED",
      statusCode: 501,
      details,
      cause
    });
    this.name = "NotImplementedError";
  }
}
