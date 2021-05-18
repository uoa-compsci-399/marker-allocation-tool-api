import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import routes_user from './routes/User';
import routes_authn_core from './routes/authn/Authn';
import routes_authn_util from './routes/authn/Util';

const app: Application = express();

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors());

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Ok' });
});

app.use('/api/', routes_user);

app.use('/api/authn/', routes_authn_core);
app.use('/api/authn/', routes_authn_util);

// Insert here other API endpoints

// Default response for any other request
app.use(function (req: Request, res: Response) {
  res.status(404);
});

export default app;
