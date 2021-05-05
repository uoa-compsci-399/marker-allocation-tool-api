import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import userRoute from './routes/User';
import authnRoute from './routes/authn/Authn';
import cors from 'cors';

const app: Application = express();

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Ok' });
});

app.use('/api/', userRoute);

app.use('/api/authn/', authnRoute);

// Insert here other API endpoints

// Default response for any other request
app.use(function (req: Request, res: Response) {
  res.status(404);
});

export default app;
