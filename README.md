# Crypto Jump Telegram Game

Crypto Jump is a simple Doodle Jump style game built for Telegram Web Apps. The game is written in vanilla JavaScript and can be launched inside a Telegram chat via a bot.

## Running Locally

Open `index.html` in a web browser to play the game locally. Use the arrow keys on desktop or tilt your phone on mobile to move the character.

## Telegram Integration

To use the game in Telegram:

1. Create a Telegram bot with [@BotFather](https://t.me/BotFather).
2. Host the contents of this repository on a web server accessible via HTTPS.
3. Set the bot's **Web App** URL to your hosted `index.html`.
4. In the chat with your bot, send the command that opens the Web App.

When the player loses, the final score is sent back to the bot using `Telegram.WebApp.sendData`.
