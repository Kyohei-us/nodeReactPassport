import { YTUser } from "@server";
import axios, { AxiosRequestConfig } from "axios";
import { Request, Response } from "express";
import youtubedl, { YtResponse } from "youtube-dl-exec"

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

async function youtubeGetLikedVideos(req: Request, res: Response) {
    let reqUser = req.user as YTUser;
    let accessToken = reqUser.accessToken;
    let part = "contentDetails"
    let playlistURL = `https://www.googleapis.com/youtube/v3/videos?part=${part}&part=snippet&myRating=like`;
    let config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${accessToken}` }
    }
    let ret = await axios.get(
        playlistURL,
        config
    );
    return ret;
}

export async function youtubeGetLikedVideosWrapper(req: Request, res: Response) {
    let ret = await youtubeGetLikedVideos(req, res);
    if (ret) {
        return res.status(200).json(ret.data)
    }
}

export async function youtubeListVideoDLURLs(req: Request, res: Response) {
    const myLikedVideos = await youtubeGetLikedVideos(req, res);
    console.log(myLikedVideos.data)
    let videoDLURLList: string[] = []
    for (let i = 0; i < myLikedVideos.data.items.length; i++) {
        const element = myLikedVideos.data.items[i];
        let output = await youtubeGetDLURL(`${element.id}`);
        if (typeof output === 'string') {
            let url: string = output.split('\n')[0]
            if (!url) {
                res.redirect('/')
            }
            videoDLURLList.push(url);
        } else {
            res.redirect('/')
        }
    }
    let html = `<html><body>`
    for (let i = 0; i < videoDLURLList.length; i++) {
        const element = videoDLURLList[i];
        let atag = `<a href="${element}">DL</a>`
        html += atag;
    }
    html += `</body></html>`;
    res.send(html);
    res.redirect('/')
}

async function youtubeGetDLURL(youtubeVideoId: string) {
    const output: any = await youtubedl(`https://youtu.be/${youtubeVideoId}`, {
        format: "best",
        getUrl: true,
    })
    console.log(output)
    return output;
}

export async function youtubeGetDLURLWrapper(req: Request, res: Response) {
    let youtubeVideoId = req.params.video_id as string ? req.params.video_id as string : "";
    if (!youtubeVideoId) {
        res.redirect('/')
    } else {
        console.log(youtubeVideoId)
        let output = await youtubeGetDLURL(youtubeVideoId);

        if (typeof output === 'string') {
            let url: string = output.split('\n')[0]
            if (!url) {
                res.redirect('/')
            }
            res.send(`<html><body><a href="${url}">DL</a></body></html>`);
        } else {
            res.redirect('/')
        }
    }
}