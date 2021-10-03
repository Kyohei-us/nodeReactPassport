import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';

import UserDao from '@daos/User/UserDao.mock';
import SpotifyWebApi from 'spotify-web-api-node';
import { SpoUser } from '@server';

const userDao = new UserDao();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;

const CLIENT_ID = process.env.CLIENT_ID || ""
const CLIENT_SECRET = process.env.CLIENT_SECRET || ""
const OAUTH2_CALLBACK_URL = process.env.OAUTH2_CALLBACK_URL || ""

/**
 * Get current song.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function getCurrent(req: Request, res: Response) {
    if (!req.user) return;
    let reqUser = req.user as SpoUser;
    let spotifyApi = new SpotifyWebApi({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: OAUTH2_CALLBACK_URL,
        accessToken: reqUser.accessToken,
        refreshToken: reqUser.refreshToken
    });
    let ret = await spotifyApi.getMyCurrentPlayingTrack();
    if (!(ret.body && ret.body.is_playing)) return;
    if (ret.body.item && ret.body.item.uri && ret.body.item.name) {
        const track = {
            trackURI: ret.body.item.uri,
            trackName: ret.body.item.name,
        };
        return res.status(OK).json({ track });
    }
    return res.status(404).json({ message: "Not Found" })
}

export async function searchArtist(req: Request, res: Response) {
    if (!req.params.query) return;
    if (!req.user) return;
    let reqUser = req.user as SpoUser;
    let spotifyApi = new SpotifyWebApi({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: OAUTH2_CALLBACK_URL,
        accessToken: reqUser.accessToken,
        refreshToken: reqUser.refreshToken
    });
    // Search artists whose name contains 'Love'
    spotifyApi.searchArtists(req.params.query)
        .then(function (data) {
            console.log(`Search artists by ${req.params.query}`);
            return res.status(OK).json({ body: data.body })
        }, function (err) {
            console.error(err);
            return res.status(404).json({ message: "Not Found" })
        });
}