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
  id: string;
  kanji: string;
  kunyomi: string;
  meaning: string;
  onyomi: string;
  stories: string[];
  vocabulary: string;
} | null;

export const loader: LoaderFunction = async ({ request }) => {
  // get the user ID and redirect to login if unable to get it
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // get data of the first kanji in the database which has no reviews by the given user
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

  return json<LoaderData>(kanji);
};

export const action: ActionFunction = async ({ request }) => {
  // get the user ID and redirect to login if unable to get it
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // get the form that was sent with the POST request
  const form = await request.formData();

  // get the ID of the kanji to schedule a review
  const kanjiId = form.get("kanji_id");
  if (typeof kanjiId !== "string") throw new Error("invalid kanji ID");

  // get the time duration that the user chose for scheduling the review
  const duration = form.get("duration");
  if (typeof duration !== "string") throw new Error("invalid duration");

  // calculate the date when the user will be able to perform the review
  const reviewableAt = add(new Date(), {
    seconds: parseDuration(duration, "s"),
  });

  // schedule the review
  await db.review.create({ data: { userId, kanjiId, reviewableAt } });

  // redirect to the same page, to make the user go to the next kanji to learn
  return redirect("/learn");
};

const LearnPage: React.FC = () => {
  const kanjiToLearn = useLoaderData<LoaderData>();

  if (!kanjiToLearn) {
    return (
      <div className="flex flex-col items-stretch p-12 space-y-4">
        <h1 className="text-center">Nothing to learn!</h1>
        <a href="/" className="border p-2 rounded-md text-center">
          Go back
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch p-12 space-y-4">
      <h1 className="font-bold text-7xl text-center">{kanjiToLearn.kanji}</h1>
      <KanjiInfo {...kanjiToLearn} />
      <form
        action="/learn"
        method="post"
        className="flex flex-col items-stretch md:flex-row md:items-center justify-between gap-2"
      >
        <input type="hidden" name="kanji_id" value={kanjiToLearn.id} />
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
