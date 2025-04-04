# Mario Booth Activity

This is a JavaScript clone of Super Mario Bros. designed for event booth activities, it comes in several parts:

- The Mario game itself
- A backend Express server to send the game data to Couchbase and to the frontend
- A frontend built with React that offers the following features:
  - A leaderboard for the game
  - A player sign-up form that is mobile optimized to be used at events with a QR code
  - An administrative interface for event organizers to view, manage and export player data

> [!CAUTION]
> This project is for demonstration only. If you really want to play Mario, please do it on a console. The graphics, sounds, and original design of Super Mario Bros. are all owned by Nintendo.

## Setup and Deployment

Detailed setup instructions for each component:

* [Game](js/README.md): Instructions for running the Mario game locally and deploying it to GitHub Pages.
* [Backend](server/README.md): Instructions for setting up the backend server and deploying it to Render.
* [Dashboard](dashboard/README.md): Instructions for setting up the React-based frontend and deploying it to Render.

## Game Access

The game is hosted on GitHub Pages. You can access it at the following URL, fill in the respective username and repository name:

```bash
https://<username>.github.io/<repository>
```

Players must complete a sign-up form before playing the game. Event organizers can display a link to the mobile sign-up form with a QR code from the event booth. Players find their name at the beginning of the game after completing the sign-up form in order to play.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Thanks to [Garrett Johnson](https://www.garrettjohnson.net) for creating Mario.js, a JavaScript clone of Super Mario Bros. featuring a hand-built game engine using the HTML5 Canvas.