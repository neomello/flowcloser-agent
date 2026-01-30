export class FlowCloserError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public context?: Record<string, any>
    ) {
        super(message);
        this.name = 'FlowCloserError';
        // Garante que a stack trace esteja correta em TS/JS
        Object.setPrototypeOf(this, FlowCloserError.prototype);
    }
}

export class ValidationError extends FlowCloserError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'VALIDATION_ERROR', 400, context);
    }
}

export class AuthenticationError extends FlowCloserError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'AUTHENTICATION_ERROR', 401, context);
    }
}

export class ExternalAPIError extends FlowCloserError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'EXTERNAL_API_ERROR', 502, context);
    }
}
