import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { admin } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        if (ctx.body.email !== process.env.ALLOWED_ADMIN_EMAIL) {
          throw new APIError("FORBIDDEN", {
            message: "Unauthorized: Signups are restricted."
          });
        }
      }
    }),
  },
  plugins: [
    admin({
      defaultRole: "USER",
      adminRoles: "ADMIN",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
