import express, { urlencoded } from "express"
import connectDb from "./database/connectDb.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import { connect } from "mongoose";
import videoRoutes from "./routes/video.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import likeRoutes from "./routes/like.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
   methods: ["GET","POST","DELETE","PUT","OPTIONS"]    
}));
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));



app.use("/api", userRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/tweet", tweetRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/playlist", playlistRoutes);



connectDb()

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
