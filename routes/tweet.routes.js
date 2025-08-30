import express from "express"
import {createTweet,getUserTweets,updateTweet,getAllTweets,deleteTweet} from "../controllers/tweet.controller.js"
import {loginMiddleware }from "../middlewares/login.middleware.js"


const router = express.Router();

router.post("/create-tweet",loginMiddleware,createTweet)
router.get("/user-tweets",loginMiddleware,getUserTweets)
router.get("/get-tweets/:id",loginMiddleware,getAllTweets)
router.put("/update-tweet/:id",loginMiddleware,updateTweet)
router.delete("/delete-tweet/:id",loginMiddleware,deleteTweet)


//router.get("/get-tweets/:id",)

export default router