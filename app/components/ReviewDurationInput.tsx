import humanizeDuration from "humanize-duration";
import parseDuration from "parse-duration";
import { useState } from "react";

type Props = {
  name: string;
  suggestedDuration: string;
};

/**
 * This component displays an <input> element to contain a time duration in human-readable format.
 *
 * Additionally, it has controls to increase or decrease the duration.
 */
const ReviewDurationInput: React.FC<Props> = ({ name, suggestedDuration }) => {
  const [duration, setReviewDuration] = useState(suggestedDuration);

  return (
    <div className="flex flex-row gap-x-2">
      <button
        className="border p-2 rounded-md"
        onClick={(event) => {
          event.preventDefault();
          setReviewDuration(humanizeDuration(parseDuration(duration) / 10));
        }}
      >
        ÷10
      </button>
      <input
        type="text"
        name={name}
        value={duration}
        onChange={(event) => setReviewDuration(event.target.value)}
        className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
      <button
        className="border p-2 rounded-md"
        onClick={(event) => {
          event.preventDefault();
          setReviewDuration(humanizeDuration(parseDuration(duration) * 10));
        }}
      >
        ×10
      </button>
    </div>
  );
};

export default ReviewDurationInput;
