import express from "express"
import { loginMiddleware } from "../middlewares/login.middleware.js";
import {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos} from "../controllers/like.controller.js"


const router = express.Router();


router.get("/toogle-video-like/:id",loginMiddleware,toggleVideoLike)
router.get("/toogle-comment-like/:id",loginMiddleware,toggleCommentLike)
router.get("/toogle-tweet-like/:id",loginMiddleware,toggleTweetLike)
router.get("/get-liked-videos",loginMiddleware,getLikedVideos)

export default router 