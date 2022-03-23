import { NextFunction, Request, Response, Router } from 'express';
// import { getArtistTopTracks, getCurrent, searchArtist } from './Spotify';
import passport from 'passport';
import { googleAuthCallback, youtubeGetDLURLWrapper, youtubeGetLikedVideosWrapper, youtubeGetPlaylists, youtubeListVideoDLURLs, youtubeGetChannel, youtubeGetTopPopularVideosForChannelById, youtubeGetLikedVideosEjs, youtubeListVideoDLURLSEjs, youtubeGetSubscriptions } from './Youtube';
import path from 'path';


function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    console.log("check if authed")
    if (req.session.accessToken || req.session.profile_id) {
        console.log("session got you!")
    }
    if (req.isAuthenticated()) {
        console.log("authed")
        req.session.returnTo = req.protocol + '://' + req.get('host') + req.originalUrl;
        return next();
    }
    console.log("not authed")
    req.session.returnTo = req.protocol + '://' + req.get('host') + req.originalUrl;
    // return login.html if not logged in
    res.sendFile('login.html', { root: path.join(__dirname, 'views') })
}


// Youtube-route
const youtubeRouter = Router();
youtubeRouter.get('/auth/youtube', (req, res) => {
    req.session.returnTo = req.protocol + '://' + req.get('host') + req.originalUrl
}, passport.authenticate('google', {
    scope: ['profile', 'https://www.googleapis.com/auth/youtube.readonly']
}));
youtubeRouter.get('/auth/youtube/callback', passport.authenticate('google', {
    failureRedirect: '/'
}), googleAuthCallback);
youtubeRouter.get('/myplaylists', ensureAuthenticated, youtubeGetPlaylists)
youtubeRouter.get('/channels', ensureAuthenticated, youtubeGetChannel)
youtubeRouter.get('/likedVideos', ensureAuthenticated, youtubeGetLikedVideosWrapper)
youtubeRouter.get('/likedVideosEjs', ensureAuthenticated, youtubeGetLikedVideosEjs) // return ejs
youtubeRouter.get('/URL/:video_id', ensureAuthenticated, youtubeGetDLURLWrapper); // return html
youtubeRouter.get('/listLiked', ensureAuthenticated, youtubeListVideoDLURLs) // return html
youtubeRouter.get('/listLikedEjs', ensureAuthenticated, youtubeListVideoDLURLSEjs) // return ejs
youtubeRouter.get('/popularVideosByChannelId/:channel_id', ensureAuthenticated, youtubeGetTopPopularVideosForChannelById);
youtubeRouter.get('/subscriptions', ensureAuthenticated, youtubeGetSubscriptions)

// Export the base-router
const baseRouter = Router();
// baseRouter.use('/spotify', spotifyRouter)
baseRouter.use('/youtube', youtubeRouter)
export default baseRouter;
