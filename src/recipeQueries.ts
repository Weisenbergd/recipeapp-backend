import { Recipe } from "./db/recipeSchema.js";

export async function aggregateRecipes(
  ingredientList: string[],
  offset: number,
  limit: number
) {
  // no filter (no ingredients selected)
  if (ingredientList?.[0] === "" || ingredientList.length === 0) {
    const recipes = await Recipe.find().skip(offset).limit(limit);
    const totalCount = await Recipe.countDocuments(); // Get total count of recipes

    return { recipes, totalCount };
  }

  const ingredientArray: string[] = ingredientList[0].split(",");

  // rewriting the guaranteed Ingredients
  let guaranteedIngredientsList = [];

  for (let [index, ingredient] of ingredientArray.entries()) {
    if (ingredient.startsWith("@e$")) {
      ingredient = ingredient.split("$")[1];
      ingredientArray[index] = ingredient;
      guaranteedIngredientsList.push(ingredient);
    }
  }

  // aggregate pipeline if there are guaranteed ingredients
  if (guaranteedIngredientsList.length > -1) {
    const recipes = await Recipe.aggregate([
      {
        $match: {
          "ingredients.ingredient": { $all: ingredientArray },
        },
      },
      { $match: { "ingredients.ingredient": { $in: ingredientArray } } },
      { $skip: offset },
      { $limit: limit },
    ]);

    const totalCount = await Recipe.aggregate([
      {
        $match: {
          "ingredients.ingredient": { $all: ingredientArray },
        },
      },
      { $match: { "ingredients.ingredient": { $in: ingredientArray } } },
    ]).count("totalCount");

    return { recipes, totalCount: totalCount[0]?.totalCount || 0 };
  } else {
    // aggregate pipeline if no guaranteed ingredients
    const recipes = await Recipe.aggregate([
      {
        $match: {
          "ingredients.ingredient": { $in: ingredientArray },
        },
      },
      {
        $set: {
          priority: {
            $divide: [
              {
                $size: { $setIntersection: [ingredientArray, "$ingredients"] },
              },
              ingredientArray.length,
            ],
          },
        },
      },
      { $sort: { priority: -1 } },
      { $skip: offset },
      { $limit: limit },
    ]);

    const totalCount = await Recipe.aggregate([
      {
        $match: {
          "ingredients.ingredient": { $in: ingredientArray },
        },
      },
    ]).count("totalCount");

    return { recipes, totalCount: totalCount[0]?.totalCount || 0 };
  }
}
