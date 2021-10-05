import express, { NextFunction, Request, Response, Router } from 'express';
import { getAllUsers, addOneUser, updateOneUser, deleteOneUser } from './Users';
// import { getArtistTopTracks, getCurrent, searchArtist } from './Spotify';
import passport from 'passport';
import { googleAuthCallback, youtubeGetAnalytics, youtubeGetChannel, youtubeGetLikedVideos, youtubeGetPlaylists, youtubeGetTopPopularVideosForChannelById } from './Youtube';

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
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
    alert("Login to proceed!")
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
youtubeRouter.get('/auth/youtube', passport.authenticate('google', {
    scope: ['profile', 'https://www.googleapis.com/auth/youtube.readonly']
}));
youtubeRouter.get('/auth/youtube/callback', passport.authenticate('google', {
    failureRedirect: '/'
}), googleAuthCallback);
youtubeRouter.get('/getPlaylists', ensureAuthenticated, youtubeGetPlaylists)
youtubeRouter.get('/getChannels', ensureAuthenticated, youtubeGetChannel)
youtubeRouter.get('/getLikedVideos', ensureAuthenticated, youtubeGetLikedVideos)
youtubeRouter.get('/getAnalytics/:start_date/:end_date', ensureAuthenticated, youtubeGetAnalytics);
youtubeRouter.get('/getPopularVideosByChannelId/:channel_id', ensureAuthenticated, youtubeGetTopPopularVideosForChannelById);

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
// baseRouter.use('/spotify', spotifyRouter)
baseRouter.use('/youtube', youtubeRouter)
export default baseRouter;
