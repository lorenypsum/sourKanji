import { ActionFunction, LoaderFunction } from "@remix-run/node";
import authenticator from "~/utils/auth.server";

export const loader: LoaderFunction = async (args) => {
  await authenticator.logout(args.request, { redirectTo: "/login" });
};

export const action: ActionFunction = async (args) => {
  await authenticator.logout(args.request, { redirectTo: "/login" });
};
