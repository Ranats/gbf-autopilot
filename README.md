![Travis CI](https://travis-ci.org/Frizz925/gbf-autopilot.svg?branch=master)

# Granblue Autopilot
Granblue Autopilot is an open-source grinding/farming bot for Granblue Fantasy licensed under the [MIT License](LICENSE).

## Disclaimer
I hold no liability for any damage or losses caused by the usage of this bot as per the [MIT License](LICENSE). Use this bot on your own risk.

## Supported Platforms
This bot can only run on **Windows** platforms due to its Win32 API dependency.

## Prerequisites
- [Git](https://git-scm.com/) (recommended to easily update the bot)
- [Node.js 8](https://nodejs.org/) (includes npm)
- [Python 3](https://www.python.org/downloads/) (includes pip)
- [pywin32](https://sourceforge.net/projects/pywin32/files/pywin32/) (Python dependency)
- [Viramate](https://chrome.google.com/webstore/detail/viramate/fgpokpknehglcioijejfeebigdnbnokj) (Chrome extension)

## Getting Started
### Installation
```sh
# Clone this repository using Git and navigate into its directory.
git clone https://github.com/Frizz925/gbf-autopilot
cd gbf-autopilot

# Install both of the Node.js and Python dependencies.
npm install
pip install -r requirements.txt

# Build the main application and Chrome extension.
npm run build

# Create the configuration files from its sample files.
npm run config
```

### Testing
The test case is currently just a bare minimum and doesn't cover the whole main functionality. It only dry runs the Node.js server and returns.
```sh
npm run lint
npm test
```

### Starting the bot
Start the server using npm script.
```sh
npm start
```

Load the browser extension by enabling **Developer mode** in your browser's extension page and click the **Load unpacked extensions...** button and navigate to the *extension* directory of the bot.

Your browser should have the bot's grayscaled icon on the Chrome menu. Open the [game](http://game.granbluefantasy.jp/) and wait until it's loaded. The bot icon should turn on and you can start the bot by clicking the icon. There should be a popup window with the *Start* button to start the bot.

### Stopping the bot
You can either click the bot icon again and click the *Stop* button to stop the bot. Or, if the bot still takes control of your mouse and keyboard, you can spam press the *exit key* (default to F1) until the bot stops.

## Main vs Core extension codebase
The codebase for the bot has been rewritten and now separated into two repositories: [main](https://github.com/Frizz925/gbf-autopilot) and [core extension](https://github.com/Frizz925/gbf-autopilot-core). This allows the bot codebase to be much more easy to maintain and provides better extensibility for the bot itself.

What the main codebase contains:
- Chrome extension as a websocket client for communicating with the browser.
- Python webserver as the input controller (eg. mouse and keyboard) through Win32 API and makes it tightly coupled with the OS.
- Node.js as the main application. This part is only responsible for bridging communication between the browser and the input controller, and only calls the main logic from its extensions.

What the core extension codebase contains:
- All of the bot's main logic itself
- Lua script runner

## Extensions
Some of the built-in features of the bot (eg. pokerbot) have been removed from the main codebase and are either available or still in progress as a separate extension.

Here are some examples of the available extensions:
- [Poker](https://github.com/Frizz925/gbf-autopilot-poker)
- [Rise of the Beasts](https://github.com/Frizz925/gbf-autopilot-rotb)

And here are the previously available features in the bot and were removed to be written as a separate extension:
- Chatbot ([Line](https://line.me/))
- Raid queue (leech bot)

## How to install extensions
You can easily install extensions using Node.js package manager, npm. This example will take the [poker extension](https://github.com/Frizz925/gbf-autopilot-poker) for installation.

Install the extension from GitHub repository using npm.
```sh
npm install Frizz925/gbf-autopilot-poker
```

Create a file *extensions.js* in the bot's main directory if you haven't already.
```js
// Array of extensions by its package name to load
module.exports = ["gbf-autopilot-poker"];
```

The extension configuration shares the same file as your main configuration file (*config.ini*) in the bot's main directory. The configuration for the poker extension is already included in your default *config.ini* file under the *PokerMode* section.

## Issues
The current code base is still in alpha stage and may have many breaking changes, bugs, and other issues. You can request a feature by [opening a new issue](https://github.com/Frizz925/gbf-autopilot/issues/new) in this repository.

**Where should the bug reports and other issues go?**  
Make sure you have read the [Main vs Core extension codebase](#Main-vs-Core-extension-codebase) part to understand which codebase belongs to which repository.

Example of issues that may belong to the **main** repository:
- Incorrect mouse position
- Keypress not registered
- Bot failing to run (not caused by its extensions)

[Open a new issue for main repository](https://github.com/Frizz925/gbf-autopilot/issues/new)

Example of issues that may belong to the **core extension** repository:
- Bot redirects to incorrect page or url
- Bot not recognizing the state of the page
- Bot executes incorrect action (eg. attacking instead of using summon)
- Any other bot logic issues

[Open a new issue for core extension repository](https://github.com/Frizz925/gbf-autopilot-core/issues/new)

## License
This software is licensed under the [MIT License](LICENSE)
