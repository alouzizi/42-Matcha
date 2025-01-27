import express, { Request, Response } from "express";
import { env } from "process";
const { body, validationResult } = require("express-validator");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const forty_two_str = express.Router();
const crypto = import("crypto");
import nodemailer from "nodemailer";
import { auth } from "neo4j-driver-core";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { generateAccessToken, User } from "../auth";
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username, process.env.database_password)
);

const passport = require("passport");

// ----------------------------------------------------------------------------------
//  intra42 STRATEGY ---------------------------------------------------------------
// ----------------------------------------------------------------------------------

const FortyTwoStrategy = require("passport-42").Strategy;
passport.use(
  new FortyTwoStrategy(
    {
      clientID: process.env.FORTYTWO_APP_ID,
      clientSecret: process.env.FORTYTWO_APP_SECRET,
      callbackURL: "http://localhost:3000/api/auth/intra42/callback",
    },

    async function (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: VerifyCallback
    ) {
      try {
        //   id: '90435',
        // username: 'atabiti',
        // displayName: 'Anas Tabiti',
        // name: { familyName: 'Tabiti', givenName: 'Anas' },
        // profileUrl: 'https://api.intra.42.fr/v2/users/atabiti',
        // emails: [ { value: 'atabiti@student.1337.ma' } ],
        // phoneNumbers: [ { value: 'hidden' } ],
        // photos: [ { value: undefined } ],
        // provider: '42',
        // console.log(profile.emails?.[0]?.value, " profile._json.email");
        // console.log(profile?.name?.familyName, " familyname");
        // console.log(profile?.name?.givenName, " givenName");
        // console.log(profile.username, " username");
        // console.log("----------------------------------------------");
        // console.log(profile);
        // console.log("----------------------------------------------");

        const new_session = await driver.session();
        if (new_session) {
          const email_ = profile.emails?.[0]?.value || profile._json?.email;

          if (email_) {
            const resu_ = await new_session.run(
              `MATCH (n:User) WHERE n.email = $email
      RETURN {
      username: n.username,
      email: n.email,
      first_name: n.first_name,
      last_name: n.last_name,
      verified: n.verified,
      setup_done:n.setup_done
        } as user`,
              {
                email: email_,
              }
            );
            if (resu_.records?.length > 0) {
              //check if user is not
              console.log(
                resu_.records[0].get("user").verified,
                " -------------------------->"
              );
              //check if user is not verified
              if (resu_.records[0].get("user").verified === false) {
                // console.log("email not verified");
                await new_session.close();
                return cb(null, false);
              }

              // console.log("user exists", resu_.records[0].get("user"));
              const user_x = resu_.records[0]?.get("user");
              // console.log(user_x, " user_x");
              await new_session.close();

              return cb(null, user_x);
            } else {
              console.log("creating user");
              const result_ = await new_session.run(
                `CREATE (n:User {
              username: $username,
              email: $email,
              password: $password,
              first_name: $first_name,
              last_name: $last_name,
              verfication_token: $verfication_token,
              verified: $verified,
              password_reset_token: $password_reset_token,
              gender: "",
              biography: "",
              setup_done:false
            }) 
              RETURN {
      username: n.username,
      email: n.email,
      first_name: n.first_name,
      last_name: n.last_name,
      verified: n.verified,
      setup_done:n.setup_done
        } as user`,
                {
                  username: profile.username,
                  email: email_,
                  password: (await crypto).randomBytes(25).toString("hex"),
                  first_name: profile?.name?.givenName || "",
                  last_name: profile?.name?.familyName || "",
                  verfication_token: "",
                  verified: true,
                  password_reset_token: "",
                }
              );
              // console.log("user does not exist");
              const new_user = result_ .records[0]?.get("user");
              await new_session.close();
              return cb(null, new_user);
            }
          }
        }
      } catch (error) {
        // console.log("error ", error);
        return cb(error, false);
      }
    }
  )
);

forty_two_str.get("/auth/intra42", passport.authenticate("42"));

forty_two_str.get("/auth/intra42/callback", function (req: any, res: Response) {
  passport.authenticate(
    "42",
    // { session: false },
    async function (err: any, user: User, info: any) {
      try {
        if (err) {
          console.error("Error during authentication:");
          return res
            .status(401)
            .json({ "Wrong credentials": "Error during authentication" });
        }

        if (!user) {
          console.error("No user found:", info);
          return res.status(401).json("No user found");
        }

        // console.log(user, " done");
        // console.log(
        //   " done--------------------------------------------------------\
        //   --------------------------------"
        // );

        console.log(" user ------------- ", user);

        req.session.user = {
          username: user.username,
          email: user.email,
          setup_done: user.setup_done,
        };
        await req.session.save();
        if (!req.session.user) {
          console.error("Session not saved properly");
          return res.status(402).json("Session error");
        }

        if (user.setup_done == true) {
          return res.status(200).redirect("http://localhost:7070/home");
        } else {
          return res.status(200).redirect("http://localhost:7070/setup");
        }
        // res.status(200).json("login successful");
      } catch (tokenError) {
        console.error("Error generating token:", tokenError);
        return res.status(400).json("Error generating token");
      }
    }
  )(req, res);
});
export default forty_two_str;
// atabiti_a
//sjnj^*7t87t877dsKK
