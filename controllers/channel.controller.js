import User from "../models/user.model.js"
import Subscription from "../models/subscribtion.model.js";
import Video from "../models/video.model.js";


export const getChannelStats = async (req,res) => { 
 try {
     const channelUserId = req.params.id;
     const user = await User.findById(req.params.id);
     const subscribers = await Subscription.find({channel:channelUserId}).countDocuments();
     const is = await Subscription.findOne({subscriber:req.user._id})
     const isSubscribed = !!is
     res.json({user,subscribers,isSubscribed})
 } catch (error) {
    console.log(error)
    res.send("Error")
 }
 }


 export const getChannelVideos = async (req,res) => { 
    try {
        const channelId = req.params.id;
        const videos = await Video.find({owner:channelId}).populate("owner")
        res.json(videos)
    } catch (error) {
        console.log(error)
        res.json({message:"Error",error:error.message})
    }
  }
