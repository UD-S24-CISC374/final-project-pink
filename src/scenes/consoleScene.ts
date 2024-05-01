import Phaser from "phaser";

//import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import { gameState } from "../objects/gameState";
import { grammar } from "ohm-js";

class node {
    nodeName: string;
    parentNode: node | null;
    childNodes: node[] | null;
    entities: string[] | null;
}

var room01: node = {
    //room 01/starting room
    nodeName: "room01",
    parentNode: null,
    childNodes: null,
    entities: ["player", "chort1", "chort2", "chort3", "chort4", "bullets"],
};
var room02: node = {
    nodeName: "room02",
    parentNode: room01,
    childNodes: null,
    entities: ["chort1", "chort2", "chort3", "chort4", "bullets"],
};
var room03: node = {
    nodeName: "room03",
    parentNode: room01,
    childNodes: null,
    entities: ["chort1", "chort2", "chort3", "chort4", "bullets"],
};
var room04: node = {
    nodeName: "room04",
    parentNode: room01,
    childNodes: null,
    entities: ["chort1", "chort2", "chort3", "chort4", "bullets"],
};
var room05: node = {
    nodeName: "room05",
    parentNode: room02,
    childNodes: null,
    entities: ["chort1", "chort2", "chort3", "chort4", "bullets"],
};
room01.childNodes = [room02, room03, room04];
room02.childNodes = [room05];

const g = grammar(`
Command {
    Command = Cd | Mv | Compile | Run | Cat | Rm | Ls | Help
    Cd = #"cd " Path
    Mv = #"mv " Path Path Option?
    Compile = #"gcc " Path Option?
    Run = "./" Path
    Cat = #"cat "  Path
    Rm = #"rm " Option? Path
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
        console.log(
            typeof this.consoleText,
            this.consoleText,
            "hi there omg",
            this.consoleDisplay
        );
        //change back to the game scene.
        const slashKey = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.BACK_SLASH
        );
        slashKey?.on("down", this.switchScene, this);
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
    private handleEnterKey() {
        if (this.consoleText) {
            const inputField = this.consoleText.getChildByID(
                "consoleInput"
            ) as HTMLInputElement;
            var newText = inputField.value;
            inputField.value = ""; // Clear input field
            if (!g.match(newText).succeeded()) {
                newText +=
                    " : Invalid command. Try using the help command for assistance.";
            } else {
                var textSplit = newText.split(" ");
                console.log(textSplit);
                this.executeCommand(newText.split(" "));
            }
            //function call here

            const textBlockDiv = document.getElementById("textBlock");
            if (textBlockDiv) {
                if (this.numCommands == 11) {
                    const newParagraph = document.createElement("p");
                    newParagraph.textContent = newText;
                    while (textBlockDiv.firstChild) {
                        textBlockDiv.removeChild(textBlockDiv.firstChild);
                    }
                    textBlockDiv.appendChild(newParagraph);
                    this.numCommands = 1;
                } else {
                    // Append the new text to the existing content
                    const newParagraph = document.createElement("p");
                    newParagraph.textContent = newText;
                    textBlockDiv.appendChild(newParagraph);
                    this.numCommands++;
                }
            }
        }
    }
    update() {}

    private executeCommand(command: string[]) {
        if (command[0] == "cd") {
            const pathList = command[1].split("/");
            console.log(pathList);
            if (
                command[1].includes(".txt") ||
                command[1].includes(".c") ||
                command[1].includes(".txt")
            ) {
                console.log("location is not a directory");
            }
            pathList.forEach((element: string) => {
                console.log(element);
                if (element == "..") {
                    if (this.currentNode.parentNode != null) {
                        this.currentNode = this.currentNode.parentNode;
                    } else {
                        console.log("already in root directory");
                    }
                } else if (element == ".") {
                    console.log("do nothing");
                } else {
                    this.currentNode.childNodes?.forEach((item) => {
                        console.log(element, item.nodeName);
                        if (item.nodeName == element) {
                            this.currentNode = item;
                        }
                    });
                }
            });
        } else if (command[0] == "mv") {
            console.log(command[1].split("/"));
        } else if (command[0] == "gcc") {
            console.log(command[1].split("/"));
        } else if (command[0] == "./") {
            console.log(command[1].split("/"));
        } else if (command[0] == "cat") {
            console.log(command[1].split("/"));
        } else if (command[0] == "rm") {
            console.log(command[1].split("/"));
        } else if (command[0] == "ls") {
            this.currentNode.childNodes?.forEach((item) => {
                console.log(item.nodeName);
            });
        } else if (command[0] == "help") {
            console.log(command[1].split("/"));
        }
        console.log(this.currentNode);
    }
}
export default ConsoleScene;
