import {Like} from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";



export const toggleVideoLike = async (req,res) => { 
    const userId = req.user._id
    const video = req.params.id

    const exists = await Like.findOne({likedBy:userId,video:video})
    if(!exists){
        const newLike = await Like.create({likedBy:userId,video:video})
        const totalLikes = await Like.find({video:video}).countDocuments();
        res.json(new ApiResponse(200,{newLike,totalLikes}))
    }else{
        const deletedLike = await Like.findOneAndDelete({likedBy:userId,video:video})
        const totalLikes = await Like.find({video:video}).countDocuments();
        res.json(new ApiResponse(200,{deletedLike,totalLikes}))
    }
 }


export const toggleCommentLike = async (req,res) => { 
    const userId = req.user._id
    const comment = req.params.id

    const exists = await Like.findOne({likedBy:userId,comment:comment})
    if(!exists){
        const newLike = await Like.create({likedBy:userId,comment:comment})
        const totalLikes = await Like.find({comment:comment}).countDocuments();
        res.json(new ApiResponse(200,{newLike,totalLikes}))
    }else{
        const deletedLike = await Like.findOneAndDelete({likedBy:userId,comment:comment})
        const totalLikes = await Like.find({comment:comment}).countDocuments();
        res.json(new ApiResponse(200,{deletedLike,totalLikes}))
    }
 }


export const toggleTweetLike = async (req,res) => { 
    const userId = req.user._id
    const tweet = req.params.id

    const exists = await Like.findOne({likedBy:userId,tweet:tweet})
    if(!exists){
        const newLike = await Like.create({likedBy:userId,tweet:tweet})
        const totalLikes = await Like.find({tweet:tweet}).countDocuments();
        res.json(new ApiResponse(200,{newLike,totalLikes}))
    }else{
        const deletedLike = await Like.findOneAndDelete({likedBy:userId,tweet:tweet})
        const totalLikes = await Like.find({tweet:tweet}).countDocuments();
        res.json(new ApiResponse(200,{deletedLike,totalLikes}))
    }
 }


export const getLikedVideos = async (req, res) => { 
    const userId = req.user._id

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    })
    .populate({
        path: "video",
        populate: {
            path: "owner",         
            select: "-password -__v"  
        }
    })

    res.json(new ApiResponse(200, likedVideos))
}

