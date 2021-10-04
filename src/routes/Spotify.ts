import StatusCodes from 'http-status-codes';
import { Request, Response } from 'express';

import SpotifyWebApi from 'spotify-web-api-node';
import { SpoUser } from '@server';

const { OK } = StatusCodes;

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

/**
 * Search artist by artist name.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
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

/**
 * Get artist by artist_id.
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export async function getArtistTopTracks(req: Request, res: Response) {
    if (!req.params.artist_id) return;
    if (!req.user) return;
    let reqUser = req.user as SpoUser;
    let spotifyApi = new SpotifyWebApi({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: OAUTH2_CALLBACK_URL,
        accessToken: reqUser.accessToken,
        refreshToken: reqUser.refreshToken
    });
    let artistId = req.params.artist_id;
    let country = req.query.country as string ? req.query.country as string : "JP";
    // Get artist's top tracks.
    spotifyApi.getArtistTopTracks(artistId, country)
        .then(function (data) {
            console.log(`Got artist's top tracks by ${artistId}`);
            return res.status(OK).json({ body: data.body })
        }, function (err) {
            console.log('Something went wrong!', err);
            return res.status(404).json({ message: "Not Found" })
        });
}