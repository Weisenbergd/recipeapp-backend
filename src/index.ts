import { ApolloServer, BaseContext } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers.js";
import { connect } from "./db/db.js";
import "dotenv/config";

interface Context {
  token?: string | null;
  user?: {
    username: string;
    admin: boolean;
  } | null;
}

export const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

connect();

if (!process.env.SECRET) throw Error("no verification secret!!!");

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },

  context: async ({ req, res }) => {
    const token = req.headers.authorization?.split("Bearer ")[1] || null;
    let user = null;

    return { user, token };
  },
});

console.log(`server ready at: ${url}`);
