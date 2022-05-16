import { ActionFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import db from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  const type = formData.get("type")?.toString();
  const text = formData.get("content")?.toString();
  
  if (typeof type !== "string") throw new Error("invalid type!");
  if (typeof text !== "string") throw new Error("invalid text!");

  return db.report.create({
    data: {
      type: type,
      text: text
    }
  })
};

const SuggestionPage: React.FC = () => {
  return (
    <main className="h-full flex flex-col justify-center items-center space-y-4">
      <span>
        Please select the type of report!<br></br>We are very pleased to get
        your feeback!
      </span>
      <Form
        action="/report"
        method="post"
        className="flex flex-col items-stretch space-y-2"
      >
        <select
          placeholder="Report"
          name="type"
          className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="valor1" selected>
            Bug
          </option>
          <option value="valor2">Suggestion</option>
        </select>
        <input
          placeholder="Tell us"
          name="content"
          type="text"
          className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />

        <button type="submit" className="border p-2 rounded-md">
          Submit
        </button>
      </Form>

      <a href="/" className="border p-2 rounded-md">
        Go back
      </a>
    </main>
  );
};

export default SuggestionPage;
