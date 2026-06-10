import Phaser from 'phaser';

interface ToggleOptions {
    parentContainer?: Phaser.GameObjects.Container;
    rowWidth?: number;
}

export class SettingsToggle extends Phaser.GameObjects.Container {
    toggleOn: Phaser.GameObjects.Image;
    toggleOff: Phaser.GameObjects.Image;
    label: Phaser.GameObjects.Text;
    isOn: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, initialState = false, options?: ToggleOptions) {
        super(scene, x, y);

        this.isOn = initialState;
        const rowWidth = options?.rowWidth ?? 300;

        this.label = scene.add.text(34, 0, text, {
            fontFamily: 'Inter',
            fontSize: '26px',
            fontStyle: '500',
            color: '#000'
        }).setOrigin(0, 0.5);
        this.add(this.label);

        this.toggleOff = scene.add.image(rowWidth - 54, 0, 'toggle-off').setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        this.toggleOn = scene.add.image(rowWidth - 54, 0, 'toggle-on').setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        this.toggleOff.setVisible(!this.isOn);
        this.toggleOn.setVisible(this.isOn);

        this.toggleOff.on('pointerdown', () => this.toggle());
        this.toggleOn.on('pointerdown', () => this.toggle());

        this.add([this.toggleOff, this.toggleOn]);

        const h = Math.max(this.toggleOn.height, this.toggleOff.height, this.label.height);
        this.setSize(rowWidth, h);

        if (options?.parentContainer) {
            options.parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

    toggle(): void {
        this.isOn = !this.isOn;
        this.toggleOn.setVisible(this.isOn);
        this.toggleOff.setVisible(!this.isOn);
        dispatchEvent(new Event('radioToggle'));
    }
}

export default SettingsToggle;
