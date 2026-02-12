import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "./db";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          if (!sql) {
            console.error("Database not configured");
            return null;
          }

          // Look up user in database
          const users = await sql`
            SELECT * FROM users WHERE username = ${credentials.username as string}
          `;

          const user = users[0];

          if (!user) {
            return null;
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          );

          if (!passwordMatch) {
            return null;
          }

          // Return user object (will be stored in JWT)
          return {
            id: user.id,
            name: user.full_name,
            email: user.email,
            username: user.username,
            lifePathNumber: user.life_path_number,
            sunSign: user.sun_sign,
            onboardingComplete: user.onboarding_complete,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.lifePathNumber = user.lifePathNumber;
        token.sunSign = user.sunSign;
        token.onboardingComplete = user.onboardingComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.lifePathNumber = token.lifePathNumber as number;
        session.user.sunSign = token.sunSign as string;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
