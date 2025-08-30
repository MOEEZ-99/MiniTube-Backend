import express from "express";
import { uploadVideo,getAllVideos, getVideoById, updateVideo,deleteVideo ,getUserVideos} from "../controllers/video.controller.js";
import upload from "../middlewares/multer.middleware.js";
import {loginMiddleware} from "../middlewares/login.middleware.js"; 

const router = express.Router();


router.post("/upload-video",upload.fields([{name:"videoFile",maxCount:1},{name:"thumbnail",maxCount:1}]),loginMiddleware,uploadVideo)
router.get("/all-videos",loginMiddleware,getAllVideos)
router.get("/watch-video/:id",loginMiddleware,getVideoById)
router.get("/user-videos",loginMiddleware,getUserVideos)
router.post("/update-video/:id",loginMiddleware,updateVideo)
router.delete("/delete-video/:id",loginMiddleware,deleteVideo)



export default router 