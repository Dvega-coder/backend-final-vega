
import passport from "passport";
import jwt from "passport-jwt";
import local from "passport-local";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model.js";

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;
const LocalStrategy = local.Strategy;

// ⚠️ VALIDAR JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET no está definido en las variables de entorno");
}

const initializePassport = () => {

  // ===============================
  // LOGIN CON SESSION 
  // ===============================
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email });
          if (!user) return done(null, false);

          const isValid = bcrypt.compareSync(password, user.password);
          if (!isValid) return done(null, false);

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // ===============================
  // JWT (SOLO API) 
  // ===============================
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET, 
      },
      async (jwt_payload, done) => {
        try {
          const user = await UserModel.findById(jwt_payload.id);
          if (!user) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // ===============================
  // SESSION SUPPORT
  // ===============================
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default initializePassport;


