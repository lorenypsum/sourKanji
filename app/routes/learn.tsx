import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { add } from "date-fns";
import parseDuration from "parse-duration";
import KanjiInfo from "~/components/KanjiInfo";
import ReviewDurationInput from "~/components/ReviewDurationInput";
import authenticator from "~/utils/auth.server";
import db from "~/utils/db.server";

type LoaderData = {
  kanji: {
    id: string;
    kanji: string;
    kunyomi: string;
    meaning: string;
    onyomi: string;
    stories: string[];
    vocabulary: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const kanji = await db.kanji.findFirst({
    where: { reviews: { none: { userId: { equals: userId } } } },
    select: {
      id: true,
      kanji: true,
      kunyomi: true,
      onyomi: true,
      meaning: true,
      stories: true,
      vocabulary: true,
    },
  });

  return json<LoaderData>({ kanji });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const form = await request.formData();

  const kanjiId = form.get("kanji_id");
  if (typeof kanjiId !== "string") throw new Error("invalid kanji ID");

  const duration = form.get("duration");
  if (typeof duration !== "string") throw new Error("invalid duration");

  const reviewableAt = add(new Date(), {
    seconds: parseDuration(duration, "s"),
  });

  await db.review.create({ data: { userId, kanjiId, reviewableAt } });

  return redirect("/learn");
};

const LearnPage: React.FC = () => {
  const loaderData = useLoaderData<LoaderData>();

  if (!loaderData.kanji) {
    return (
      <div className="flex flex-col items-stretch p-12 space-y-4">
        <h1 className="text-center">Nothing to review!</h1>
        <a href="/" className="border p-2 rounded-md text-center">
          Go back
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch p-12 space-y-4">
      <h1 className="font-bold text-7xl text-center">
        {loaderData.kanji.kanji}
      </h1>
      <KanjiInfo kanji={loaderData.kanji} />
      <form
        action="/learn"
        method="post"
        className="flex flex-col items-stretch md:flex-row md:items-center justify-between gap-2"
      >
        <input type="hidden" name="kanji_id" value={loaderData.kanji.id} />
        <button type="submit" className="border p-2 rounded-md w-full">
          Schedule review
        </button>
        <div className="w-full flex flex-row items-center justify-center md:justify-end gap-x-2">
          <span>in</span>
          <ReviewDurationInput name="duration" suggestedDuration="10 minutes" />
        </div>
      </form>
      <a href="/" className="border p-2 rounded-md text-center">
        Go back
      </a>
    </div>
  );
};

export default LearnPage;
