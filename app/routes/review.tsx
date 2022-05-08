import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { add, differenceInMilliseconds } from "date-fns";
import humanizeDuration from "humanize-duration";
import parseDuration from "parse-duration";
import { useState } from "react";
import KanjiInfo from "~/components/KanjiInfo";
import ReviewDurationInput from "~/components/ReviewDurationInput";
import authenticator from "~/utils/auth.server";
import db from "~/utils/db.server";

type LoaderData = {
  id: string;
  kanji: {
    kanji: string;
    kunyomi: string;
    meaning: string;
    onyomi: string;
    stories: string[];
    vocabulary: string;
  };
  suggestedReviewDuration: string;
} | null;

export const loader: LoaderFunction = async ({ request }) => {
  // get the user ID and redirect to login if unable to get it
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // find the data of the review to be performed
  const review = await db.review.findFirst({
    where: {
      userId: { equals: userId },
      reviewableAt: { lte: new Date() },
      reviewed: { equals: false },
    },
    select: {
      id: true,
      kanji: {
        select: {
          kanji: true,
          kunyomi: true,
          onyomi: true,
          meaning: true,
          stories: true,
          vocabulary: true,
        },
      },
      createdAt: true,
    },
    orderBy: { reviewableAt: "asc" },
  });
  if (!review) return json<LoaderData>(null);

  // calculate how many milliseconds have passed since the review was scheduled
  const lastReviewDuration = differenceInMilliseconds(
    new Date(),
    review.createdAt
  );

  // calculate a suggested duration for the next review, if the user gets the answer right.
  // the suggested duration is the last duration times 10.
  const suggestedReviewDuration = humanizeDuration(lastReviewDuration * 10, {
    largest: 1,
  });

  return json<LoaderData>({
    id: review.id,
    kanji: review.kanji,
    suggestedReviewDuration,
  });
};

export const action: ActionFunction = async ({ request }) => {
  // get the user ID and redirect to login if unable to get it
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // get the form that was sent with the POST request
  const form = await request.formData();

  // get the ID of the review that was performed by the user
  const reviewId = form.get("review_id");
  if (typeof reviewId !== "string") throw new Error("invalid review id");

  // get the time duration that the user chose for scheduling the next review
  const duration = form.get("duration");
  if (typeof duration !== "string") throw new Error("invalid duration");

  // calculate the date when the user will be able to perform the next review
  const reviewableAt = add(new Date(), {
    seconds: parseDuration(duration, "s"),
  });

  // begin a database transaction.
  // this prevents race conditions between database queries.
  // moreover, if an error is thrown inside the given function,
  // the database will be rolled back to its previous state.
  await db.$transaction(async (db) => {
    // get the ID of the kanji that was reviewed
    const { kanjiId } = await db.review.findFirst({
      where: {
        id: reviewId,
        userId: { equals: userId },
        reviewableAt: { lte: new Date() },
        reviewed: { equals: false },
      },
      select: { kanjiId: true },
      rejectOnNotFound: true,
    });
    // schedule the new review
    await db.review.create({ data: { userId, kanjiId, reviewableAt } });
    // update the review that was performed to mark it as reviewed
    await db.review.update({
      where: { id: reviewId },
      data: { reviewed: true },
    });
  });

  // redirect to the same page, to make the user go to the next review
  return redirect("/review");
};

const ReviewPage: React.FC = () => {
  const review = useLoaderData<LoaderData>();

  // stores the guess that the user typed into the field
  const [guess, setGuess] = useState("");
  // stores whether the user submitted their guess
  const [submitted, setSubmitted] = useState(false);

  if (!review) {
    return (
      <div className="flex flex-col items-stretch p-12 space-y-4">
        <h1 className="text-center">Nothing to review!</h1>
        <a href="/" className="border p-2 rounded-md text-center">
          Go back
        </a>
      </div>
    );
  }

  // since the meanings are just one string separated by ", ", we split them
  const meanings = review.kanji.meaning.split(", ");
  // whether any of the meanings are equal to the user's guess
  const guessedCorrectly =
    submitted &&
    meanings.some((meaning) => guess.toLowerCase() === meaning.toLowerCase());

  return (
    <div className="flex flex-col items-stretch p-12 space-y-4">
      <h1 className="font-bold text-7xl text-center">{review.kanji.kanji}</h1>
      {!submitted && (
        <>
          <input
            autoFocus={true}
            placeholder="Type the kanji meaning here."
            className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onChange={(event) => setGuess(event.target.value)}
          />
          <button
            className="border p-2 rounded-md"
            onClick={() => setSubmitted(true)}
          >
            Submit
          </button>
        </>
      )}
      {submitted && (
        <>
          <h1 className="font-bold text-xl text-center">
            {guessedCorrectly ? "Correct!" : "Incorrect..."}
          </h1>
          <form
            action="/review"
            method="post"
            className="flex flex-col items-stretch md:flex-row md:items-center justify-between gap-2"
          >
            <input type="hidden" name="review_id" value={review.id} />
            <button type="submit" className="border p-2 rounded-md w-full">
              Schedule review
            </button>
            <div className="w-full flex flex-row items-center justify-center md:justify-end gap-x-2">
              <span>in</span>
              <ReviewDurationInput
                name="duration"
                suggestedDuration={
                  guessedCorrectly
                    ? review.suggestedReviewDuration
                    : "10 minutes"
                }
              />
            </div>
          </form>
          <KanjiInfo {...review.kanji} />
        </>
      )}
      <a href="/" className="border p-2 rounded-md text-center">
        Go back
      </a>
    </div>
  );
};

export default ReviewPage;
