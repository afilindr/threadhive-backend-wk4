import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { createAppError } from "../utils/createAppError.js";

dotenv.config();

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw createAppError("JWT_SECRET is not configured.", 500);
  }

  return process.env.JWT_SECRET;
};

const toSafeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

const createToken = (user) =>
  jwt.sign({ userId: user._id.toString() }, getJwtSecret(), {
    expiresIn: "7d",
  });

export const registerUser = async ({ name, email, password } = {}) => {
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    throw createAppError("Name, email, and password are required.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createAppError("An account with that email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return {
      token: createToken(user),
      user: toSafeUser(user),
    };
  } catch (error) {
    if (error.code === 11000) {
      throw createAppError("An account with that email already exists.", 409);
    }

    throw error;
  }
};

export const loginUser = async ({ email, password } = {}) => {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    throw createAppError("Invalid email or password.", 401);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !passwordMatches) {
    throw createAppError("Invalid email or password.", 401);
  }

  return {
    token: createToken(user),
    user: toSafeUser(user),
  };
};
