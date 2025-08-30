import mongoose from "mongoose";

const viewsSchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    viewerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
}, {timestamps: true})


const viewsModel = mongoose.model("Views", viewsSchema);

export default viewsModel;