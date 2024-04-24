import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "no username"],
    minLength: [6, "too short"],
    maxLength: [35, "too long"],
  },
  password: {
    type: String,
    required: [true, "required"],
    minLength: [6, "too short"],
    maxLength: [35, "too long"],
  },
  recipes: [String],
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = mongoose.model("User", userSchema);
