import { ActionFunction, LoaderFunction } from "@remix-run/node";
import authenticator from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};
