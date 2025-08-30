import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"

export const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const owner = req.user._id;
        const playlist = await Playlist.create({ name, description, videos: [], owner })
        res.json(new ApiResponse(200, playlist))
    } catch (error) {
        console.log(error)
        res.json({ message: "Error creating playlist" })
    }
}


//export const getUserPlaylists = async (req, res) => {
//    try {
//        const userId = req.user._id
//        const playlists = await Playlist.find({ owner: userId })
//           const playlists = await Playlist.aggregate([
//            {
//                $match:{owner: new mongoose.Types.ObjectId(userId)}            
//            },
//            {
//                $lookup:{
//                    from:"videos",
//                    localField:""        
//                }    
//            }
//])
//        res.json(new ApiResponse(200, playlists))
//    } catch (error) {
//        console.log(error)
//        res.json({ message: "Error finding user playlist" })
//    }
//}
//




export const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;

    const playlists = await Playlist.aggregate([
      {
        $match: { owner: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",      
          foreignField: "_id",
          as: "videos"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "videos.owner", 
          foreignField: "_id",
          as: "videoOwners"
        }
      },
      {
        $addFields: {
          videos: {
            $map: {
              input: "$videos",
              as: "video",
              in: {
                $mergeObjects: [
                  "$$video",
                  {
                    owner: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$videoOwners",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$video.owner"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          videoOwners: 0 
        }
      }
    ]);

    res.json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
  } catch (error) {
    console.log("Error finding user playlist:", error);
    res.json({ message: "Error finding user playlist" });
  }
};




export const getPlaylistById = async (req, res) => {
    const id = req.params.id;
//    const playlist = await Playlist.findById(id)

const playlist = await Playlist.aggregate([
  {
    $match: { _id: new mongoose.Types.ObjectId(id) }
  },
  {
    // Join videos collection
    $lookup: {
      from: "videos", // name of the videos collection
      localField: "videos", // playlist.videos (array of video IDs)
      foreignField: "_id", // match with video._id
      as: "videos" // replace array of IDs with array of full video docs
    }
  },
  {
    // For each video, also bring its owner (user)
    $unwind: {
      path: "$videos",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: "users", // collection containing user docs
      localField: "videos.owner", // owner field in video doc
      foreignField: "_id", // match with user._id
      as: "videos.owner"
    }
  },
  {
    // Since owner comes as array, flatten it to a single object
    $unwind: {
      path: "$videos.owner",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    // Group back videos after unwinding
    $group: {
      _id: "$_id",
      name: { $first: "$name" },
      description: { $first: "$description" },
      owner: { $first: "$owner" },
      videos: { $push: "$videos" }
    }
  }
]);

    res.json(new ApiResponse(200, playlist))

}


export const addVideoToPlaylist = async (req, res) => {
    try {
        const { playlistId, videoId } = req.params
        const find = await Playlist.findOne({_id:playlistId,videos:videoId})
        if(find) return res.json(new ApiResponse(404,find,"Video already in the playlist"))
        const playlist = await Playlist.findById(playlistId)
        playlist.videos.push(videoId)
        await playlist.save()
        res.json(new ApiResponse(200, playlist))
    } catch (error) {
        console.log(error)
        res.json({ message: "Error adding video to playlist" })
    }
}

export const removeVideoFromPlaylist = async (req, res) => {
    try {
        const { playlistId, videoId } = req.params
        const playlist = await Playlist.findById(playlistId)
        playlist.videos = playlist.videos.filter(video => video.toString() !== videoId)
        await playlist.save()
        res.json(new ApiResponse(200, playlist, "Video deleted from playlist"))
    } catch (error) {
        console.log(error)
        res.json({ message: "Error adding video to playlist" })
    }
}

export const deletePlaylist = async (req,res) => { 
   try {
     const id = req.params.id;
     const playlist = await Playlist.findByIdAndDelete(id)
     res.json(new ApiResponse(200,playlist,"Playlist deleted successfully"))
   } catch (error) {
       console.log(error)
       res.json({message:"Error deleting playlist"})
   }
}


export const updatePlaylist = async (req,res) => { 
   try {
     const id = req.params.id;
     const {name,description} = req.body;
     const playlist = await Playlist.findByIdAndUpdate(id,{name,description},{new:true})
     res.json(new ApiResponse(200,playlist))
   } catch (error) {
    console.log(error)
       res.json({message:"Error updating playlist"})
   }
 }
