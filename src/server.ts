import { app } from "./app";
import { user } from "@modules/user/controllers/user.controller";

app.use("/user", user);