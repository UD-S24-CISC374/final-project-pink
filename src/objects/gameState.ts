import Player from "./player";

export class gameState {
    //will need to add to this eventually
    player: Player;
    level: number;
    tutorialLevel: number;
    interactingWithNpc: boolean;
    hasAnims: boolean;
    curRoom: string;
    isDodging: boolean;
    invulnerable: boolean;
    leftButtonPressed: boolean;
    rightButtonPressed: boolean;

    constructor(
        player: Player,
        level: number,
        tutorialLevel: number,
        hasAnims: boolean,
        curRoom: string
    ) {
        this.player = player;
        this.level = level;
        this.tutorialLevel = tutorialLevel;
        this.interactingWithNpc = false;
        this.hasAnims = hasAnims;
        this.curRoom = curRoom;
        this.isDodging = false;
        this.invulnerable = false;
        this.leftButtonPressed = false;
        this.rightButtonPressed = false;
    }
    public resetValuesOnSceneSwitch() {
        this.isDodging = false;
        this.invulnerable = false;
        this.player.isInvincible = false;
        this.leftButtonPressed = false;
        this.rightButtonPressed = false;
    }
}
