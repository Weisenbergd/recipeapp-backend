// import { recipes, users } from "./_data.js";
import { aggregateRecipes } from "./recipeQueries.js";
import { Recipe } from "./db/recipeSchema.js";
import { User } from "./db/userSchema.js";
import { Tinput, Trecipe } from "./types.js";
import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";
import { S3Delete, S3URL } from "./s3.js";

interface Context {
  token?: string | null;
  user?: {
    username: string;
    admin: boolean;
  } | null;
}

export const resolvers = {
  Query: {
    getSingleRecipe: async (_: null, { recipeId }: { recipeId: string }) => {
      const test = await Recipe.findOne({ _id: recipeId });
      try {
        return test;
      } catch (err) {
        console.log(err);
      }
    },
    getFiltered: async (
      _: null,
      {
        ingredientList,
        offset,
        limit,
      }: { ingredientList: string[]; offset: number; limit: number }
    ) => {
      const test = await aggregateRecipes(ingredientList, offset, limit);
      return test;
    },
    getUsers: async () => await User.find(),
    getUser: async (_: null, { id }: { id: string }) => {
      return await User.findOne({ id });
    },
    getS3URL: async (_: any, { folder }: { folder: string }) => {
      try {
        const test = await S3URL(folder);
        return { S3URL: test };
      } catch (err) {
        console.log("err", err);
      }
    },
  },

  Mutation: {
    createRecipe: async (_: null, { input }: { input: Tinput }) => {
      try {
        const recipe = new Recipe({
          name: input.name,
          summary: input.summary,
          ingredients: input.ingredients,
          time: input.time,
          directions: input.directions,
          dietaryTags: input.dietaryTags,
          userId: input.userId,
          imageURL: input.imageURL,
        });
        return await recipe.save();
      } catch (err) {
        console.log(err);
      }
    },
    deleteRecipe: async (
      _: null,
      { id, userId }: { id: ObjectId; userId: ObjectId },
      context: Context
    ) => {
      if (!context.token) throw Error("must log in to perform action");
      const recipe = await Recipe.findById(id);
      if (!recipe) throw new Error("Recipe not found");

      if (recipe?.userId != jwt.verify(context.token, process.env.SECRET!)) {
        throw Error("user does not have permission to perform action");
      }
      try {
        // Delete image from S3 if it exists
        if (recipe.imageURL) {
          const imageKey = recipe.imageURL.split(".com/")[1]; // Extract the image key from the S3 URL
          await S3Delete(imageKey);
        }

        // Delete the recipe from the database
        await recipe.deleteOne();
        return id;
      } catch (error) {
        console.error("Error deleting recipe:", error);
        throw new Error("Failed to delete recipe");
      }
    },

    // !important -- fix ts error for subdocuments (recipe.ingredients)
    // using any temporary
    mutateRecipe: async (
      _: null,
      { input }: { input: any },
      context: Context
    ) => {
      const recipe = await Recipe.findById(input._id);

      if (!context.token) throw Error("must log in to perform action");
      if (recipe?.userId != jwt.verify(context.token, process.env.SECRET!)) {
        throw Error("user does not have permission to perform action");
      }

      // console.log(recipe);
      // console.log(input);
      // throw Error("dumb");

      if (recipe)
        try {
          recipe.name = input.name;
          recipe.summary = input.summary;
          recipe.ingredients = input.ingredients;
          recipe.time = input.time;
          recipe.directions = input.directions;
          recipe.dietaryTags = input.dietaryTags;
          // recipe.imageURL = input.imageURL;
          return await recipe.save();
        } catch (err) {
          console.log(err);
        }
      else throw Error(`recipe with id ${input._id} does not exist`);
    },
    // mutateRecipe({ id, name, ingredients }),

    autoLogin: async (_: null, { token }: { token: string }) => {
      const split = token.split(" ")[1];
      const _id = jwt.verify(split, process.env.SECRET!);
      const user = await User.findById(_id);
      if (!user) {
        return { username: null, token: null };
      }
      const username = user.username;

      return { username, token, _id };
    },

    createUser: async (
      _: null,
      { input }: { input: { username: string; password: string } },
      context: any
    ) => {
      // throw error if user already exists
      const findUser = await User.findOne({ username: input.username });
      if (findUser) throw Error("user already exists");

      const user = await User.create({
        username: input.username,
        password: input.password,
      });
      if (user) {
        try {
          const token = jwt.sign(user.id, process.env.SECRET!);
          const username = user.username;
          return { username, token };
        } catch (err) {
          throw Error("user created but error creating login token");
        }
      }
    },

    login: async (
      _: null,
      { input }: { input: { username: string; password: string } },
      context: any
    ) => {
      if (context.token) {
        return jwt.verify(context.token, process.env.SECRET!);
      } else {
        try {
          const user = await User.findOne({ username: input.username });
          if (!user)
            throw Error(
              process.env.DEVELOPMENT
                ? "user doesn't exist [dev-env]"
                : "username or password is incorrect"
            );

          const hash = await bcrypt.compare(input.password, user.password);
          if (!hash)
            throw Error(
              process.env.DEVELOPMENT
                ? "wrong password [dev-env]"
                : "username or password is incorrect"
            );

          const token = jwt.sign(user.id, process.env.SECRET!);
          const username = user.username;
          return { token, username };
        } catch (err) {
          console.log(err);
          return err;
        }
      }
    },
  },

  Recipe: {
    author: async (parent: any) => {
      return await User.findById(parent.userId);
    },
  },
  User: {
    recipes: async ({ id }: { id: string }) => {
      const test = await Recipe.find({ userId: id });
      console.log(test);
      return test;
    },
  },
};
