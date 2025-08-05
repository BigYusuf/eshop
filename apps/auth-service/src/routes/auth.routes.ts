import express, { Router } from "express";
import { userRegister } from "../controllers/auth.controller";

const authroute: Router = express.Router();

authroute.post("/user-register", userRegister);

export default authroute;
