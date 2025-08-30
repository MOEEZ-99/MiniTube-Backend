import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
export const createTweet = async (req,res) => { 
    try {
        const owner = req.user._id
        const content = req.body.content
        const tweet = await Tweet.create({owner,content})
        res.json(new ApiResponse(200,tweet))
    } catch (error) {
        console.log(error,"error creating tweet")
        res.json({message:"Error creating tweet"})
    }
 }


 export const getUserTweets = async (req,res) => { 
    try {
      const userId = req.user._id
      const userTweets = await Tweet.find({owner:userId})
      const totalTweets = await Tweet.find({owner:userId}).countDocuments();
      res.json(new ApiResponse(200,{userTweets,totalTweets}))
    } catch (error) {
        console.log(error,"error finding user tweet")
        res.json({message:"Error finding user tweet"})
    }
 } 


export const getAllTweets = async (req,res) => { 
    try {
        const id = req.params.id
        const tweets = await Tweet.aggregate([
            {
                $match:{owner:new mongoose.Types.ObjectId(id)}
            },
            {
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"likes"
                },
                
            },
            {
                $addFields:{
                    likes:{$size:"$likes"},
                    isLiked: {
                        $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                    },
                    isUserTweet: { $eq: ["$owner", new mongoose.Types.ObjectId(req.user._id)] },
                }
            }
        ])
        res.json(new ApiResponse(200,tweets))
    } catch (error) {
        console.log(error,"error finding all tweets")
        res.json({message:"Error finding all tweets"})
    }
 }

export const updateTweet = async (req,res) => { 
    try {
        const tweetId = req.params.id
        const content = req.body.content
        const tweet = await Tweet.findByIdAndUpdate(tweetId,{content},{new:true})
        res.json(new ApiResponse(200,tweet))
    } catch (error) {
        console.log(error,"error updating tweet")
        res.json({message:"Error updating tweet"})
    }
}



export const deleteTweet = async (req,res) => { 
   try {
     const id = req.params.id;
     const del = Tweet.findBVyIdAndDelete(id)
     res.json(new ApiResponse(200,del))
   } catch (error) {
       console.log(error,"error deleting tweet")
       res.json({message:"Error deleting tweet"})
   }
 }