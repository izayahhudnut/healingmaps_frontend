import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
import bcryptjs from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
// Your own logic for dealing with plaintext password strings; be careful!

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },
      async authorize(credentials: Record<"email" | "password", string>) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
        });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        const isValidPassword = await bcryptjs.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) {
          throw new Error("Invalid email or password.");
        }

        console.log("User found and password is valid");

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.firstName = user.firstName; // Add firstName
        token.lastName = user.lastName; // Add lastName
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: `${token.firstName} ${token.lastName}`, // Combine first and last names if needed
        role: token.role,
        firstName: token.firstName, // Add firstName
        lastName: token.lastName, // Add lastName
      };
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
