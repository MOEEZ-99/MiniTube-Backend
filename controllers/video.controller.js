import Video from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose";
import Views from "../models/views.model.js";

export const uploadVideo = async (req, res) => {
    // console.log(req.files)
    try {
        const { title, description } = req.body;

        const files = req.files
        const videoFile = files.videoFile[0].path
        const thumbnail = files.thumbnail[0].path
        const userId = req.user._id

        const videoUrl = await uploadOnCloudinary(videoFile);
        const thumbnailUrl = await uploadOnCloudinary(thumbnail);
        const newVideo = new Video({
            title,
            description,
            videoFile: videoUrl.secure_url,
            owner: userId,
            thumbnail: thumbnailUrl.secure_url,
            duration: videoUrl.duration

        });
        await newVideo.save();
        // res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
        const data = await newVideo.populate("owner");
        res.status(201).json(new ApiResponse(201, data));
    } catch (error) {
        console.log(error)
        res.status(500).json(new ApiResponse(500, { message: "Error uploading video", error }));
    }
}
export const getAllVideos = async (req, res) => {
  const { lastId } = req.query;
  const limit = 100;

  let matchQuery = {};
  if (lastId) {
    matchQuery = { _id: { $lt: new mongoose.Types.ObjectId(lastId) } };
  }

  try {
    const videos = await Video.aggregate([
      { $match: matchQuery },
      { $sort: { _id: -1 } },
      { $limit: limit },

      // join owner
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner"
        }
      },
      { $unwind: "$owner" },

      // join likes
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes"
        }
      },

      // join views
      {
        $lookup: {
          from: "views",
          localField: "_id",
          foreignField: "video",
          as: "views"
        }
      },

      // add counts + hasViewed
      {
        $addFields: {
          likes: { $size: "$likes" },
          views: { $size: "$views" },
          hasViewed: {
            $in: [
              new mongoose.Types.ObjectId(req.user._id),
              "$views.viewerId"
            ]
          }
        }
      }
    ]);

    res.json(new ApiResponse(200, videos));
  } catch (error) {
    console.log("Error fetching all videos: ", error);
    res.json({ message: "Error fetching videos" });
  }
};


export const getVideoById = async (req, res) => {
    const id = req.params.id;
    try {
        // const find = await Video.findById(id).populate("owner");
        const find = await Video.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "views",
                    localField: "_id",
                    foreignField: "video",
                    as: "views"
                }
            },
            {
                $addFields: {
                    likes: { $size: "$likes" },
                    views: { $size: "$views" },
                    hasViewed: {
                        $in: [new mongoose.Types.ObjectId(req.user._id), "$views.viewerId"]
                    },
                    isLiked:{
                        $in:[new mongoose.Types.ObjectId(req.user._id),"$likes.likedBy"]
                    }
                }
            }
        ]);
        await Views.updateOne(
            { video: new mongoose.Types.ObjectId(id), viewerId: new mongoose.Types.ObjectId(req.user._id) },
            { $setOnInsert: { video: id, viewerId: req.user._id } },
            { upsert: true }
        );
        if (find) {
            res.json(new ApiResponse(200, find))
        } else {
            res.json({ message: "Video not found" })
        }
    } catch (error) {
        console.log("Fetch video by id error ", error)
        res.json({ messgae: "Error fetching video" })
    }
}







export const getUserVideos = async (req, res) => {
    const id = req.user._id;
    try {
//        const find = await Video.find({ owner: id }).populate("owner")
           const find = await Video.aggregate([
            {
                $match:{owner: new mongoose.Types.ObjectId(id)}
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
              }
            },
            {
                $lookup:{
                    from:"views",
                    localField:"_id",
                    foreignField:"video",
                    as:"views"    
                }
            },
            {
            $addFields:{
                views:{$size:"$views"}
            }
            }
])
        if (find) {
            res.json(new ApiResponse(200, find))
        } else {
            res.json({ message: "Videos not found" })
        }
    } catch (error) {
        console.log("Fetch video by id error ", error)
        res.json({ messgae: "Error fetching video" })
    }
}

export const updateVideo = async (req, res) => {
    const { id } = req.params
    const { title, description } = req.body
    try {
        const find = await Video.findByIdAndUpdate(id, { title, description }, { new: true })
        if (find) {
            res.json(new ApiResponse(200, find))
        } else {
            res.json({ message: "Video not found" })
        }
    } catch (error) {
        console.log("Update video error ", error)
        res.json({ message: "Error updating video" })
    }
}

export const deleteVideo = async (req, res) => {
    const { id } = req.params
    try {
        const find = await Video.findByIdAndDelete(id)
        if (find) {
            res.json(new ApiResponse(200, { message: "Video deleted successfully" }))
        } else {
            res.json({ message: "Video not found" })
        }
    } catch (error) {
        console.log("Delete video error ", error)
        res.json({ message: "Error deleting video" })
    }
}
