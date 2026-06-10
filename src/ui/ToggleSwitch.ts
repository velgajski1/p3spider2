import Phaser from 'phaser';
import { SoundManager } from '../managers/SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

export class ToggleSwitch extends Phaser.GameObjects.Container
{
    icon1: Phaser.GameObjects.Image;
    icon2: Phaser.GameObjects.Image;
    onToggleCallback: (state: boolean) => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        icon1OffTexture: any,
        icon1OnTexture: any,
        icon2OffTexture: any,
        icon2OnTexture: any,
        itemDeltaX: number,
        itemDeltaY: number,
        onToggleCallback: (state: boolean) => void,
        initState: boolean
    )
    {
        super(scene, x, y);

        this.onToggleCallback = onToggleCallback;

        // Create icons using the provided texture names
        this.icon1 = this.createIcon(icon1OffTexture, icon1OnTexture, 0, 0);
        this.icon2 = this.createIcon(icon2OffTexture, icon2OnTexture, itemDeltaX, itemDeltaY); // Assuming some horizontal spacing for example

        this.icon1.setOrigin(0, 0);
        this.icon2.setOrigin(0, 0);

        // Add icons to the container
        this.add([this.icon1, this.icon2]);

        // Add the whole container to the scene
        scene.add.existing(this);

        // Initialize with the first icon turned "on"
        if (initState)
        {
            this.toggleIcon(this.icon2, true, true);
        }
        else
        {
            this.toggleIcon(this.icon1, true, true);
        }

    }


    createIcon(offTexture: string | Phaser.Textures.Texture, onTexture: any, xOffset = 0, yOffset = 0)
    {
        // Create both "on" and "off" states for an icon
        let icon = this.scene.add.image(xOffset, yOffset, offTexture).setInteractive({ useHandCursor: true });
        (icon as any).onTexture = onTexture;
        (icon as any).offTexture = offTexture;
        (icon as any).state = false; // Start as "off"

        icon.on('pointerdown', () =>
        {
            this.toggleIcon(icon, true);
        });

        return icon;
    }

    private toggleIcon(icon: Phaser.GameObjects.Image, state: boolean, skipCallback: boolean = false): void
    {
        const newStateTexture: string = state ? (icon as any).onTexture : (icon as any).offTexture;
        icon.setTexture(newStateTexture);
        (icon as any).state = state;

        let newState: boolean;


        // When one icon is turned on, the other is turned off
        if (icon === this.icon1)
        {
            this.icon2.setTexture((this.icon2 as any).offTexture);
            (this.icon2 as any).state = false;
            newState = false;


        } else
        {
            this.icon1.setTexture((this.icon1 as any).offTexture);
            (this.icon1 as any).state = false;
            newState = true;
        }

        // Call the callback function with the current state
        if (!skipCallback)
        {
            this.onToggleCallback(newState);
            SOUND_ACTIVE && SoundManager.instance.click.play()
        }

    }
}

export default ToggleSwitch;
