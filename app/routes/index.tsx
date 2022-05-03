import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import authenticator from "~/utils/auth.server";
import db from "~/utils/db.server";

type LoaderData = {
  learnCount: number;
  reviewCount: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const learnCount = await db.kanji.count({
    where: { reviews: { none: { userId: { equals: userId } } } },
  });
  const reviewCount = await db.review.count({
    where: {
      userId: { equals: userId },
      reviewableAt: { lte: new Date() },
      reviewed: { equals: false },
    },
  });
  return json<LoaderData>({ learnCount, reviewCount });
};

const IndexPage: React.FC = () => {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <main className="flex flex-col w-full h-full justify-center items-center space-y-4">
      <a href="/learn" className="border p-2 rounded-md text-center w-32">
        Learn ({loaderData.learnCount})
      </a>
      <a href="/review" className="border p-2 rounded-md text-center w-32">
        Review ({loaderData.reviewCount})
      </a>
    </main>
  );
};

export default IndexPage;
