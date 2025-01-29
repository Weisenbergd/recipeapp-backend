export const typeDefs = `#graphql

    type Query {
        getRecipes(offset: Int, limit: Int): [Recipe!]!
        getSingleRecipe(recipeId: String): Recipe!
        getFiltered(ingredientList: [String], offset: Int, limit: Int): GetFilteredResponse!
        getUsers: [User!]
        getUser(id: ID!): User
        getS3URL(folder: String!): S3URL
    }


    type Mutation {
        createRecipe(input: CreateRecipeInput): Recipe
        deleteRecipe(id: ID!): String
        mutateRecipe(input: UpdateRecipeInput): Recipe
        createUser(input: UserInput): UserReturn
        login(input: UserInput): UserReturn
        autoLogin(token: String): User
    }

    type S3URL {
        S3URL: String
    }
  
    type UserReturn {
        _id: ID
        username: String 
        token: String
    }

    type Recipe {
        _id: ID!
        name: String!
        ingredients: [IngredientsType!]!
        time: Int!
        directions: [String!]!
        dietaryTags: [String]
        summary: String!
        author: User!
        priority: Float
        imageURL: String
    }

    type GetFilteredResponse {
        recipes: [Recipe!]!
        totalCount: Int!
}

    input CreateRecipeInput {
        name: String!, 
        summary: String!,
        ingredients: [IngredientsInput!]!,
        time: Int!,
        directions: [String!]!,
        dietaryTags: [String],
        userId: String!
        imageURL: String
    }

    input UpdateRecipeInput {
        _id: ID!,
        name: String,
        ingredients: [IngredientsInput!],
        time: Int,
        directions: [String!],
        dietaryTags: [String],
        summary: String
        imageURL: String
    }

    type IngredientsType {
        ingredient: String!,
        amount: String!
    }

    input IngredientsInput {
        ingredient: String!,
        amount: String!
    }

    type User {
        _id: ID!
        username: String!
        password: String!
        recipes: [Recipe!]
    }


    type Login {
        extra: String
    }

    input UserInput {
        username: String!
        password: String!
    }

    


`;
