import { YTUser } from "@server";
import axios, { AxiosRequestConfig } from "axios";
import { Request, Response } from "express";
import youtubedl, { YtResponse } from "youtube-dl-exec"

/**
 * Reference https://developers.google.com/youtube/v3/docs
 * 
 * @param req 
 * @param res 
 */
export async function googleAuthCallback(req: Request, res: Response) {
    console.log("googleAuthCallback is called")
    console.log(req.params.code);
    res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.redirect(req.session.returnTo || '/');
    req.session.returnTo = undefined;
    // res.redirect('/')
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
        res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
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
        res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).json(ret.data)
    }
}

/**
 * Get my liked videos.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
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

/**
 * Get my liked videos and return as express response.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function youtubeGetLikedVideosWrapper(req: Request, res: Response) {
    console.log("get liked videos wrapper begin...")
    let ret = await youtubeGetLikedVideos(req, res);
    if (ret) {
        res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).json(ret.data)
    }
    return res.status(404).json({ message: "Not Found" })
}

/**
 * 
 * @param req 
 * @param res 
 */
export async function youtubeGetLikedVideosEjs(req: Request, res: Response) {
    let ret = await youtubeGetLikedVideos(req, res);
    if (ret) {
        return res.render('getLikedVideos', { "likedVideos": ret.data.items });
    }
}

/**
 * Return video download links as html.
 * 
 * @param req 
 * @param res 
 */
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
        let atag = `<a href="${element}">DL</a><br />`
        html += atag;
    }
    html += `</body></html>`;
    res.send(html);
}

export async function youtubeListVideoDLURLSEjs(req: Request, res: Response) {
    const myLikedVideos = await youtubeGetLikedVideos(req, res);
    console.log(myLikedVideos.data)
    let videoDLURLList: any[] = []
    for (let i = 0; i < myLikedVideos.data.items.length; i++) {
        const element = myLikedVideos.data.items[i];
        let output = await youtubeGetDLURL(`${element.id}`);
        if (typeof output === 'string') {
            let url: string = output.split('\n')[0]
            if (!url) {
                res.redirect('/')
            }
            let videoDLURLListItem = {
                url: url,
                likedVideoElement: element,
            }
            videoDLURLList.push(videoDLURLListItem);
        } else {
            res.redirect('/')
        }
    }
    res.render("listLikedVideosURL", { likedVideosDLURLList: videoDLURLList })
}

/**
 * Get video download url by video id.
 * 
 * @param youtubeVideoId 
 * @returns 
 */
async function youtubeGetDLURL(youtubeVideoId: string) {
    const output: any = await youtubedl(`https://youtu.be/${youtubeVideoId}`, {
        format: "best",
        getUrl: true,
    })
    console.log(output)
    return output;
}

/**
 * Get video download url, and return as html.
 * 
 * @param req 
 * @param res 
 */
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

/**
 * Get Popular videos for channal by channel id.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
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
        res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).json(ret.data)
    }
}

/**
 * Get subscriptions of the authenticated user
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function youtubeGetSubscriptions(req: Request, res: Response) {
    let reqUser = req.user as YTUser;
    let accessToken = reqUser.accessToken;
    let part = req.query.part ? req.query.part : "snippet"
    let url = `https://youtube.googleapis.com/youtube/v3/subscriptions?part=${part}&mine=true`
    let ret = await axios.get(
        url,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
    if (ret) {
        res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).json(ret.data)
    }
}