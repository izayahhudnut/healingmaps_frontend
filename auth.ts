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
      // @ts-ignore
      async authorize(credentials: Record<"email" | "password", string>) {
        console.log("Credentials:", credentials);
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }

        console.log("Authorizing user");

        const user: any = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
          include: {
            Facility: true,
            Provider: true,
          },
        });

        console.log("User found:", user);

        if (!user) {
          console.log("No user found with this email.");
          throw new Error("No user found with this email.");
        }

        const isValidPassword = await bcryptjs.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) {
          throw new Error("Invalid email or password.");
        }

        const facilityId = user.Facility[0]?.id || user.Provider[0]?.facilityId;

        console.log("User found and password is valid", facilityId);

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          role: user.role,
          facilityId,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName; // Add firstName
        token.lastName = user.lastName; // Add lastName
        token.facilityId = user.facilityId; // Add facilityId
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name, // Combine first and last names if needed
        role: token.role,
        firstName: token.firstName, // Add firstName
        lastName: token.lastName, // Add lastName
        facilityId: token.facilityId, // Add facilityId
        image: token.image,
      };
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
