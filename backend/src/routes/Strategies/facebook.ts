import passport from "passport";
import express, { Request, Response } from "express";
const Facebook_auth = express.Router();
const crypto = import("crypto");
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { generateAccessToken, User } from "../auth";
import { create_new_user_cipher } from "./42stra";
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username, process.env.database_password)
);

// ----------------------------------------------------------------------------------
//  FACEBOOK STRATEGY ---------------------------------------------------------------
// ----------------------------------------------------------------------------------

const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      // callbackURL: "http://localhost:3000/api/auth/facebook/callback",
      callbackURL: `${process.env.back_end_ip}/api/auth/facebook/callback`,
      profileFields: ["id", "emails", "name"],
    },

    async function (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: VerifyCallback
    ) {
      // {
      //   id: '1337',
      //   username: undefined,
      //   displayName: undefined,
      //   name: { familyName: 'Tabiti', givenName: 'Anas', middleName: undefined },
      //   gender: undefined,
      //   profileUrl: undefined,
      //   emails: [ { value: 'anastabiti@gmail.com' } ],
      //   provider: 'facebook',
      //   _raw: '{"id":"1337","email":"anastabiti\\u0040gmail.com","last_name":"Tabiti","first_name":"Anas"}',
      //   _json: {
      //     id: '1337',
      //     email: 'anastabiti@gmail.com',
      //     last_name: 'Tabiti',
      //     first_name: 'Anas'
      //   }
      // }  profile

      try {
        console.log(profile, " profile");

        const new_session = await driver.session();
        if (new_session) {
          const email_ = profile?._json.email;

          if (email_) {
            const resu_ = await new_session.run(
                            `
                MATCH (n:User)
                WHERE n.email = $email
                SET n.is_logged = true
                RETURN {
                  username: n.username,
                  email: n.email,
                  first_name: n.first_name,
                  last_name: n.last_name,
                  verified: n.verified,
                  setup_done:n.setup_done
                } AS user`,
              {
                email: email_,
              }
            );
            if (resu_.records?.length > 0) {
             
              //check if user is not verified
              if (resu_.records[0].get("user").verified === false) {
                console.log("email not verified");
                await new_session.close();
                return cb(null, false);
              }

              console.log("user exists", resu_.records[0].get("user"));
              const user_x = resu_.records[0]?.get("user");
              console.log(user_x, " user_x");
              await new_session.close();
              return cb(null, user_x);
            } else {
              console.log("creating user");

              //check if username exists
              const check_username = await new_session.run(
                "MATCH (u:User) WHERE u.username = $username RETURN u",
                { username: profile?.name?.givenName }
              );
              let username_ = null;
              if (check_username.records.length > 0) {
                console.log("username exists -==--=-=-=-");
                username_ = (await crypto).randomBytes(12).toString("hex");
              }

              const result_ = await new_session.run(
                create_new_user_cipher
      //           `CREATE (n:User {
      //             username: $username,
      //             email: $email,
      //             password: $password,
      //             first_name: $first_name,
      //             last_name: $last_name,
      //             verfication_token: $verfication_token,
      //             verified: $verified,
      //             password_reset_token: $password_reset_token,
      //             gender: "",
      //             biography: "",
      //             setup_done:false
      //           }) RETURN {
      // username: n.username,
      // email: n.email,
      // first_name: n.first_name,
      // last_name: n.last_name,
      // verified: n.verified,
      // setup_done:n.setup_done
      //   } as user`
         ,
                {
                  username: username_ || profile?.name?.givenName,
                  // username: profile?.name?.givenName,
                  email: email_,
                  password: (await crypto).randomBytes(25).toString("hex"),
                  first_name: profile?.name?.givenName || "",
                  last_name: profile?.name?.familyName || "",
                  verfication_token: "",
                  verified: true,
                  password_reset_token: "",
                }
              );
              const new_user = result_.records[0]?.get("user");
              await new_session.close();
              return cb(null, new_user);
            }
          }
        }
      } catch (error) {
        console.log("error ", error);
        return cb(error, false);
      }
    }
  )
);

Facebook_auth.get(
  "/auth/facebook",
  passport.authenticate("facebook", { session: false }),
  async function (req: Request, res: Response) {
    // console.log("auth/facebook");
  }
);

Facebook_auth.get(
  "/auth/facebook/callback",
  async function (req: any, res: Response) {
    passport.authenticate(
      "facebook",
      { session: false },
      async function (err: any, user: User, info: any) {
        if (err) {
          return res
            .status(401)
            .json({ "Wrong credentials": "Error during authentication" });
        }

        if (!user) {
          console.error("No user found:", info);
          return res.status(401).json("No user found");
        }

        try {
          // req.session.user = {
          //   username: user.username,
          //   email: user.email,
          //   setup_done: user.setup_done,
          // };
          // // console.log(req.session.user, " session user");
          // await req.session.save();

          const token = await generateAccessToken(user);
          if (!token) {
            console.error("Failed to generate authentication token");
            return res.status(401).json({ error: "Authentication failed" });
          }
          console.log(token, " [-JWT TOKEN-]");

          res.cookie("jwt_token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 3600000, // 1 hour in milliseconds
          });

          console.log(user, "  ------------------------------facebook");
          if (user.setup_done == true) {
            return res.status(200).redirect(`${process.env.front_end_ip}/discover`);
          } else {
            return res.status(200).redirect(`${process.env.front_end_ip}/setup`);
          }
        } catch (tokenError) {
          return res.status(400).json("Error generating token");
        }
      }
    )(req, res);
  }
);

export default Facebook_auth;
