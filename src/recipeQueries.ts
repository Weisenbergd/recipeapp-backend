import { Recipe } from "./db/recipeSchema.js";

export async function aggregateRecipes(
  ingredientList: string[],
  offset: number,
  limit: number
) {
  // no filter
  // obsolete not filter -- decided to have seperate query for no ingredientList
  // otherwise problem with cache combining and filter not working on front end

  if (ingredientList?.[0] === "" || !ingredientList) {
    return await Recipe.find().skip(offset).limit(limit);
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
  // no long doing -- all selected must be available
  if (guaranteedIngredientsList.length > -1) {
    return await Recipe.aggregate([
      {
        $match: {
          "ingredients.ingredient": { $all: ingredientArray },
        },
      },
      { $match: { "ingredients.ingredient": { $in: ingredientArray } } },
      { $skip: offset },
      { $limit: limit },
    ]);

    // aggregate pipeline if no guaranteed ingredients
    // obsolete -- keeping in case change of mind
  } else {
    // return await Recipe.find({ "amounts.name": "potatoe" });

    const list = await Recipe.aggregate([
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

    return list;
  }
}
