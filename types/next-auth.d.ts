import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      lifePathNumber: number;
      sunSign: string;
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    lifePathNumber: number;
    sunSign: string;
    onboardingComplete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    lifePathNumber: number;
    sunSign: string;
    onboardingComplete: boolean;
  }
}
