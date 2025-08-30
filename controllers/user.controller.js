import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/user.model.js"
import { uploadOnCloudinary,deleteCloudinary } from "../utils/cloudinary.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";     
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Subscription from "../models/subscribtion.model.js";
import {mongoose} from "mongoose"

dotenv.config();

export const register = asyncHandler(async (req, res) => {
       // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for profilePic
    // upload them to cloudinary, profilePic
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const profilePicLocalPath = req.files?.profilePic[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!profilePicLocalPath) {
        throw new ApiError(400, "profilePic[local] file is required")
    }

    const profilePic = await uploadOnCloudinary(profilePicLocalPath)

    let profilePicPublicId;
    let coverImagePublicId;

            profilePicPublicId = profilePic.public_id;

    let coverImage
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
        coverImagePublicId = coverImage.public_id;
    }
    
    
    
    if (!profilePic) {
        throw new ApiError(400, "profilePic file is required")
    }
   

    const user = await User.create({
        fullName,
        profilePic: profilePic.secure_url,
        coverImage: coverImage?.secure_url || "",
        email, 
        password,
        username: username.toLowerCase(),
        profilePicPublicId,
        coverImagePublicId
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    
    
});

const generateTokens = async (userId) => { 
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // user.accessToken = accessToken
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken,refreshToken}
 }

export const login = asyncHandler(async (req, res) => {
    // Get req.body
    // Check if user exists
    // Compare password
    // tokens
    // Cookies

    const {username,email,password} = req.body;
    const user = await User.findOne({
        $or:[
            {username},
            {email}
        ]
    });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true,
        sameSite:"none"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})


export const logout = async (req,res) => { 
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            // accessToken: null,
            refreshToken: null
        }
    })

      const options = {
        httpOnly: true,
        secure: true,
       sameSite:"none"
    }

    res.clearCookie("accessToken",options)
    res.clearCookie("refreshToken",options)
    res.json(new ApiResponse(200, {}, "User logged out successfully"))
 }



 export const refreshAccessToken = async (req,res) => { 
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true,
            sameSite:"none"
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
  }


  export const updateUser = async (req,res) => { 
    const {fullName} = req.body;
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(userId,{
//        username,
//        email,
        fullName
//        password
    }, {new: true});

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated Successfully")
    )
}

export const updateProfilePic = async (req,res) => { 
   try {
     if(req.file){
            // Delete old profilePic from cloudinary
        const profilePicPublicId = req.user.profilePicPublicId;
        if (profilePicPublicId) {
            await deleteCloudinary(profilePicPublicId);
        }

         const profilePic = await uploadOnCloudinary(req.file.path);
         const user = await User.findById(req.user._id);
         user.profilePic = profilePic.secure_url;
         await user.save();
         return res.status(200).json(
             new ApiResponse(200, user, "Profile updated Successfully")
         ) 
     }
     return res.status(400).json(
         new ApiResponse(400, {}, "No file uploaded")
     )
   } catch (error) {
        console.log(error)   
    return res.status(500).json(
           new ApiResponse(500, {}, "Internal Server Error")
       )
       
   }
}


export const updateCoverImage = async (req,res) => { 
   try {
     if(req.file){
            // Delete old coverImage from cloudinary
            const coverImagePublicId = req.user.coverImagePublicId;
            if (coverImagePublicId) {
                await deleteCloudinary(coverImagePublicId);
            }

         const coverImage = await uploadOnCloudinary(req.file.path);
         const user = await User.findById(req.user._id);
         user.coverImage = coverImage.secure_url;
         await user.save();
         return res.status(200).json(
             new ApiResponse(200, user, "CoverImage updated Successfully")
         )
     }
     return res.status(400).json(
         new ApiResponse(400, {}, "No file uploaded")
     )
   } catch (error) {
        console.log(error)   
        return res.status(500).json(
            new ApiResponse(500, {}, "Internal Server Error")
        )
   }
}  

export const getUser = async (req,res) => { 
    res.json(new ApiResponse(200, req.user, "Single User"))
    // res.json({user:req.user})
}


export const getUserChannelProfile = async (req,res) => { 
    const {id} = req.params

    if (!id) {
        throw new ApiError(400, "ID is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
         {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                profilePic:1

            }
        }
    ])

     if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    ) }

 export const subscribe = async (req,res) => {  
    try {
        const subscriberId = req.user._id
        const channelId = req.params.id

        const exists = await Subscription.findOne({subscriber: subscriberId, channel: channelId})
        if (exists) return res.status(400).json({ message: "Already subscribed" });

         const sub = await Subscription.create({ subscriber: subscriberId, channel: channelId });
        res.json(new ApiResponse(200, sub, "Subscribed successfully"));

    } catch (error) {
        console.log(error)
        res.json(new ApiError(500, {}, "Internal Server Error"))
    }
  }

  export const unsubscribe = async (req,res) => { 
    const channelId = req.params.id
    const subscriberId = req.user._id

    const exists = await Subscription.findOne({subscriber: subscriberId, channel: channelId})
    if (!exists) return res.status(400).json({ message: "Not subscribed" });

    await Subscription.deleteOne({subscriber: subscriberId, channel: channelId})
    res.json(new ApiResponse(200, {}, "Unsubscribed successfully"));

   }



export const getUserSubscriptions = async (req,res) => { 
    try {
        const userId = req.user._id
    
        const subscriptions = await Subscription.find({subscriber: userId}).populate("channel")
    
        res.json(new ApiResponse(200, subscriptions, "User subscriptions fetched successfully"))
    } catch (error) {
        console.log(error)
        res.json(new ApiError(500, [], "Internal Server Error"))
    }
 }
