import { ActionFunction, json, useActionData } from "remix";
import { AuthorizationError } from "remix-auth";
import authenticator from "~/utils/auth.server";

type ActionData = { error?: string };

export const action: ActionFunction = async (args) => {
  try {
    await authenticator.authenticate("form", args.request, {
      successRedirect: "/",
      throwOnError: true,
      context: { registration: true },
    });
  } catch (error) {
    if (error instanceof AuthorizationError)
      return json<ActionData>({ error: error.message });
    throw error;
  }
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  return (
    <main className="h-full flex flex-col justify-center items-center space-y-4">
      <span>Register</span>
      <form
        action="/register"
        method="post"
        className="flex flex-col items-stretch space-y-2"
      >
        <input
          placeholder="Email"
          name="email"
          type="email"
          className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          placeholder="Password"
          name="password"
          type="password"
          className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          placeholder="Password confirmation"
          name="password-confirmation"
          type="password"
          className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button type="submit" className="border p-2 rounded-md">
          Register
        </button>
      </form>
      {actionData?.error && <p>{actionData.error}</p>}
    </main>
  );
}
