class Player {
    hearts: number;
    maxHearts: number;
    health: number;

    constructor(hearts: number, health: number) {
        this.hearts = hearts;
        this.health = health;
    }

    takeDamage(amount: number) {
        this.health -= amount;
    }
}

export default Player;
