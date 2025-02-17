import 'dotenv/config'
import OpenAI from 'openai'

// Remove debug logging to satisfy linter
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('NEXT_PUBLIC_OPENAI_API_KEY environment variable is not set')
}

// Ensure the API key is properly formatted
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY.trim()

export const openaiapi = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
})
