import "dotenv/config"

const required = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  VERIFY_TOKEN_URL: required("VERIFY_TOKEN_URL"),
  ALTERNATIVE_AUTH_API_KEY: required("ALTERNATIVE_AUTH_API_KEY"),

  // DATABASE_URL: required("DATABASE_URL"),

  // // Stripe
  // STRIPE_SECRET_KEY: required("STRIPE_SECRET_KEY"),
  // STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),

  // // Cal.com
  // CALCOM_API_BASE_URL: "https://api.cal.com/v2",
  // CALCOM_API_KEY: required("CALCOM_API_KEY"),

  // // VAPI
  // VAPI_API_KEY: required("VAPI_API_KEY"),
}