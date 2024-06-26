import Phaser from "phaser";
import PreloadScene from "./scenes/preloadScene";
import TitleScene from "./scenes/titleScene";

import LobbyScene from "./scenes/lobbyScene";
import room01Scene from "./scenes/room01Scene";
import room02Scene from "./scenes/room02Scene";
import room03Scene from "./scenes/room03Scene";
import room04Scene from "./scenes/room04Scene";
import ConsoleScene from "./scenes/consoleScene";
import GameUI from "./scenes/uiScene";
import MessageScene from "./scenes/messageScene";
import HelpButton from "./scenes/helpScene";
import GameOverScene from "./scenes/gameOverScene";
import bossRoomScene from "./scenes/bossRoomScene";
import WinScene from "./scenes/winScene";

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
        room02Scene,
        room03Scene,
        room04Scene,
        ConsoleScene,
        HelpButton,
        GameOverScene,
        bossRoomScene,
        WinScene,
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
