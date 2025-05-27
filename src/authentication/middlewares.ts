import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, AuthenticationTokenPayload } from "./types";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AuthConfig } from "./config";
import { UsersDal } from "../user/dal";
import { auth } from "google-auth-library";



export const injectUserToRequest =
  (tokenSecret: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header("authorization");
    const token = authorization && authorization.split(" ")[1];

    if (!token) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    try {
      const verifiedToken = jwt.verify(token, tokenSecret);
      const userId = (verifiedToken as AuthenticationTokenPayload)._id;
      (req as unknown as AuthenticatedRequest).user = {
        id: userId,
      };
      next();
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED).send(error);
    }
  };

  export const configureGooglePassport = (usersDal: UsersDal, authConfig: AuthConfig) => {
    passport.use(
      new GoogleStrategy(
        {
          clientID: authConfig.googleClientId,
          clientSecret: authConfig.googleClientSecret,
          callbackURL: authConfig.googleCallbackUrl, 
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await usersDal.findByGoogleId(profile.id); 
            if (!user) {
              user = await usersDal.createFromGoogleProfile(profile); 
            }
            done(null, user);
          } catch (err) {
            done(err, undefined);
          }
        }
      )
    );
  
    passport.serializeUser((user: any, done) => {
      done(null, user._id.toString()); 
    });
  
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await usersDal.findById(id); 
        done(null, user);
      } catch (err) {
        done(err, null); 
      }
    });

    console.log("Google strategy configured");
  };
