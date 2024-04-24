import Phaser from "phaser";
import PreloadScene from "./scenes/preloadScene";
import TitleScene from "./scenes/titleScene";

import LobbyScene from "./scenes/lobbyScene";
import room01Scene from "./scenes/room01Scene";
import ConsoleScene from "./scenes/consoleScene";
import GameUI from "./scenes/uiScene";
import MessageScene from "./scenes/messageScene";

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 250;

export const CONFIG = {
    title: "Bash The Dungeon",
    version: "0.0.1",
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    scene: [
        PreloadScene,
        TitleScene,
        LobbyScene,
        GameUI,
        MessageScene,
        room01Scene,
        ConsoleScene,
    ],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { y: 0 },
        },
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false,
    },
    render: {
        pixelArt: true,
        antialias: true,
    },
    dom: {
        createContainer: true,
    },
};
