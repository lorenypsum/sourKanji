import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import authenticator from "~/utils/auth.server";
import db from "~/utils/db.server";

type LoaderData = {
  email: string | null;
  performedReviews: number;
  futureReviews: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { email } = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
    rejectOnNotFound: true,
  });
  const performedReviews = await db.review.count({
    where: { userId: { equals: userId }, reviewed: { equals: true } },
  });
  const futureReviews = await db.review.count({
    where: { userId: { equals: userId }, reviewed: { equals: false } },
  });
  return json<LoaderData>({ email, performedReviews, futureReviews });
};

const ProfilePage: React.FC = () => {
  const { email, performedReviews, futureReviews } =
    useLoaderData<LoaderData>();

  return (
    <main className="flex flex-col w-full h-full justify-center items-center space-y-4">
      <p>E-mail: {email}</p>
      <p>Performed reviews: {performedReviews}</p>
      <p>Future reviews: {futureReviews}</p>
      <form action="/logout" method="post">
        <button
          type="submit"
          className="border p-2 rounded-md text-center w-32"
        >
          Log out
        </button>
      </form>
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

export default ProfilePage;
