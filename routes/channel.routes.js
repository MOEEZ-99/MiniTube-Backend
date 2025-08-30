import express from "express"
import { getChannelStats,getChannelVideos } from "../controllers/channel.controller.js";
import { loginMiddleware } from "../middlewares/login.middleware.js";



const router = express.Router()


 router.get("/stats/:id",loginMiddleware,getChannelStats)
router.get("/videos/:id",getChannelVideos)

export default router
