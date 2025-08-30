import {getVideoComments,addComment,updateComment,deleteComment} from "../controllers/comment.controller.js";
import express from "express"
import {loginMiddleware} from "../middlewares/login.middleware.js";

const router = express.Router()


router.get("/get-comments/:id",loginMiddleware,getVideoComments)
router.post("/add-comment/:id",loginMiddleware,addComment)
router.post("/update-comment/:id",loginMiddleware,updateComment)
router.delete("/delete-comment/:id",loginMiddleware,deleteComment)


export default router
