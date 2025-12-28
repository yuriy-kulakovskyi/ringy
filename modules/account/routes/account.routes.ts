import { container } from "tsyringe";
import express, {
  NextFunction,
  Request, 
  Response
} from "express";
import { asyncHandler } from "@shared/http/async-handler";
import { authMiddleware } from "@presentation/auth.guard";
import { AccountController } from "@modules/account/controllers/account.controller";
import { UpdateAccountDto } from "@shared/dto/account/update-account.dto";
import { validateInput } from "@shared/middlewares/validate-input.middleware";

const router = express.Router();
const accountController = container.resolve(AccountController);

router.get("/me", authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const account = await accountController.getMe(req.user.user_id);
  res.status(200).json(account);  
}));

router.post(
  "/create",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await accountController.createAccount(req.user.user_id, req.user.email);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  })
);

router.patch(
  "/settings",
  authMiddleware,
  validateInput(UpdateAccountDto),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateRequest = {
        userId: req.user.user_id,
        phoneNumber: req.body.phoneNumber,
        remindBeforeMinutes: req.body.remindBeforeMinutes,
      };
      const updated = await accountController.updateAccountSettings(updateRequest);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  })
);

export { router as account };