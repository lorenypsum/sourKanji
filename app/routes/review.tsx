import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import db from "~/utils/db.server";
import { add, differenceInMilliseconds } from "date-fns";
import { useState } from "react";
import authenticator from "~/utils/auth.server";
import humanizeDuration from "humanize-duration";
import parseDuration from "parse-duration";
import ReviewDurationInput from "~/components/ReviewDurationInput";
import KanjiInfo from "~/components/KanjiInfo";

type LoaderData = {
  review: {
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
};

export const loader: LoaderFunction = async (args) => {
  const userId = await authenticator.isAuthenticated(args.request, {
    failureRedirect: "/login",
  });

  const review = await db.review.findFirst({
    where: {
      userId: userId,
      reviewableAt: { lte: new Date() },
      reviewed: false,
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
    rejectOnNotFound: false,
  });
  if (!review) return json<LoaderData>({ review: null });

  const lastReviewDuration = differenceInMilliseconds(
    new Date(),
    review.createdAt
  );
  const suggestedReviewDuration = humanizeDuration(lastReviewDuration * 10, {
    largest: 1,
  });
  return json<LoaderData>({
    review: { id: review.id, kanji: review.kanji, suggestedReviewDuration },
  });
};

export const action: ActionFunction = async (args) => {
  const form = await args.request.formData();

  const reviewId = form.get("review_id");
  if (typeof reviewId !== "string") throw new Error("invalid review id");

  const duration = form.get("duration");
  if (typeof duration !== "string") throw new Error("invalid duration");
  const reviewableAt = add(new Date(), {
    seconds: parseDuration(duration) / 1000,
  });

  const userId = await authenticator.isAuthenticated(args.request, {
    failureRedirect: "/login",
  });

  await db.$transaction(async (db) => {
    const review = await db.review.findFirst({
      where: {
        id: reviewId,
        userId,
        reviewableAt: { lte: new Date() },
        reviewed: false,
      },
      select: { kanjiId: true, createdAt: true },
      rejectOnNotFound: true,
    });
    await db.review.create({
      data: { userId, kanjiId: review.kanjiId, reviewableAt },
    });
    await db.review.update({
      where: { id: reviewId },
      data: { reviewed: true },
    });
  });

  return redirect("/review");
};

export default function LearnPage() {
  const loaderData = useLoaderData<LoaderData>();

  const [revealed, setRevealed] = useState(false);

  if (!loaderData.review) {
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
        {loaderData.review.kanji.kanji}
      </h1>
      {!revealed && (
        <button
          className="border p-2 rounded-md"
          onClick={() => setRevealed(true)}
        >
          Reveal
        </button>
      )}
      {revealed && (
        <>
          <form
            action="/review"
            method="post"
            className="flex flex-col items-stretch md:flex-row md:items-center justify-between gap-2"
          >
            <input
              type="hidden"
              name="review_id"
              value={loaderData.review.id}
            />
            <button type="submit" className="border p-2 rounded-md w-full">
              Schedule review
            </button>
            <div className="w-full flex flex-row items-center justify-center md:justify-end gap-x-2">
              <span>in</span>
              <ReviewDurationInput
                name="duration"
                suggestedDuration={loaderData.review.suggestedReviewDuration}
              />
            </div>
          </form>
          <KanjiInfo kanji={loaderData.review.kanji} />
        </>
      )}
      <a href="/" className="border p-2 rounded-md text-center">
        Go back
      </a>
    </div>
  );
}
