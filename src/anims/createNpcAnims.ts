import Phaser from "phaser";

const createNpcAnims = (anims: Phaser.Animations.AnimationManager) => {
    // Define animations for walking in different directions

    anims.create({
        key: "npc_idle",
        frames: anims.generateFrameNumbers("lobby_npc", {
            start: 0,
            end: 4,
        }),
        frameRate: 10,
        repeat: -1,
    });
    anims.create({
        key: "npc_walk",
        frames: anims.generateFrameNumbers("lobby_npc", {
            start: 5,
            end: 9,
        }),
        frameRate: 10,
        repeat: -1,
    });
};
export { createNpcAnims };
