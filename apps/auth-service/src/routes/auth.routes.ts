import express, { Router } from "express";
import {
    userForgotPassword,
  userLogin,
  userRegister,
  userResetPassword,
  userVerify,
  verifyUserPassword,
} from "../controllers/auth.controller";

const authroute: Router = express.Router();

authroute.post("/user-register", userRegister);
authroute.post("/user-verify", userVerify);
authroute.post("/user-login", userLogin);
authroute.post("/forgot-password-user", userForgotPassword);
authroute.post("/reset-password-user", userResetPassword);
authroute.post("/verify-forgot-password-user", verifyUserPassword);

export default authroute;
