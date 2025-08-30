import mongoose from "mongoose";


const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String,
        required: true
    },
    thumbnail:{
        type:String,
        required: true
    },
    title:{
        type:String,
        required: true
    },
    description:{
        type:String, 
        required: true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    duration:{
        type:Number
    }
},
    {timestamps:true}
)


const videoModel = mongoose.model("Video", videoSchema);

export default videoModel;
