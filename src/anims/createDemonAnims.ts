import Phaser from "phaser";

const createDemonAnims = (anims: Phaser.Animations.AnimationManager) => {
    // Define animations for walking in different directions

    anims.create({
        key: "demon_walkLeft",
        frames: anims.generateFrameNumbers("demon_walk_L", {
            start: 0,
            end: 3,
        }),
        frameRate: 10,
        repeat: -1,
    });
    anims.create({
        key: "demon_walkRight",
        frames: anims.generateFrameNumbers("demon_walk_R", {
            start: 0,
            end: 3,
        }),
        frameRate: 10,
        repeat: -1,
    });
    anims.create({
        key: "demon_idle",
        frames: anims.generateFrameNumbers("demon_idle", {
            start: 0,
            end: 3,
        }),
        frameRate: 10,
        repeat: -1,
    });
    anims.create({
        key: "fireball_spawn",
        frames: anims.generateFrameNumbers("fireball_spawn", {
            start: 0,
            end: 13,
        }),
        frameRate: 15,
    });
    anims.create({
        key: "fireball_idle",
        frames: anims.generateFrameNumbers("fireball_idle", {
            start: 0,
            end: 3,
        }),
        frameRate: 10,
    });
    anims.create({
        key: "fireball_target",
        frames: anims.generateFrameNumbers("fireball_target", {
            start: 0,
            end: 2,
        }),
        frameRate: 10,
    });
    anims.create({
        key: "fireball_shoot",
        frames: anims.generateFrameNumbers("fireball_shoot", {
            start: 0,
            end: 3,
        }),
        frameRate: 10,
        repeat: -1,
    });
    anims.create({
        key: "fireball_explode",
        frames: anims.generateFrameNumbers("fireball_explode", {
            start: 0,
            end: 6,
        }),
        frameRate: 10,
    });
};
export { createDemonAnims };
