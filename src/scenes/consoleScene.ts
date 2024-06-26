import Phaser from "phaser";

//import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import { gameState } from "../objects/gameState";
import { grammar } from "ohm-js";
import { sceneEvents } from "../util/eventCenter";
import room01Scene from "./room01Scene";
import room02Scene from "./room02Scene";

class node {
    nodeName: string;
    parentNode: node | null;
    childNodes: node[] | null;
    entities: string[];
}

var room01: node = {
    //room 01/starting room
    nodeName: "room01",
    parentNode: null,
    childNodes: null,
    entities: [
        "player",
        "chort1",
        "chort2",
        "chort3",
        "chort4",
        "bullets.c",
        "gun.c",
    ],
};
var room02: node = {
    nodeName: "room02",
    parentNode: room01,
    childNodes: null,
    entities: ["chort1", "chort2", "chort3", "chort4", "bullets.c", "gun.c"],
};
var room03: node = {
    nodeName: "room03",
    parentNode: room02,
    childNodes: null,
    entities: ["chort1", "chort2", "chort3", "chort4", "bullets.c", "gun.c"],
};
var room04: node = {
    nodeName: "room04",
    parentNode: room03,
    childNodes: null,
    entities: ["chort1", "chort2", "chort3", "chort4", "bullets.c", "gun.c"],
};

var bossRoom: node = {
    nodeName: "bossRoom",
    parentNode: room04,
    childNodes: null,
    entities: ["demon1", "demon2", "bullets.c", "gun.c"],
};
room01.childNodes = [room02];
room02.childNodes = [room03];
room03.childNodes = [room04];
room04.childNodes = [bossRoom];

const g = grammar(`
Command {
    Command = Cd | Mv | Compile | Run | Cat | Rm | Ls | Help
    Cd = #"cd " Path
    Mv = #"mv " Path Path Option?
    Compile = #"gcc " Path Option?
    Run = "./" Path
    Cat = #"cat "  Path
    Rm = #"rm " Path Option?
    Ls = "ls" (#" " Option)?
    Help = "help" ("cd" | "mv" | "compile" | "run" | "cat" | "rm" | "ls")?
    Path = (("../" | "./" | "") location | ".." "" )
    Option = "-o" | "-r" | "-l"
    location = alnum+ ("/" location)? (".txt" | ".c" | ".out")?
}`);

