import "server-only"

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

// Server-only values. Next.js loads the .env files itself, so dotenv isn't needed
export const env = {
  API_URL: getEnv("API_URL"),
} as const
