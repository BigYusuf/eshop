import express, { Router } from "express";
import {
  connectBank,
  createShop,
  followShop,
  getFollowedShops,
  getSeller,
  getShopFollowers,
  getUser,
  refreshTokenAuth,
  sellerLogin,
  sellerRegister,
  sellerVerify,
  unfollowShop,
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
authroute.post("/follow", isAuth, followShop);
authroute.post("/unfollow", isAuth, unfollowShop);
authroute.get("/my-shops", isAuth, getFollowedShops);

//both users & sellers
authroute.post("/refresh-token", refreshTokenAuth);

//sellers
authroute.post("/seller-register", sellerRegister);
authroute.post("/seller-login", sellerLogin);
authroute.post("/seller-verify", sellerVerify);
authroute.get("/seller-logged-in", isAuth, isSeller, getSeller);
authroute.post("/create-shop", createShop);
authroute.post("/connect-bank", connectBank);
authroute.get("/shop/:shopId/followers", isAuth, isSeller, getShopFollowers);

export default authroute;
