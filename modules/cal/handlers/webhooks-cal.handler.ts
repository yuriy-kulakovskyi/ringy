import crypto from "crypto";
import { Request, Response } from "express";
import { logger } from "@shared/logger/logger";
import { env } from "@config/env";

export class WebhooksCalHandler {
  handleWebhook(req: Request, res: Response) {
    const signature = req.headers["x-cal-signature-256"];
    const secret = env.CAL_WEBHOOK_SECRET;
    
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(JSON.stringify(req.body));
    const expectedSignature = hmac.digest("hex");
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    logger.info("Received valid CAL webhook test: " + JSON.stringify(req.body));
  
    res.status(200).json({ message: "Webhook received successfully" });
  }
}