# Grand Slam

Grand Slam is a React web app which can be used to arrange doubles tennis matches. I developed this because I was tired of booting a  Windows 7 laptop at my local club to run game scheduling software that was written in 2003 using Delphi.

![Player Screen](./player-screen.png?raw=true)

## Features

- [x]  Dark mode for night play
- [x]  Random doubles draws
- [x]  Rest players from matches using inactive/active toggle
- [x]  History of rounds played
- [x]  Configurable countdown timer
- [x]  Persist player names and dark mode using IndexedDB
- [x]  PWA capabilities for local installation

## Demo and Installation

You can see the application in action at https://iamgbsmith.github.io/grand-slam

Installation: Look for an "Install" icon in your browser's address bar. Clicking it will allow you to install the app to your desktop or home screen on a mobile device. You will be prompted to install new updates are available.

For users on Safari mobile, click the up arrow on the browser and press "Add to Home Screen" to save the app to your device.

## Getting started

Clone the repo:

```shell
git clone https://github.com/iamgbsmith/grand-slam
```

Install dependencies for the app:

```shell
cd grand-slam
yarn install
```

Start the app:

```shell
yarn dev
```

Browse to the application at http://localhost:3000

## Build for production

Bundle the app and generate the PWA files for production:

```shell
yarn build
```

Preview the production build:

```shell
yarn serve
```

Browse to the application at http://localhost:4173/grand-slam/
