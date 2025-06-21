# Crypto Jump Telegram Game

Crypto Jump is a simple Doodle Jump style game built for Telegram Web Apps. The game is written in vanilla JavaScript and can be launched inside a Telegram chat via a bot.

## New Features

- Guaranteed starting platform so you never fall right away.
- Difficulty scales with your score: fewer platforms and more hazards appear over time.
- Look out for power-ups on platforms: springs for a higher jump, rockets for a huge boost and shields that save you from one fall or enemy.

## Running Locally

Open `public/index.html` in a web browser to see the home screen. Use the **Play** button there to launch the game in `public/game.html`. You can also open `game.html` directly if you want to skip the menu.

## Telegram Integration

To use the game in Telegram:

1. Create a Telegram bot with [@BotFather](https://t.me/BotFather).
2. Host the contents of this repository on a web server accessible via HTTPS.
3. Set the bot's **Web App** URL to your hosted `public/index.html`.
4. In the chat with your bot, send the command that opens the Web App.

When the player loses, the final score is sent back to the bot using `Telegram.WebApp.sendData`.
