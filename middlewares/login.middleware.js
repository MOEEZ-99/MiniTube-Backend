import dotenv from "dotenv"
import User from "../models/user.model.js";
import { decode } from "jsonwebtoken";
import jwt from "jsonwebtoken"

dotenv.config()

export const loginMiddleware = async (req,res, next) => { 
    const accessToken = req.cookies.accessToken;
    //  req.header("Authorization").replace("Bearer ", "")
    if (!accessToken) {
        return res.status(401).json({ message: "unauthorized user" });
    }

  
    try {
        const decoded = await jwt.verify(accessToken, process.env.JWT_SECRET);
          const user = await User.findById(decoded._id);

        if(!user) {
                return res.status(400).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: "Unauthorized Server Error" });
    }
 }
