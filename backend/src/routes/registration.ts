import express, { Request, Response } from "express";
const crypto = import("crypto");
import argon2 from "argon2";
import nodemailer from "nodemailer";
import { driver } from "../database";
import {
  validateAge,
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
} from "../validators/validate";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.google_mail,
    pass: process.env.google_app_password,
  },
});
const registrationRouter = express.Router();

/**************************************************************************************************************
 * Register a new user by requesting the following fields:
 * - email
 * - password
 * - username
 * - first_name
 * - last_name
 * - age
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
registrationRouter.post(
  "/registration",
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validateAge,
  async (req: Request, res: Response) => {
    try {
      const user = req.body;
      const session = await driver.session();

      if (session && user) {
        // First check if email exists
        const _check_email_ = await session.run("MATCH (u:User) WHERE u.email = $email RETURN u", {
          email: user.email,
          username: user.username,
        });

        const check_username = await session.run(
          "MATCH (u:User) WHERE u.username = $username RETURN u",
          { username: user.username }
        );

        if (_check_email_.records.length > 0) {
          res.status(400).json("Email already exists");
          return;
        } else if (check_username.records.length > 0) {
          res.status(400).json("Username already exists");
          return;
        } else {
          //create a new user
          const plain_pass = req.body.password;
          const hashedPassword = await argon2.hash(plain_pass);
          const db_user = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            verfication_token: "",
            verified: false,
            password_reset_token: "",
            gender: "",
            biography: "",
            setup_done: false,
            age: req.body.age,
          };
          db_user.verfication_token = (await crypto).randomBytes(20).toString("hex"); //ex: 32341856423cfac6eda221a5e3b3c9861ce96da9 length is 40 characters (20 bytes × 2)
          await session.run(
            `CREATE (a:User {
          username: $username, email: $email, password: $password,
          first_name: $first_name,
          last_name: $last_name, verified: false ,
          verfication_token:$verfication_token, setup_done:$setup_done,
          gender:"",
          pics: ["", "", "", "", ""],
          fame_rating:0, is_logged: false
          ,
          country: "", notifications:[],
          city: "",
          country_WTK: "",
          city_WTK: "",
          location: null ,
          location_WTK: null ,
          age:toInteger($age),
          password_reset_token:$password_reset_token
            })
    RETURN a`,
            db_user
          );

          const mailOptions = {
            from: "anastabiti@gmail.com",
            to: db_user.email,
            subject: "Verify Your Email  💖",
            text: `Hi ${db_user.username},
            
            Welcome to Matcha, where sparks fly and hearts connect! 🎉
            
            Before you get started, please verify your email address to activate your account. Click the link below to complete the process:
            
            🔗 Verify Your Email: ${process.env.back_end_ip}/api/verify-email?token=${db_user.verfication_token}
            
            If you didn’t create an account on Matcha, you can safely ignore this email.
            
            Let the love adventure begin! ❤️
            
            Best regards,  
            The Matcha Team`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
              //try agin after 5 seconds
              setTimeout(() => {
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.error("Error sending email: ", error);
                  } else {
                    res.status(200).json("User created successfully");
                    return;
                  }
                });
              }, 5000);
            } else {
              res.status(200).json("User created successfully");
              return;
            }
          });

          await session.close();
          res.status(200).json("User created successfully");
          return;
        }
      } else {
        await session.close();
        res.status(400).json("Error occured");
        return;
      }
    } catch {
      res.status(400).json("Error occured");
      return;
    }
  }
);

/**************************************************************************************************************
 * Verify email route
 * by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
// Verify email route
registrationRouter.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    if (token) {
      const session = driver.session();

      if (!session) {
        res.status(400).json("Error occured");
        return;
      }
      const updates = await session.run(
        `
          MATCH (a:User {verfication_token: $token})
          WHERE a.verified = false
          SET a.verfication_token = ""
          SET a.verified = true
          RETURN a.verfication_token , a.verified, a.email, a.username, a.first_name, a.last_name
          `,
        { token }
      );

      if (updates.records.length > 0) {
        const updatedUser = updates.records[0];

        // res.status(200).json("Hello! Welcome to Matcha. Email verified successfully!");
        await session.close();
        res.status(200).redirect(`${process.env.front_end_ip}/login?VERFIED=WELCOME_TO_MATCHA`);

        return;
      } else {
        await session.close();
        res.status(400).json("Invalid or expired token");
        return;
      }
    } else {
      res.status(400).json("Error occured");
      return;
    }
  } catch {
    res.status(400).json("Error occured");
    return;
  }
});

export default registrationRouter;
