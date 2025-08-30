import express from "express"
import { getUserSubscriptions,unsubscribe,subscribe,getUserChannelProfile,register,updateProfilePic,updateCoverImage,login,logout,refreshAccessToken,updateUser,getUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js"; // Assuming you have a multer setup for file uploads
import { loginMiddleware } from "../middlewares/login.middleware.js";

const router = express.Router()

router.post("/register", upload.fields([
    {
        name:"profilePic",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]), register)


router.post("/login",login)
router.get("/logout", loginMiddleware, logout);
router.get("/user", loginMiddleware, getUser);
router.post("/refresh-token",refreshAccessToken)
router.put("/update-user", loginMiddleware, updateUser)
router.put("/update-profilePic", loginMiddleware, upload.single("profilePic") ,updateProfilePic)
router.put("/update-coverImage", loginMiddleware, upload.single("coverImage") ,updateCoverImage)
router.get("/user/:id", loginMiddleware, getUserChannelProfile)
router.get("/subscribe/:id",loginMiddleware,subscribe)
router.get("/my-subscriptions", loginMiddleware, getUserSubscriptions)
router.delete("/unsubscribe/:id",loginMiddleware,unsubscribe)




export default router;
