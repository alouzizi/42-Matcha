import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
// import session from "express-session";
import passport from "passport";
import registrationRouter from "./routes/registration";
import authRouter from "./routes/auth";
import "./database/index";
import Facebook_auth from "./routes/Strategies/facebook";
import Google_auth from "./routes/Strategies/google";
import forty_two_str from "./routes/Strategies/42stra";
import user_information_Router from "./routes/user";
import email_change from "./routes/email_change";
import match from "./routes/matchRoutes";
import discord_auth from "./routes/Strategies/discord";
import interactions from "./routes/interactions";
import chat from "./routes/chat";
const fileUpload = require('express-fileupload');

import { v2 as cloudinary } from 'cloudinary';
import notify from "./routes/notifications";

const app: Application = express();
// https://www.npmjs.com/package/connect-neo4j
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username, process.env.database_password)
);
// const Neo4jStore = require("connect-neo4j")(session);

app.use(fileUpload({limites:{
  fileSize: 10000000 //byte, // Around 10MB
}})); // Use the express-fileupload middleware

driver.verifyConnectivity()
  .then(() => {
    console.log('Successfully connected to Neo4j');
  })
  .catch((error: any) => {
    console.error('Neo4j connection error:', error);
  });


// // IMagekit initialization

// const ImageKit = require("imagekit");
// // ImageKit initialization
// export const imagekitUploader = new ImageKit({
//   publicKey: process.env.imagekit_publicKey,
//   privateKey: process.env.imagekit_privateKey,
//   urlEndpoint: process.env.imagekit_urlEndpoint
// });




cloudinary.config({ 
  cloud_name:process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});




// fix cors issues
const corsOptions = {
  // origin: "http://localhost:7070",
  origin: process.env.front_end_ip,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // allowedHeaders: ["Content-Type"],
  credentials: true,
};
app.use(passport.initialize());
app.use(cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Welcome to Matcha!");
});

// Use body-parser middleware
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", registrationRouter);
app.use("/api", authRouter);
app.use("/api", Facebook_auth);
app.use("/api", Google_auth);
app.use("/api", forty_two_str);
app.use("/api", user_information_Router);
app.use("/api", email_change);
app.use('/', match);
app.use("/", interactions);
app.use("/api", discord_auth);
app.use("/api", chat);
app.use("/api", notify);

export default app;
