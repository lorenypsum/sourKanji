# SourKanji

## Development instructions

First, make sure that Node.js is installed.
If not:
1. If on Windows, install it from the [official website](https://nodejs.org/). Either LTS or Current is fine.
2. If on Linux/macOS, run in a terminal: `curl -L https://git.io/n-install | bash`

Then, clone the repository using your favorite IDE's functionality. Alternatively, you can run in a terminal/command prompt:
```sh
git clone https://github.com/lorenypsum/sourKanji
```

Then, in order to run the project locally,
we must set up environment variables.
For that purpose, we create a `.env` file at the project folder with the following content:
```env
DATABASE_URL=database_url_goes_here
```
The database URL is secret and thus is not provided in this README.
If you haven't received it yet, please ask for it.

Now, we can use `npm` (a program that comes bundled with Node.js) to install the project's dependencies.
For that, we can run in a terminal/command prompt at the project folder:
```sh
npm install
```

Finally, we can run the project locally.
We can run in a terminal/command prompt at the project folder:
```sh
npm run dev
```
While running in development mode,
whenever we change a file locally,
Remix will reload that file and propagate the changes to the browser automatically.