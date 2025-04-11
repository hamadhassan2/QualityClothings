import express from "express";
import { adminLogin } from "../controllers/userController.js";

const userRouter = express.Router();

// Removed the customer login and registration routes.
// userRouter.post("/register", registerUser);
// userRouter.post("/login", loginUser);

// Keep only the admin login endpoint.
userRouter.post("/admin", adminLogin);

export default userRouter;
