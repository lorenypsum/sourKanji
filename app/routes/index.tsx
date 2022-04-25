import { json, LoaderFunction, useLoaderData } from "remix";
import authenticator from "~/utils/auth.server";
import db from "~/utils/db.server";

type LoaderData = {
  learnCount: number;
  reviewCount: number;
};

export const loader: LoaderFunction = async (args) => {
  const userId = await authenticator.isAuthenticated(args.request, {
    failureRedirect: "/login",
  });

  const learnCount = await db.kanji.aggregate({
    where: { reviews: { none: { userId } } },
    _count: true,
  });
  const reviewCount = await db.review.aggregate({
    where: {
      userId,
      reviewableAt: { lte: new Date() },
      reviewed: false,
    },
    _count: true,
  });
  return json<LoaderData>({
    learnCount: learnCount._count,
    reviewCount: reviewCount._count,
  });
};

export default function Index() {
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
}
