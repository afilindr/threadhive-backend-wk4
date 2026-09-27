import Thread from "../models/Thread.js";
import User from "../models/User.js";
import Subreddit from "../models/Subreddit.js";
import { createAppError } from "../utils/createAppError.js";

export const fetchAllThreads = async () => {
  const threads = await Thread.find()
    .populate({ path: "author", model: User })
    .populate({ path: "subreddit", model: Subreddit })
    .sort({ createdAt: -1 });

  // Add error handling for no threads found
  if (!threads || threads.length === 0) {
    throw createAppError("No threads found", 404);
  }

  return threads;
};

export const fetchThreadById = async (id) => {
  const thread = await Thread.findById(id)
    .populate({ path: "author" })
    .populate({ path: "subreddit" });

  // Add error handling for thread not found
  if (!thread) {
    throw createAppError("Thread not found", 404);
  }

  return thread;
};

export const createNewThread = async (title, content, author, subreddit) => {
  const newThread = new Thread({ title, content, author, subreddit });
  await newThread.save();

  const populatedThread = await Thread.findById(newThread._id)
    .populate({ path: "subreddit", select: "name description" })
    .populate({ path: "author", select: "name" });

  // Add error handling for thread creation failure
  if (!populatedThread) {
    throw createAppError("Failed to create thread", 500);
  }

  return populatedThread;
};

export const updateThreadById = async (id, updateData) => {
  const updatedThread = await Thread.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  // Add error handling for thread not found or update failure
  if (!updatedThread) {
    throw createAppError("Thread not found or update failed", 404);
  }

  return updatedThread;
};

export const deleteThreadById = async (id) => {
  const deletedThread = await Thread.findByIdAndDelete(id);

  // Add error handling for thread not found or deletion failure
  if (!deletedThread) {
    throw createAppError("Thread not found or deletion failed", 404);
  } 

  return deletedThread;
};
