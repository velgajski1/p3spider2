import Phaser from 'phaser';
import { ImageButton } from './ImageButton'; // Ensure the correct path

export class ButtonWithTwoStates extends Phaser.GameObjects.Container {
    private onButton: ImageButton;
    private offButton: ImageButton;
    private _isOn: boolean;
    
    public get isOn(): boolean
    {
        return this._isOn;
    }
    public set isOn(value: boolean)
    {
        this._isOn = value;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, onTexture: string, onTextureHover : string, offTexture: string, offTextureHover:string, initialState: boolean = true, options?: {
        parentContainer?: Phaser.GameObjects.Container
    }) {
        super(scene, x, y);

        // Create the 'on' and 'off' buttons
        this.onButton = new ImageButton(scene, 0, 0, onTexture, onTextureHover, () => this.toggle(), options);
        this.offButton = new ImageButton(scene, 0, 0, offTexture, offTextureHover, () => this.toggle(), options);

        // Initially set the button state
        this.isOn = initialState;
        this.updateVisibility();

        // Add buttons to this container
        this.add([this.onButton, this.offButton]);

        // Add this container to the parent container or scene
        if (options?.parentContainer) {
            options.parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

    toggle(): void {
        this.isOn = !this.isOn;
        this.updateVisibility();
    }

    setOn(): void {
        if (!this.isOn) {
            this.isOn = true;
            this.updateVisibility();
        }
    }

    setOff(): void {
        if (this.isOn) {
            this.isOn = false;
            this.updateVisibility();
        }
    }



    private updateVisibility(): void {
        this.onButton.setVisible(this.isOn);
        this.offButton.setVisible(!this.isOn);
    }
}

export default ButtonWithTwoStates;