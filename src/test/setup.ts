import { vi } from 'vitest'

// Mock environment variables
process.env.IQAI_API_KEY = 'test_iqai_key'
process.env.OPENAI_API_KEY = 'test_openai_key'
process.env.LLM_MODEL = 'gpt-4o'
process.env.WEBHOOK_VERIFY_TOKEN = 'test_token'
process.env.PORT = '8043'
