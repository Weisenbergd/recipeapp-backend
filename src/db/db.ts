import mongoose from "mongoose";

export async function connect() {
  const db = await mongoose.connect(
    "mongodb+srv://weisenbergd:24GverKgT4vbOplY@cluster0.kmx4d1u.mongodb.net/recipe"
  );

  console.log("now connected to db");
}
