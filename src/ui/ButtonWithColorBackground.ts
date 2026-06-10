import Phaser from 'phaser';

export class ButtonWithColorBackground extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void, options?: {
        width?: number,
        height?: number,
        color?: number,
        textColor?: string,
        fontSize?: string,
        fontFamily?: string,
        fontStyle?: string,
        cornerRadius?: number,
        onHover?: () => void,
        parentContainer?: Phaser.GameObjects.Container
    }) {
        super(scene, x, y);

        // Default option
        const {
            width = 200,
            height = 50,
            color = 0x0000ff,
            textColor = '#ffffff',
            fontSize = '32px',
            fontFamily = 'Inter',
            fontStyle = 'regular',
            cornerRadius = 10,
            onHover,
            parentContainer
        } = options || {};

        // Create button background
        const background = scene.add.graphics({ fillStyle: { color } })
            .fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);

        // Create button text
        const buttonText = scene.add.text(0, 0, text, {
            fontFamily,
            fontSize,
            fontStyle,
            color: textColor
        }).setOrigin(0.5);

        // Add background and text to this container
        this.add([background, buttonText]);

        // Make the container interactive
        this.setSize(width, height);
        this.setInteractive({ useHandCursor: true })
            .on('pointerdown', onClick)

        // Optional: change style on hover
        if (onHover) {
            this.on('pointerover', onHover);
        }

        // Add this container to the scene or a parent container
        if (parentContainer) {
            parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

 

}
export default ButtonWithColorBackground;