class ConsoleScene extends Phaser.Scene {
    private numCommands: number = 0;
    private consoleText?: Phaser.GameObjects.DOMElement;
    private consoleDisplay?: Phaser.GameObjects.DOMElement;
    private gameState: gameState;
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private currentNode: node = room01;
    constructor() {
        super({ key: "ConsoleScene" });
    }
    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
    }

    preload() {
        this.load.html("consoleText", "assets/text/console.html");
        this.load.html("consoleDisplay", "assets/text/consoleDisplay.html");
    }
    create() {
        this.add.image(60, 15, "console").setOrigin(0);
        //console.log(this.gameState);

        this.consoleText = this.add
            .dom(220, 224)
            .createFromCache("consoleText");
        this.consoleDisplay = this.add
            .dom(220, 16)
            .createFromCache("consoleDisplay");
        document.getElementById("consoleInput")?.focus();
        //change back to the game scene.
        const tabKey = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.TAB
        );
        tabKey?.on("up", this.switchScene, this);
        const enterKey = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );
        enterKey?.on("down", this.handleEnterKey, this);
    }
    private switchScene() {
        console.log(this.gameState.curRoom);
        this.makeVisible();
        this.scene.setVisible(false, "ConsoleScene");
        this.scene.resume(this.gameState.curRoom);
        this.scene.bringToTop(this.gameState.curRoom);
        this.scene.bringToTop("game-ui");
        this.scene.setVisible(true, "MessageScene");
        this.scene.resume("MessageScene");
        this.scene.bringToTop("MessageScene");
        this.scene.bringToTop("HelpButton");
        this.scene.pause("ConsoleScene");
    }
    makeVisible() {
        const consoleText = document.getElementById("consoleInput");
        if (consoleText) {
            // Toggle the visibility by changing the display property
            if (consoleText.style.display === "none") {
                consoleText.style.display = "block"; // Show the element
            } else {
                consoleText.style.display = "none"; // Hide the element
            }
        }
        const textBlockDiv = document.getElementById("textBlock");
        if (textBlockDiv) {
            // Toggle the visibility by changing the display property
            if (textBlockDiv.style.display === "none") {
                textBlockDiv.style.display = "block"; // Show the element
            } else {
                textBlockDiv.style.display = "none"; // Hide the element
            }
        }
        //this.consoleDisplay?.setVisible(flag);
    }
    public resetConsole() {
        this.numCommands = 0;
        this.currentNode = room01;
        const textBlockDiv = document.getElementById("textBlock");
        while (textBlockDiv?.firstChild) {
            textBlockDiv.removeChild(textBlockDiv.firstChild);
        }
    }
    private handleEnterKey() {
        if (this.consoleText) {
            const inputField = this.consoleText.getChildByID(
                "consoleInput"
            ) as HTMLInputElement;
            var newText = [inputField.value];
            inputField.value = ""; // Clear input field
            if (!g.match(newText[0]).succeeded()) {
                newText.push(
                    "Invalid command. Try using the help command for assistance."
                );
            } else {
                var textSplit = newText[0].split(" ");
                textSplit = textSplit.filter((str) => str !== "");
                console.log(textSplit);
                newText.push(...this.executeCommand(textSplit)); // returns a list and pushes it to newText
            }
            //function call here

            const textBlockDiv = document.getElementById("textBlock");
            if (textBlockDiv) {
                for (var i = 0; i < newText.length; i++) {
                    console.log(this.numCommands);
                    if (this.numCommands == 11) {
                        const newParagraph = document.createElement("p");
                        newParagraph.textContent = newText[i];
                        if (textBlockDiv.firstChild) {
                            textBlockDiv.removeChild(textBlockDiv.firstChild);
                        }
                        textBlockDiv.appendChild(newParagraph);
                    } else {
                        // Append the new text to the existing content
                        const newParagraph = document.createElement("p");
                        newParagraph.textContent = newText[i];
                        textBlockDiv.appendChild(newParagraph);
                        this.numCommands++;
                    }
                }
            }
        }
    }
    update() {}

    private executeCommand(command: string[]): string[] {
        if (command[0] == "cd") {
            const pathList = command[1].split("/");
            console.log(pathList);
            if (
                command[1].includes(".txt") ||
                command[1].includes(".c") ||
                command[1].includes(".txt")
            ) {
                return ["location is not a directory"]; //add this to output
            }
            pathList.forEach((element: string) => {
                console.log(element);
                if (element == "..") {
                    if (this.currentNode.parentNode != null) {
                        this.currentNode = this.currentNode.parentNode;
                    } else {
                        return ["already in root directory"]; // add this to output
                    }
                } else if (element == ".") {
                    console.log("do nothing");
                } else {
                    this.currentNode.childNodes?.forEach((item) => {
                        //console.log(element, item.nodeName);
                        if (item.nodeName == element) {
                            this.currentNode = item;
                        }
                    });
                }
            });
        } else if (command[0] == "mv") {
            // add scene change
            const pathList = command[1].split("/");
            const pathListTo = command[2].split("/");
            var tempScene: room01Scene;
            if (pathListTo[pathList.length - 1] == "player") {
                if (pathList[pathList.length - 1] == "gun.c") {
                    console.log(this.gameState.curRoom);
                    if (
                        (this.scene.get(this.gameState.curRoom) as room01Scene)
                            .defaultGunBig
                    ) {
                        (
                            this.scene.get(
                                this.gameState.curRoom
                            ) as room01Scene
                        ).addGun();
                        return ["gun.c moved to player"];
                    } else if (this.gameState.curRoom == "room02Scene") {
                        (
                            this.scene.get(
                                this.gameState.curRoom
                            ) as room02Scene
                        ).addGun();
                        return ["gun.c moved to player"];
                    } else {
                        return [
                            'Cannot find "gun.c" because it does not exist.',
                        ];
                    }
                } else {
                    return [
                        'cannot find "' +
                            pathList.join() +
                            '" because it does not exist.',
                    ];
                }
            }
            if (pathList[pathList.length - 1] == "player") {
                console.log("moving");
                if (
                    !(
                        (
                            this.scene.get(
                                this.gameState.curRoom
                            ) as room01Scene
                        ).roomComplete() == 0
                    )
                ) {
                    return [
                        "Clear out all enemies before moving to the next room",
                        "There are " +
                            (
                                this.scene.get(
                                    this.gameState.curRoom
                                ) as room01Scene
                            ).roomComplete() +
                            " enemies remaining",
                    ];
                }
                (
                    this.scene.get(this.gameState.curRoom) as room01Scene
                ).roomComplete();
                if (
                    pathListTo[pathListTo.length - 1] == "room04" &&
                    this.currentNode == room03
                ) {
                    this.numCommands = 0;
                    this.currentNode.entities =
                        this.currentNode.entities.filter(
                            (str) => str !== "player"
                        ) as string[];
                    room04.entities.push("player");
                    this.currentNode = room04;
                    //hide console
                    console.log(this.gameState.curRoom);
                    this.makeVisible();
                    this.scene.setVisible(false, "ConsoleScene");

                    //stop previous room
                    tempScene = this.scene.get(
                        this.gameState.curRoom
                    ) as room01Scene;
                    console.log(this.gameState.curRoom, tempScene);
                    tempScene.events.off("player-moved");
                    sceneEvents.removeAllListeners();
                    this.scene.stop("game-ui");
                    this.scene.stop(this.gameState.curRoom);

                    //reset gamestate
                    this.gameState.resetValuesOnSceneSwitch();

                    this.gameState.curRoom = "room04Scene";
                    this.scene.start("room04Scene", {
                        gameState: this.gameState,
                    });

                    this.scene.bringToTop(this.gameState.curRoom);
                    this.scene.bringToTop("game-ui");
                    this.scene.pause("ConsoleScene");
                } else if (
                    pathListTo[pathListTo.length - 1] == "room03" &&
                    this.currentNode == room02
                ) {
                    this.numCommands = 0;
                    this.currentNode.entities =
                        this.currentNode.entities.filter(
                            (str) => str !== "player"
                        ) as string[];
                    room03.entities.push("player");
                    this.currentNode = room03;
                    //hide console
                    console.log(this.gameState.curRoom);
                    this.makeVisible();
                    this.scene.setVisible(false, "ConsoleScene");

                    //stop previous room
                    tempScene = this.scene.get(
                        this.gameState.curRoom
                    ) as room01Scene;
                    console.log(this.gameState.curRoom, tempScene);
                    tempScene.events.off("player-moved");
                    sceneEvents.removeAllListeners();
                    this.scene.stop("game-ui");
                    this.scene.stop(this.gameState.curRoom);

                    //reset gamestate
                    this.gameState.resetValuesOnSceneSwitch();

                    this.gameState.curRoom = "room03Scene";
                    this.scene.start("room03Scene", {
                        gameState: this.gameState,
                    });

                    this.scene.bringToTop(this.gameState.curRoom);
                    this.scene.bringToTop("game-ui");
                    this.scene.pause("ConsoleScene");
                } else if (
                    pathListTo[pathListTo.length - 1] == "room02" &&
                    this.currentNode == room01
                ) {
                    this.numCommands = 0;
                    this.currentNode.entities =
                        this.currentNode.entities.filter(
                            (str) => str !== "player"
                        ) as string[];
                    room02.entities.push("player");
                    this.currentNode = room02;
                    //hide console
                    console.log(this.gameState.curRoom);
                    this.makeVisible();
                    this.scene.setVisible(false, "ConsoleScene");

                    //stop previous room
                    tempScene = this.scene.get(
                        this.gameState.curRoom
                    ) as room01Scene;
                    console.log(this.gameState.curRoom, tempScene);
                    tempScene.events.off("player-moved");
                    sceneEvents.removeAllListeners();
                    this.scene.stop("game-ui");
                    this.scene.stop(this.gameState.curRoom);

                    //reset gamestate
                    this.gameState.resetValuesOnSceneSwitch();

                    this.gameState.curRoom = "room02Scene";
                    this.scene.start("room02Scene", {
                        gameState: this.gameState,
                    });

                    //make sure the console is behind the game scene
                    this.scene.bringToTop(this.gameState.curRoom);
                    this.scene.bringToTop("game-ui");
                    this.scene.pause("ConsoleScene");
                } else if (pathListTo[pathListTo.length - 1] == "room01") {
                    this.numCommands = 0;
                    this.currentNode.entities =
                        this.currentNode.entities.filter(
                            (str) => str !== "player"
                        ) as string[];
                    room01.entities.push("player");
                    this.currentNode = room01;
                    //hide console
                    console.log(this.gameState.curRoom);
                    this.makeVisible();
                    this.scene.setVisible(false, "ConsoleScene");

                    //stop previous room
                    tempScene = this.scene.get(
                        this.gameState.curRoom
                    ) as room01Scene;
                    console.log(this.gameState.curRoom, tempScene);
                    tempScene.events.off("player-moved");
                    sceneEvents.removeAllListeners();
                    this.scene.stop("game-ui");
                    this.scene.stop(this.gameState.curRoom);

                    //reset gamestate
                    this.gameState.resetValuesOnSceneSwitch();

                    this.gameState.curRoom = "room01Scene";
                    this.scene.start("room01Scene", {
                        gameState: this.gameState,
                    });

                    this.scene.bringToTop(this.gameState.curRoom);
                    this.scene.bringToTop("game-ui");
                    this.scene.pause("ConsoleScene");
                } else if (
                    pathListTo[pathListTo.length - 1] == "bossRoom" &&
                    this.currentNode == room04
                ) {
                    this.numCommands = 0;
                    this.currentNode.entities =
                        this.currentNode.entities.filter(
                            (str) => str !== "player"
                        ) as string[];
                    room01.entities.push("player");
                    this.currentNode = room01;
                    //hide console
                    console.log(this.gameState.curRoom);
                    this.makeVisible();
                    this.scene.setVisible(false, "ConsoleScene");

                    //stop previous room
                    tempScene = this.scene.get(
                        this.gameState.curRoom
                    ) as room01Scene;
                    console.log(this.gameState.curRoom, tempScene);
                    tempScene.events.off("player-moved");
                    sceneEvents.removeAllListeners();
                    this.scene.stop("game-ui");
                    this.scene.stop(this.gameState.curRoom);

                    //reset gamestate
                    this.gameState.resetValuesOnSceneSwitch();

                    this.gameState.curRoom = "bossRoomScene";
                    this.scene.start("bossRoomScene", {
                        gameState: this.gameState,
                    });

                    this.scene.bringToTop(this.gameState.curRoom);
                    this.scene.bringToTop("game-ui");
                    this.scene.pause("ConsoleScene");
                } else if (pathListTo[pathListTo.length - 1] == "..") {
                    return ["you cannot revisit rooms"];
                    /**
                    this.currentNode.entities =
                        this.currentNode.entities.filter(
                            (str) => str !== "player"
                        ) as string[];
                    if (this.currentNode.parentNode) {
                        this.currentNode.parentNode.entities.push("player");
                        this.currentNode = this.currentNode.parentNode;
                        //(this.currentNode.parentNode?.nodeName);
                    }
                    //hide console
                    console.log(this.gameState.curRoom);
                    this.makeVisible();
                    this.scene.setVisible(false, "ConsoleScene");

                    //stop previous room
                    tempScene = this.scene.get(
                        this.gameState.curRoom
                    ) as room01Scene;
                    //console.log(this.gameState.curRoom, tempScene);
                    tempScene.events.off("player-moved");
                    sceneEvents.removeAllListeners();
                    this.scene.stop("game-ui");
                    this.scene.stop(this.gameState.curRoom);

                    //reset gamestate
                    this.gameState.resetValuesOnSceneSwitch();
                    console.log(this.currentNode, this.currentNode.parentNode);
                    this.gameState.curRoom =
                        this.currentNode.nodeName + "Scene";
                    this.scene.start(this.currentNode.nodeName + "Scene", {
                        gameState: this.gameState,
                    });

                    //make sure the console is behind the game scene
                    this.scene.bringToTop(this.gameState.curRoom);
                    this.scene.bringToTop("game-ui");
                    this.scene.pause("ConsoleScene");
                     */
                } else {
                    return ["path does not exist. Don't try to skip rooms!"];
                }
            } else {
                return ["you do not have permission to move this"];
            }
            console.log(pathList);
        } else if (command[0] == "gcc") {
            const pathList = command[1].split("/");
            if (pathList[pathList.length - 1].includes(".c")) {
                console.log("compiling", pathList);
                if (
                    pathList.length == 1 ||
                    (pathList.length == 2 && pathList[0] == ".")
                ) {
                    if (!this.currentNode.entities.includes("a.out")) {
                        this.currentNode.entities.push("a.out");
                    }
                }
            } else {
                return ["Err cannot compile a non c file."]; // add to output
            }
            console.log(pathList);
        } else if (command[0].includes("./")) {
            const pathList = command[0].split("/"); //this will be where the weapoon reload happens
            if (command[0] == "./a.out") {
                if (this.currentNode.entities.includes("a.out")) {
                    this.gameState.player.currentGun?.reload();
                    console.log("reloaded");
                } else {
                    return ["file does not exist or cannot be run"];
                }
            }

            console.log(pathList);
        } else if (command[0] == "cat") {
            const pathList = command[1].split("/"); //this will be where you can display weapon "files"
            if (
                pathList[pathList.length - 1].includes(".out") ||
                pathList[pathList.length - 1].includes(".txt") ||
                pathList[pathList.length - 1].includes(".c")
            ) {
                console.log(pathList[pathList.length - 1]);
            }
            console.log(pathList);
        } else if (command[0] == "rm") {
            const pathList = command[1].split("/");
            if (pathList[pathList.length - 1] == "bullets.c") {
                (
                    this.scene.get(this.gameState.curRoom) as room01Scene
                ).destroyFireBalls();
                return ["deleting bullets"];
            } else {
                return ["you do not have permission to delete this"]; // add this to output
            }
        } else if (command[0] == "ls") {
            var tempList: string[] = [];
            this.currentNode.childNodes?.forEach((item) => {
                tempList.push(item.nodeName); // add to output
            });
            tempList.push(...this.currentNode.entities); // add to output
            return tempList;
        } else if (command[0] == "help") {
            return [
                "usable commands include:",
                "cd",
                "mv",
                "gcc",
                "./",
                "rm",
                "cat (not implemented yet)",
                "press tab to open and close the terminal",
            ];
        }
        //console.log(this.currentNode);
        return [];
    }
}
export default ConsoleScene;
