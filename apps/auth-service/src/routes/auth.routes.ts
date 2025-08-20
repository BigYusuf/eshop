import express, { Router } from "express";
import {
  connectBank,
  createShop,
  getSeller,
  getUser,
  refreshTokenAuth,
  sellerLogin,
  sellerRegister,
  sellerVerify,
  userForgotPassword,
  userLogin,
  userRegister,
  userResetPassword,
  userVerify,
  verifyUserPassword,
} from "../controllers/auth.controller";
import {
  isAuth,
  isSeller,
} from "../../../../packages/middleware/isAuthenticated";

const authroute: Router = express.Router();
//users
authroute.post("/user-register", userRegister);
authroute.post("/user-verify", userVerify);
authroute.post("/user-login", userLogin);
authroute.get("/user-logged-in", isAuth, getUser);
authroute.post("/forgot-password-user", userForgotPassword);
authroute.post("/reset-password-user", userResetPassword);
authroute.post("/verify-forgot-password-user", verifyUserPassword);

//both users & sellers
authroute.post("/refresh-token", refreshTokenAuth);

//sellers
authroute.post("/seller-register", sellerRegister);
authroute.post("/seller-login", sellerLogin);
authroute.post("/seller-verify", sellerVerify);
authroute.get("/seller-logged-in", isAuth, isSeller, getSeller);
authroute.post("/create-shop", createShop);
authroute.post("/connect-bank", connectBank);

export default authroute;
