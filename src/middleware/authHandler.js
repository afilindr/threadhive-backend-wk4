import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
import User from "../models/User.js";
import { createAppError } from "../utils/createAppError.js";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw createAppError("JWT_SECRET is not configured.", 500);
  }

  return process.env.JWT_SECRET;
};

const authHandler = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw createAppError("Authentication required.", 401);
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      throw createAppError("Authentication required.", 401);
    }

    let payload;

    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch (error) {
      if (error.statusCode === 500) {
        throw error;
      }

      throw createAppError("Invalid or expired token.", 401);
    }

    if (
      typeof payload !== "object" ||
      typeof payload.userId !== "string" ||
      !mongoose.isValidObjectId(payload.userId)
    ) {
      throw createAppError("Invalid or expired token.", 401);
    }

    const user = await User.findById(payload.userId).select("_id");

    if (!user) {
      throw createAppError("Invalid or expired token.", 401);
    }

    req.user = { userId: user._id.toString() };
    next();
  } catch (error) {
    next(error);
  }
};

export default authHandler;
