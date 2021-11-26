import { NextFunction, Request, Response, Router } from 'express';
import { getAllUsers, addOneUser, updateOneUser, deleteOneUser } from './Users';
// import { getArtistTopTracks, getCurrent, searchArtist } from './Spotify';
import passport from 'passport';
import { googleAuthCallback, youtubeGetDLURLWrapper, youtubeGetLikedVideosWrapper, youtubeGetPlaylists, youtubeListVideoDLURLs, youtubeGetChannel, youtubeGetTopPopularVideosForChannelById, youtubeGetLikedVideosEjs, youtubeListVideoDLURLSEjs, youtubeGetSubscriptions } from './Youtube';

// User-route
const userRouter = Router();
userRouter.get('/all', getAllUsers);
userRouter.post('/add', addOneUser);
userRouter.put('/update', updateOneUser);
userRouter.delete('/delete/:id', deleteOneUser);


// const scope = [
//     "user-read-currently-playing",
//     "user-read-playback-state",
// ];

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    console.log("check if authed")
    if (req.isAuthenticated()) {
        console.log("authed")
        return next();
    }
    // res.redirect('/login');
    console.log("not authed")
    res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.redirect('/api/youtube/auth/youtube')
}

function auth(req: Request, res: Response, next: NextFunction) {
    res.setHeader('Access-Control-Allow-Origin', 'https://nifty-johnson-900cd2.netlify.app');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return next()
}

// Spotify-route
// const spotifyRouter = Router();
// spotifyRouter.get('/auth/spotify', passport.authenticate('spotify', {
//     scope: scope,
// }));
// spotifyRouter.get(
//     '/auth/spotify/callback',
//     passport.authenticate('spotify', { scope: scope, failureRedirect: '/auth/spotify' }),
//     function (req, res) {
//         console.log("authed")
//         // Successful authentication, redirect home.
//         res.redirect('/');
//     }
// );
// spotifyRouter.get('/current', ensureAuthenticated, getCurrent);
// spotifyRouter.get('/searchArtist/:query', ensureAuthenticated, searchArtist)
// spotifyRouter.get('/getArtistTopTracks/:artist_id', ensureAuthenticated, getArtistTopTracks)


// Youtube-route
const youtubeRouter = Router();
youtubeRouter.get('/auth/youtube', auth, passport.authenticate('google', {
    scope: ['profile', 'https://www.googleapis.com/auth/youtube.readonly']
}));
youtubeRouter.get('/auth/youtube/callback', auth, passport.authenticate('google', {
    failureRedirect: '/',
    session: true
}), googleAuthCallback);
youtubeRouter.get('/getPlaylists', ensureAuthenticated, youtubeGetPlaylists)
youtubeRouter.get('/getChannels', ensureAuthenticated, youtubeGetChannel)
youtubeRouter.get('/getLikedVideos', ensureAuthenticated, youtubeGetLikedVideosWrapper)
youtubeRouter.get('/getLikedVideosEjs', ensureAuthenticated, youtubeGetLikedVideosEjs) // return ejs
youtubeRouter.get('/getURL/:video_id', ensureAuthenticated, youtubeGetDLURLWrapper); // return html
youtubeRouter.get('/listLiked', ensureAuthenticated, youtubeListVideoDLURLs) // return html
youtubeRouter.get('/listLikedEjs', ensureAuthenticated, youtubeListVideoDLURLSEjs) // return ejs
youtubeRouter.get('/getPopularVideosByChannelId/:channel_id', ensureAuthenticated, youtubeGetTopPopularVideosForChannelById);
youtubeRouter.get('/getSubscriptions', ensureAuthenticated, youtubeGetSubscriptions)

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
// baseRouter.use('/spotify', spotifyRouter)
baseRouter.use('/youtube', youtubeRouter)
export default baseRouter;
