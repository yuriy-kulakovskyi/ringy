import express from "express";
import { WebhooksCalHandler } from "@modules/cal/handlers/webhooks-cal.handler";

const router = express.Router();

const webhooksCalHandler = new WebhooksCalHandler();

router.post("/", webhooksCalHandler.handleWebhook.bind(webhooksCalHandler));

export { router as webhooksCal };