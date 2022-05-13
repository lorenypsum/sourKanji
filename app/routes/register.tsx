import { ActionFunction, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { AuthorizationError } from "remix-auth";
import authenticator from "~/utils/auth.server";

type ActionData = { error?: string };

export const action: ActionFunction = async ({ request }) => {
  try {
    await authenticator.authenticate("form", request, {
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

const RegisterPage: React.FC = () => {
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
      <a href="/login">Back</a>
      <div className="flex flex-row ">
          <a
            key="/"
            href="/"
            className="absolute bottom-0 right-0 w-1/5"
          >
          <img alt="SourKanji" src="lemon.png" />
          </a>
        </div>
    </main>
  );
};

export default RegisterPage;
