/**
 * Executa uma função com lógica de retry e exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelay?: number;
        onRetry?: (error: any, attempt: number) => void;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        onRetry = (error, attempt) => console.warn(`⚠️ Tentativa ${attempt} falhou. Retrying...`, error.message)
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) break;

            const delay = initialDelay * Math.pow(2, attempt - 1);
            onRetry(error, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}
