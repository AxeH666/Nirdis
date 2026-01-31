import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "@auth/core/providers/google";
import { prisma } from "../../config/prisma";

export const authConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "database" as const,
  },

  secret: process.env.AUTH_SECRET,

  trustHost: true, // ✅ REQUIRED in non-Next environments
};
