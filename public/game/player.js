export class Player {
    constructor({ position, velocity, id }) {
        this.position = position;
        this.velocity = velocity;
        this.speed = 1;
        this.direction = 'down';
        this.id = id
        this.element = document.createElement('div'); //{tag, attrs {}}
        this.element.innerHTML = `<img class="Cdesheet pixelart face-down" src="assets/redLink.png" alt="Character" />`
        this.element.className = 'Character';
        this.element.id = id
    }

    draw() {
        const img = this.element.querySelector('img');
        if (!img || img.classList.contains(this.direction) === false) {
            this.element.innerHTML = `<img class="Character_spritesheet pixelart face-${this.direction}" src="assets/redLink.png" alt="Character" />`;
        }
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw();
    }
}
export class Bomb {
    constructor({ position, id }) {
        this.position = position;
        this.explosion = '-efect';
        this.id = id
        this.element = document.createElement('div');
        this.element.innerHTML = `<img class="bomber_spritesheet pixelart" src="assets/bomb.png" alt="Bomb" />`
        this.element.style.height = 50 + "px";
        this.element.style.width = 50 + "px";
        this.element.className = 'Bomber';
        this.element.id = id
    }
    draw() {
        const img = this.element.querySelector('img');
        if (!img) {
            this.element.innerHTML = `<img class="bomber_spritesheet pixelart " src="assets/bomb.png" alt="Bomb" />`;
        }
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }
    removeBomb() {
        if (this.element) {
            this.element.remove();
        }
    }
}