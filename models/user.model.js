import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    fullName:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    profilePic:{
        type: String,
        required: true
    },
    coverImage:{
        type: String,
    },
    watchHistory:[
        {
            videoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
            watchedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    refreshToken:{
        type: String,
    },
    profilePicPublicId:{
        type:String,
        require:true
    },
    coverImagePublicId:{
        type:String,
    }
},
    {timestamps: true}
)

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.hash(this.password, 10);
    this.password = salt
    next();
});


userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
    const token = jwt.sign({ _id: this._id, username: this.username, email: this.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

userSchema.methods.generateRefreshToken = function() {
    const token = jwt.sign({ id: this._id, username: this.username, email: this.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
