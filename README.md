# SpaceJump

SpaceJump is a simplified Doodle Jump style game intended to be used as a Telegram Web Game. The project contains a small HTML/JavaScript implementation that can be hosted and served to Telegram clients.

## Features

- Main menu with a **Start** button
- A rocket character that jumps on platforms
- Basic Doodle Jump style mechanics (moving left/right, bouncing off platforms)
- Rocket shows a flame when moving upward
- A floor at the start so the rocket doesn't immediately fall
- Scrolling star background
- Optional background music and sound effects
- Support for sprite images for the rocket and platforms

## Running Locally

Simply open `index.html` in a browser to play the game locally.

The game expects audio and image assets inside an `assets` directory:

- `assets/rocket.png` – sprite for the rocket
- `assets/platform.png` – sprite for platforms
- `assets/jump.wav` – jump sound effect
- `assets/gameover.wav` – game over sound
- `assets/music.mp3` – background music

You can replace these with your own files to customize the look and sound.

## Deploying as a Telegram Web Game

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather) and enable the "Inline Mode" and "Game" flags.
2. Host the contents of this repository (the HTML, CSS and JS files) on a web server accessible via HTTPS.
3. Use the `setGameScore` and related methods from the Telegram Bot API if you want to track scores.
4. In your bot configuration, set the URL of the hosted `index.html` as the game URL.

Refer to the [Telegram Games documentation](https://core.telegram.org/bots/games) for more details on integrating Web Games.
