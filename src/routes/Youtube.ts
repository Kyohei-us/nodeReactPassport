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
        return res.status(200).json(ret.data)
    }
}


export async function youtubeGetChannel(req: Request, res: Response) {
    let reqUser = req.user as YTUser;
    let accessToken = reqUser.accessToken;
    let part = "contentDetails"
    let playlistURL = `https://www.googleapis.com/youtube/v3/channels?part=${part}&mine=true`;
    let ret = await axios.get(
        playlistURL,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
    if (ret) {
        return res.status(200).json(ret.data)
    }
}

export async function youtubeGetLikedVideos(req: Request, res: Response) {
    let reqUser = req.user as YTUser;
    let accessToken = reqUser.accessToken;
    let part = "contentDetails"
    let playlistURL = `https://www.googleapis.com/youtube/v3/videos?part=${part}&part=snippet&myRating=like`;
    let ret = await axios.get(
        playlistURL,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
    if (ret) {
        return res.status(200).json(ret.data)
    }
}

export async function youtubeGetTopPopularVideosForChannelById(req: Request, res: Response) {
    let reqUser = req.user as YTUser;
    let accessToken = reqUser.accessToken;
    let channelId = req.params.channel_id;
    let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=25&order=viewCount`;
    let ret = await axios.get(
        url,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
    if (ret) {
        return res.status(200).json(ret.data)
    }
}

/**
 * Get youtube analytics.
 * 
 * start_date and end_date query is required
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function youtubeGetAnalytics(req: Request, res: Response) {
    let reqUser = req.user as YTUser;
    let accessToken = reqUser.accessToken;
    let startDate = req.params.start_date;
    let endDate = req.params.end_date;
    console.log(startDate, endDate)
    if(!startDate || !endDate) return res.status(404).json({ message: "Not Found" });
    let channel_id = req.query.channel_id as string ? req.query.channel_id as string: "";
    let ids = channel_id ? `channel==${channel_id}` : `channel==MINE`
    let metrics= `views,comments,likes,dislikes,estimatedMinutesWatched,averageViewDuration`
    let playlistURL = `https://youtubeanalytics.googleapis.com/v2/reports?startDate=${startDate}&endDate=${endDate}&ids=${ids}&metrics=${metrics}`;
    let ret = await axios.get(
        playlistURL,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
    if (ret) {
        return res.status(200).json(ret.data)
    }
}