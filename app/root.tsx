import {
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
} from "remix";
import db from "./utils/db.server";
import authenticator from "./utils/auth.server";

// @ts-ignore
import tailwind from "./tailwind.css";

type LoaderData = {
  user: {
    email: string | null;
    image: string | null;
  } | null;
};

export const loader: LoaderFunction = async (args) => {
  const url = new URL(args.request.url);
  if (process.env.NODE_ENV === "production" && url.protocol === "http") {
    url.protocol = "https";
    throw redirect(url.toString());
  }

  const userId = await authenticator.isAuthenticated(args.request);
  if (!userId) return json<LoaderData>({ user: null });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, image: true },
    rejectOnNotFound: true,
  });
  return json<LoaderData>({ user });
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwind }];
};

export const meta: MetaFunction = () => {
  return {
    charset: "utf-8",
    title: "SourKanji",
    viewport: "width=device-width,initial-scale=1",
  };
};

export default function App() {
  const loaderData = useLoaderData<LoaderData>();
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <nav className="flex flex-row justify-between space-x-4 border-b px-4">
          <h1 className="text-xl font-bold">SourKanji</h1>
          {loaderData.user && loaderData.user.email}
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
