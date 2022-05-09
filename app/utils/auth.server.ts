import { createCookieSessionStorage } from "@remix-run/node";
import { compare as compareHash, hash } from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import db from "./db.server";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET)
  throw new Error("Missing AUTH_SECRET env");

/*
 * An object of the class SessionStorage
 * has methods to read and write data pertaining to a user
 * given a cookie obtained from an HTTP request.
 * A cookie session storage stores such information in the cookie itself.
 */
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

/*
 * An object of the class Authenticator<T>,
 * given an object of the class SessionStorage,
 * is able to perform login and logout of an user.
 * The type T is what we want to store in the session storage
 * to identify the user.
 */
const authenticator = new Authenticator<string>(sessionStorage);

/**
 * An object of a class extending Strategy<T>
 * can be used by an object of the class Authenticator<T>
 * to authenticate a user.
 * Specifically, FormStrategy<T> is able to use a form sent with an HTTP request
 * to authenticate the user.
 * The authentication logic is given by the function passed to the constructor.
 */
const formStrategy = new FormStrategy(async ({ form, context }) => {
  const email = form.get("email");
  if (typeof email !== "string" || !email.match(/\S+@\S+.\S+/))
    throw new AuthorizationError("Invalid email");

  const password = form.get("password");
  if (typeof password !== "string" || password.length < 1)
    throw new AuthorizationError("Invalid password");

  // we make the convention that,
  // if `{ context: { registration: true } }`
  // is passed to `authenticator.authenticate`,
  // then the user is trying to perform a registration
  if (context?.registration) {
    const passwordConfirmation = form.get("password-confirmation");
    if (
      typeof passwordConfirmation !== "string" ||
      password !== passwordConfirmation
    )
      throw new AuthorizationError("Passwords do not match");

    const existingUsers = await db.user.count({
      where: { email: { equals: email } },
    });
    if (existingUsers > 0)
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
});

/*
 * Allows calling `authenticator.authenticate("form", ...)`
 * to authenticate a user.
 */
authenticator.use(formStrategy, "form");

export default authenticator;
