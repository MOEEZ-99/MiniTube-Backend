
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

export const getVideoComments = async (req, res) => {
    try {
        const comments = await Comment.aggregate([
            { $match: { video: new mongoose.Types.ObjectId(req.params.id) } },

            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "comment",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $addFields: {
                    totalLikes: { $size: "$likes" },
                   
                    isUserComment: {
  $eq: [
    { $arrayElemAt: ["$owner._id", 0] },
    new mongoose.Types.ObjectId(req.user._id)
  ]
},


                    isLiked: {
                        $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        // const totalComments = await Comment.countDocuments({ video: req.params.id });

        res.json(new ApiResponse(200, {
            comments,
            // totalComments
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching comments" });
    }
};


export const addComment = async (req, res) => {
    const owner = req.user._id;
    const video = req.params.id;
    const content = req.body.content;
    const newComment = await Comment.create({ owner, video, content })
    res.json(new ApiResponse(200, newComment))
}

export const updateComment = async (req, res) => {
    const commentId = req.params.id;
    const content = req.body.content;
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true })
    res.json(new ApiResponse(200, updatedComment))
}

export const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    res.json(new ApiResponse(200, deletedComment))
}
