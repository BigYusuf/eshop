import express, { Router } from "express";
import { userRegister, userVerify } from "../controllers/auth.controller";

const authroute: Router = express.Router();

authroute.post("/user-register", userRegister);
authroute.post("/user-verify", userVerify);

export default authroute;
