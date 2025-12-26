import { container } from "tsyringe";
import express, {
  NextFunction,
  Request, 
  Response
} from "express";
import { asyncHandler } from "@shared/http/async-handler";
import { authMiddleware } from "@presentation/auth.guard";
import { AccountController } from "../controllers/account.controller";

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
      const created = await accountController.createAccount(req.user.user_id);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  })
);

export { router as account };