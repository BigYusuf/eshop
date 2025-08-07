import express, { Router } from "express";
import {
  userLogin,
  userRegister,
  userVerify,
} from "../controllers/auth.controller";

const authroute: Router = express.Router();

authroute.post("/user-register", userRegister);
authroute.post("/user-verify", userVerify);
authroute.post("/user-login", userLogin);

export default authroute;
