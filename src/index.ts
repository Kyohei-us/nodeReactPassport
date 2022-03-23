import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';

declare module 'express-session' {
    interface SessionData {
        profile_id: string;
        accessToken: string;
        returnTo: string;
    }
}

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
