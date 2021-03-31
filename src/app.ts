import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import userRoute from "./Routes/User.Routes";

const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Ok" });
});

app.use("/api/", userRoute);

// Insert here other API endpoints

// Default response for any other request
app.use(function (req: Request, res: Response) {
  res.status(404);
});

export default app;
