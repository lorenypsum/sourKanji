import { createCookieSessionStorage } from "@remix-run/node";
import { compare as compareHash, hash } from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import db from "./db.server";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET)
  throw new Error("Missing AUTH_SECRET env");

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
    secrets:
      process.env.NODE_ENV === "production"
        ? [process.env.AUTH_SECRET!]
        : ["keyboard kitten"],
  },
});

const authenticator = new Authenticator<string>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    const email = form.get("email");
    if (typeof email !== "string")
      throw new AuthorizationError("Invalid email");

    const password = form.get("password");
    if (typeof password !== "string")
      throw new AuthorizationError("Invalid password");

    if (context?.registration) {
      const passwordConfirmation = form.get("password-confirmation");
      if (
        typeof passwordConfirmation !== "string" ||
        password !== passwordConfirmation
      )
        throw new AuthorizationError("Passwords do not match");

      const existingUser = await db.user.findFirst({
        where: { email: { equals: email } },
        select: { id: true },
      });
      if (existingUser)
        throw new AuthorizationError("A user with this email already exists");

      const passwordHash = await hash(password, 10);
      await db.user.create({ data: { email, passwordHash } });
    }

    const user = await db.user.findFirst({
      where: { email: { equals: email } },
      select: { id: true, passwordHash: true },
    });

    if (
      !user ||
      typeof user.passwordHash !== "string" ||
      !(await compareHash(password, user.passwordHash))
    )
      throw new AuthorizationError("Invalid email/password");

    return user.id;
  })
);

export default authenticator;
