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
  DATABASE_URL: required("DATABASE_URL"),
  CAL_WEBHOOK_CREATION_URL: required("CAL_WEBHOOK_CREATION_URL"),
  REDIS_URL: required("REDIS_URL"),
  VAPI_API_KEY: required("VAPI_API_KEY"),
  ASSISTANT_ID: required("ASSISTANT_ID"),
  PHONE_NUMBER_ID: required("PHONE_NUMBER_ID"),
  VAPI_CALL_URL: required("VAPI_CALL_URL"),

  // // Stripe
  // STRIPE_SECRET_KEY: required("STRIPE_SECRET_KEY"),
  // STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),
}