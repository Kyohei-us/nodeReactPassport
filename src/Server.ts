import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
import passport from 'passport';
import session from "express-session"
import { Schema, model, connect, Error } from 'mongoose';
import { Strategy } from 'passport-spotify';
const SpotifyStrategy = Strategy;
import { Strategy as GStrategy } from 'passport-google-oauth20';
const GoogleStrategy = GStrategy;
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID ? process.env.CLIENT_ID : "";
const CLIENT_SECRET = process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : "";
const OAUTH2_CALLBACK_URL = process.env.OAUTH2_CALLBACK_URL ? process.env.OAUTH2_CALLBACK_URL : "";
const MONGODB_CONNECT_STRING = process.env.MONGODB_CONNECT_STRING || "";

const YT_CLIENT_ID = process.env.YT_CLIENT_ID || "";
const YT_CLIENT_SECRET = process.env.YT_CLIENT_SECRET || ""
const YT_REDIRECT_URL = process.env.YT_REDIRECT_URL || ""

const app = express();
const { BAD_REQUEST } = StatusCodes;



/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

export type YTUser = { profile_id: string; accessToken: string; refreshToken: string; };

const schema = new Schema<YTUser>({
    profile_id: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String }
})

const YTUserModel = model<YTUser>('YTUser', schema);

passport.use(new GoogleStrategy({
    clientID: YT_CLIENT_ID,
    clientSecret: YT_CLIENT_SECRET,
    callbackURL: YT_REDIRECT_URL
},
    async function (accessToken: string, refreshToken: string, profile: any, cb: Function) {
        console.log("authing")
        try {
            await connect(MONGODB_CONNECT_STRING);
        } catch (error) {
            console.log(error)
        }

        console.log("Connected to MongoDB!")
        console.log(profile)
        let result = await YTUserModel.findOne({ profile_id: profile.id }).exec()
        console.log(`Find one user by profile_id result: ${result}`)
        if (!result) {
            console.log("New Spotify User appears. Adding to Database.")
            const doc = new YTUserModel({
                profile_id: profile.id,
                accessToken,
                refreshToken,
            });
            let YTUser: YTUser = {
                profile_id: profile.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
            }
            await doc.save();
            console.log(YTUser)
            cb(null, YTUser)
        } else {
            let spoUser: YTUser = { profile_id: result.profile_id, accessToken: result.accessToken, refreshToken: result.refreshToken }
            if (accessToken !== spoUser.accessToken) {
                console.log("Updated access token and refresh token!")
                spoUser.accessToken = accessToken;
                spoUser.refreshToken = refreshToken;
                const updatedResult = await YTUserModel.updateOne({ profile_id: spoUser.profile_id }, { accessToken: spoUser.accessToken, refreshToken: spoUser.refreshToken })
            }
            console.log(`Following SpoUser object is returned: ${spoUser}`)
            cb(null, spoUser)
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user: Express.User, done) {
    done(null, user);
});

app.use(
    session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.err(err, true);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});



/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.get('*', (req: Request, res: Response) => {
    res.sendFile('index.html', { root: viewsDir });
});

// Export express instance
export default app;
