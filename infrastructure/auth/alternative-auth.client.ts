import { env } from "@config/env"
import { AppError } from "@shared/errors/app-error"
import { IUserResponse } from "@shared/interfaces/user/user.interface"
import { logger } from "@shared/logger/logger"

export class AlternativeAuthClient {
  async verify(token: string): Promise<IUserResponse> {
    try {
      const response = await fetch(env.VERIFY_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          api_key: env.ALTERNATIVE_AUTH_API_KEY,
        }),
      })

      if (!response.ok) {
        logger.error(`AlternativeAuthClient verify failed with status ${response.status}`);
        throw new AppError(response.status, "Authentication failed")
      }

      const json = await response.json();

      if (!json || typeof json !== 'object') {
        logger.error(`AlternativeAuthClient verify received invalid response format`);
        throw new AppError(500, "Invalid response format");
      }

      if (response.status !== 200) {
        logger.error(`AlternativeAuthClient verify unsuccessful: ${JSON.stringify(json)}`);
        throw new AppError(401, "Authentication failed");
      }

      logger.info(`AlternativeAuthClient verify succeeded for token`);
      return json as IUserResponse;
    } catch (error) {
      if (error instanceof AppError) {
        logger.error(`AlternativeAuthClient verify error: ${error.message}`);
        throw error
      }

      logger.error(`AlternativeAuthClient unexpected error: ${(error as Error).message}`);
      throw new AppError(500, "Authentication service error")
    }
  }
}