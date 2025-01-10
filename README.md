[Mario.js](www.garrettjohnson.net/mario "Mario.js") is a clone of Super Mario Bros. for the Nintendo Entertainment System, implemented in Javascript.  It implements a hand-built game engine using the HTML5 Canvas.

Disclaimer: This project is for demonstration only. If you really want to play Mario, please do it on a console. The graphics, sounds, and original design of Super Mario Bros. are all owned by Nintendo.

This fork of the code is designed to be run as a booth activity at an event. It comes in several parts:

- The Mario game itself
- A backend Node server to send the game data to Couchbase and to the frontend
- A frontend leaderboard built with React to display the game data

## The Mario Game

To run the Mario game, open up the [index.html](index.html) file in the root directory in a web browser. The game will start automatically.

This repository is also set up to host the game automatically on GitHub Pages in the repository it is hosted in. You can find it by navigating to `https://<username>.github.io/<repository>`. Make sure to adjust the `BACKEND_URL` variable defined in `js/game.js` at the top of the file to point to the backend Node.js server.

Each player is required to complete a sign-up form before playing the game. The form asks the player for their name, email, company name and job title, as well as a checkbox to consent to receiving marketing emails. Once the form has been submitted this initiates a new player JSON document in the Couchbase database.

## The Backend Server

The Node.js server is found in `/server/server.js` and is responsible for sending the game data to Couchbase. The server is also responsible for sending the game data to the frontend leaderboard.

To start the server, navigate to the `/server` directory and run `node server.js`.

Make sure to fill in the `.env` file with your credentials *before* starting the server. There is an `.env.sample` file inside `/server` to show you what the `.env` file should look like:

```bash
COUCHBASE_URL=
COUCHBASE_USERNAME=
COUCHBASE_PASSWORD=
COUCHBASE_BUCKET=
```

## The Frontend Leaderboard

The frontend leaderboard is built with React and is found in the `/dashboard` directory. The leaderboard displays the players in order of who is winning. It also shows the data from the game in JSON format on the right-hand side of the browser window. 

You need to provide the URL to the backend Node server in the `.env` file located in the root directory of `/dashboard`. There is an `.env.sample` file inside `/dashboard` to show you what the `.env` file should look like:

```bash
VITE_BACKEND_URL=
```

Once you have filled in the `.env` file, you can start the leaderboard.

To start the leaderboard, navigate to the `/dashboard` directory and run `npm run dev`. This will start the server on `localhost:5173`.

Navigate in a browser window to [http://localhost:5173](http://localhost:5173) to see the leaderboard.

### Leaderboard Administrative View

The leaderboard also has an administrative view that allows you to see the data in the Couchbase database. To access the administrative view, navigate to [http://localhost:5173/admin](http://localhost:5173/admin) or to whatever URL you have set up for the leaderboard.

You must set up an admin password in the `.env` file located in the root directory of `/dashboard`. There is an `.env.sample` file inside `/dashboard` to show you what the `.env` file should look like:

```bash
VITE_ADMIN_VIEW_PASSWORD=
```

If you do not set up an admin password, the admin view will not be accessible. 

The admin view gives you the ability to download a spreadsheet of player data such as company, phone number, email and job title. You can name the spreadsheet download after the event the game was played at.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
