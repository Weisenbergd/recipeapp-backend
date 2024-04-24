import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: [
    {
      _id: false,
      ingredient: String,
      amount: String,
    },
  ],
  time: Number,
  directions: [String],
  dietaryTags: [String],
  summary: String,
  userId: String,
  imageURL: String,
});

export const Recipe = mongoose.model("Recipe", recipeSchema);
