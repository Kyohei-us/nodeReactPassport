import { YTUser } from "@server";
import axios from "axios";
import { Request, Response } from "express";

export async function googleAuthCallback(req: Request, res: Response) {
    console.log(req.params.code);
    res.redirect('/')
}

export async function youtubeGetPlaylists(req: Request, res: Response) {
    let reqUser = req.user as YTUser;
    let accessToken = reqUser.accessToken;
    let part = "contentDetails"
    let playlistURL = `https://www.googleapis.com/youtube/v3/playlists?part=${part}&mine=true`;
    let ret = await axios.get(
        playlistURL,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
    if (ret) {
        console.log(ret)
        return res.status(200).json({ message: "ok" })
    }
}