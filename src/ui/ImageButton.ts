import Phaser from 'phaser';
import { SoundManager } from '../managers/SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

export class ImageButton extends Phaser.GameObjects.Container {
    private normalImage: Phaser.GameObjects.Image;
    private hoverImage: Phaser.GameObjects.Image;

    private orX : number = 0.5;
    private orY : number = 0.5;
    private originDeltaX: number = 0;
    private originDeltaY: number = 0;

    public skipClickSound : boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, normalTexture: string, hoverTexture: string, onClick: () => void, options?: {
        parentContainer?: Phaser.GameObjects.Container
    }) {
        super(scene, x, y);

        // Default options
        const { parentContainer } = options || {};

        // Create normal and hover images
        this.normalImage = scene.add.image(0, 0, normalTexture).setVisible(true).setOrigin(0.5,0.5);
        this.hoverImage = scene.add.image(0, 0, hoverTexture).setVisible(false).setOrigin(0.5, 0.5);

        // Add images to this container
        this.add([this.normalImage, this.hoverImage]);

        // Make the container interactive and setup event listeners
        this.setSize(this.normalImage.width, this.normalImage.height);
        this.setInteractive({ useHandCursor: true })
            .on('pointerdown', onClick)
            .on('pointerdown', () => { if (this.skipClickSound) return; SOUND_ACTIVE && SoundManager.instance.click.play() })
            .on('pointerover', () => this.switchToHoverImage())
            .on('pointerout', () => this.switchToNormalImage());

        // Add this container to the scene or a parent container
        if (parentContainer) {
            parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

    private switchToHoverImage(): void {
        this.normalImage.setVisible(false);
        this.hoverImage.setVisible(true);
    }

    private switchToNormalImage(): void {
        this.hoverImage.setVisible(false);
        this.normalImage.setVisible(true);
    }

    public setOrigin(x: number, y: number): this {
        this.orX = x; this.orY = y;

        this.originDeltaX = ( 0.5 - this.orX ) * this.width
        this.originDeltaY = (0.5 - this.orY) * this.height

        this.x += this.originDeltaX
        this.y += this.originDeltaY
        return this;
        
    }

    public setXY(x :number, y: number): this {
        this.x = x + this.originDeltaX
        this.y = y + this.originDeltaY
        return this
    }

}

export default ImageButton;
