import { ActionFunction, LinksFunction, LoaderFunction, useLoaderData } from "remix";
import { PassThrough } from "stream";

export const Loader: LoaderFunction = async ({ params }) => {
    return {};
}

export default function suggestion() {
    return (
        <main className="h-full flex flex-col justify-center items-center space-y-4">
            <span>Please select the type of report!<br></br>We are very pleased to get your feeback!</span>
            <form
                action="/report"
                method="post"
                className="flex flex-col items-stretch space-y-2"
            >
            <select 
                placeholder="Report"
                name="type"
                className="appearance-none block p-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="valor1" selected>Bug</option>
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

            </form>

            <a href="/" className="border p-2 rounded-md">
                Go back
            </a>
        </main>
      );
}

 
