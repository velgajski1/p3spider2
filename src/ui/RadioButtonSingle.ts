import Phaser from 'phaser';
import { SoundManager } from '../managers/SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

interface ButtonOptions {
    parentContainer?: Phaser.GameObjects.Container;
    // Define other properties as needed
}


export class RadioButtonSingle extends Phaser.GameObjects.Container {
    radioOff: Phaser.GameObjects.Image;
    radioOn: Phaser.GameObjects.Image;
    label: Phaser.GameObjects.Text;
    isOn: boolean;

    constructor(scene: Phaser.Scene, x: number | undefined, y: number | undefined, text: any, initialState = false, options?: ButtonOptions) {
        super(scene, x, y);

        // State of the radio button
        this.isOn = initialState;



        // Load the images for the radio button
        this.radioOff = scene.add.image(0, 0, 'prompt_radio_off').setInteractive();
        this.radioOn = scene.add.image(0, 0, 'prompt_radio_on').setInteractive();
        this.radioOn.setVisible(this.isOn); // Initially set based on `initialState`
        this.radioOff.setVisible(!this.isOn);

        // Set up interaction
        this.radioOff.on('pointerdown', this.toggle, this);
        this.radioOn.on('pointerdown', this.toggle, this);

        // Add the radio button images to this container
        this.add([this.radioOff, this.radioOn]);

        // Create and add the text label
        this.label = scene.add.text(30, 0, text, {
            fontFamily: 'Open Sans',
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0, 0.5);
        this.add(this.label);

        // Make sure the container size fits the content
        this.setSize(Math.max(this.radioOff.width, this.radioOn.width) + this.label.width, Math.max(this.radioOff.height, this.radioOn.height));

        // Add this container to the scene
        // Use options.parentContainer safely with proper TypeScript understanding
        if (options?.parentContainer) {
            options.parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

    toggle() {
       
        this.isOn = !this.isOn;
        this.radioOn.setVisible(this.isOn);
        this.radioOff.setVisible(!this.isOn);              
        SOUND_ACTIVE && SoundManager.instance.click.play()

        dispatchEvent(new Event('radioToggle'));
    }

    isRadioOn() {
        return this.isOn;
    }
}

export default RadioButtonSingle;