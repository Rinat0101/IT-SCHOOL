import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { GraphQLClient, gql } from "graphql-request";
import bcrypt from "bcryptjs";

const client = new GraphQLClient("https://graphql.datocms.com/", {
  headers: {
    authorization: `Bearer ${process.env.DATOCMS_API_KEY}`,
  },
});
console.log("✅ API KEY:", process.env.DATOCMS_API_KEY);
console.log("✅ NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);

console.log("🔥 AUTH ROUTE LOADED");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const query = gql`
          query getUser($email: String!) {
            user(filter: { email: { eq: $email } }) {
              id
              email
              password
            }
          }
        `;

        try {
          const data = await client.request(query, { email: credentials.email });

          if (!data.user) return null;
          console.log("🔐 Email:", credentials.email);
          console.log("🔐 Entered password:", credentials.password);
          console.log("🔐 Stored password:", data.user.password);
          
          //const isValid = credentials.password === data.user.password;
         const isValid = await bcrypt.compare(credentials.password, data.user.password);
          if (!isValid) return null;

          return {
            id: data.user.id,
            email: data.user.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
