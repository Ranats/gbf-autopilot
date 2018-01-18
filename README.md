![Travis CI](https://travis-ci.org/Frizz925/gbf-autopilot.svg?branch=master)

# Granblue Autopilot
Granblue Autopilot is an open-source grinding/farming bot for Granblue Fantasy licensed under the [MIT License](LICENSE).

## Disclaimer
I hold no liability for any damage or losses caused by the usage of this bot as per the [MIT License](LICENSE). Use this bot on your own risk.

## Long-Term Milestones
The development of this bot is working towards specific goals.
- [x] Code clean-up [fab32f9](https://github.com/Frizz925/gbf-autopilot/commit/fab32f971617369f0cf6821785e93ec4592d07ba)
- [x] Bot extensions [50b676](https://github.com/Frizz925/gbf-autopilot/commit/50b6764870236880a367f53510279101915f677b)
- [x] Lua scripting [dfb249](https://github.com/Frizz925/gbf-autopilot-core/commit/dfb249eafe04196daee57cede2e59b733bd76f7f)
- [ ] Documentation for main application
- [ ] Automated testing
- [ ] Stable release
- [ ] Documentation for extension development
- [ ] Additional extension development
- [ ] Linux and macOS platforms support
- [ ] Headless browser support

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

### Updating the bot
Right now the only way to update the bot is by using Git as the version control. You can simply run the following commands to update your bot to the latest update.

```sh
# Pull the newest update
git pull origin master

# Update and install new packages
npm install
pip install -r requirements.txt

# Rebuild the bot
npm run build

# Create new config files
# WARNING: This will overwrite your old configs!
npm run config

# (optional) Do a test run
npm run lint
npm test

# Start the bot
npm start
```

Make sure to also reload the Chrome extension in your browser.

## Issues
The current code base is still in alpha stage and may have many breaking changes, bugs, and other issues. You can request a feature by [opening a new issue](https://github.com/Frizz925/gbf-autopilot/issues/new) in this repository.

**Where should the bug reports and other issues go?**  
Make sure you have read the [Main vs Core extension codebase](https://github.com/Frizz925/gbf-autopilot/wiki/Main-vs-Core-extension-codebase) part to understand which codebase belongs to which repository.

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
