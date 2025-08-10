import express, { Router } from "express";
import {
  getUser,
  refreshTokenAuth,
  userForgotPassword,
  userLogin,
  userRegister,
  userResetPassword,
  userVerify,
  verifyUserPassword,
} from "../controllers/auth.controller";
import { isAuth } from "@packages/middleware/isAuthenticated";

const authroute: Router = express.Router();

authroute.post("/user-register", userRegister);
authroute.post("/user-verify", userVerify);
authroute.post("/user-login", userLogin);
authroute.post("/user-refresh-token", refreshTokenAuth);
authroute.get("/user-logged-in", isAuth, getUser);
authroute.post("/forgot-password-user", userForgotPassword);
authroute.post("/reset-password-user", userResetPassword);
authroute.post("/verify-forgot-password-user", verifyUserPassword);

export default authroute;
