import {createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,updatePlaylist} from "../controllers/playlist.controller.js"
import { login } from "../controllers/user.controller.js"
import { loginMiddleware } from "../middlewares/login.middleware.js"
import express from "express"
const router = express.Router()

router.post("/create-playlist",loginMiddleware,createPlaylist)
router.get("/get-user-playlist",loginMiddleware,getUserPlaylists)
router.get("/get-playlist-byId/:id",loginMiddleware,getPlaylistById)
router.get("/add/:playlistId/:videoId",loginMiddleware,addVideoToPlaylist)
router.get("/remove/:playlistId/:videoId",loginMiddleware,removeVideoFromPlaylist)
router.delete("/delete-playlist/:id",loginMiddleware,deletePlaylist)
router.put("/update-playlist/:id",loginMiddleware,updatePlaylist)



export default router