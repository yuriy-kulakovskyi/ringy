import { container } from "tsyringe";
import { CAL_SERVICE } from "@modules/cal/domain/tokens/cal.tokens";
import { WebhooksCalService } from "@modules/cal/application/services/cal.service";

container.register(CAL_SERVICE, {
  useClass: WebhooksCalService
})