import { container } from "tsyringe";
import express from "express";
import { WebhooksCalHandler } from "@modules/cal/handlers/webhooks-cal.handler";
import { authMiddleware } from "@presentation/auth.guard";

const router = express.Router();

const webhooksCalHandler = container.resolve(WebhooksCalHandler);

router.post("/", webhooksCalHandler.handleWebhook.bind(webhooksCalHandler));
router.post("/create", authMiddleware, webhooksCalHandler.createWebhook.bind(webhooksCalHandler));

export { router as webhooksCal };