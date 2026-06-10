import Phaser from 'phaser';
import { SoundManager } from '../managers/SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

interface ControlOptions {
    parentContainer?: Phaser.GameObjects.Container;
    titleTextOptions?: TextOptions;
    itemTextOptions?: TextOptions;
}

interface TextOptions {
    fontSize?: string;
    color?: string;
    fontFamily?: string;
    fontStyle?: string;
}

export class ItemCycleControl extends Phaser.GameObjects.Container {
    private items: (string | number)[];
    public currentItemIndex: number = 0;
    private onChange: (item: string | number) => void;
    private titleText: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, x: number, y: number, title: string, items: (string | number)[], onChange: (item: string | number) => void, options?: ControlOptions, initialItemIndex?: number) {
        super(scene, x, y);
        this.items = items;
        this.onChange = onChange;

        // Set initial item index if provided, ensuring it's within bounds
        if (typeof initialItemIndex === 'number' && initialItemIndex >= 0 && initialItemIndex < items.length) {
            this.currentItemIndex = initialItemIndex;
        }

        const titleTextOptions = {
            fontSize: '24px',
            color: '#000',
            fontFamily: 'Open Sans',
            fontStyle: '',
            ...options?.titleTextOptions // Override defaults with provided options
        };

        // Title Text
        this.titleText = scene.add.text(-24, 0, title, titleTextOptions).setOrigin(0);
        this.titleText.y -= this.titleText.height / 2;

        // Left Button
        const btnLeft = scene.add.image(-100, 0, 'prompt_btn_left').setInteractive();
        btnLeft.on('pointerdown', () => this.cycleItem(-1));

        // Right Button
        const btnRight = scene.add.image(-54, 0, 'prompt_btn_right').setInteractive();
        btnRight.on('pointerdown', () => this.cycleItem(1));

        // Add all components to the container
        this.add([this.titleText, btnLeft, btnRight]);

        // Initial call to onChange with the first item
        this.onChange(this.items[this.currentItemIndex]);

        // Add this container to the scene
        if (options?.parentContainer) {
            options.parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

    private cycleItem(direction: number) {
        
        SOUND_ACTIVE && SoundManager.instance.click.play()
        this.currentItemIndex += direction;
        if (this.currentItemIndex >= this.items.length) {
            this.currentItemIndex = 0; // Wrap to first
        } else if (this.currentItemIndex < 0) {
            this.currentItemIndex = this.items.length - 1; // Wrap to last
        }

        // Trigger the onChange callback with the new current item
        this.onChange(this.items[this.currentItemIndex]);
    }
}

export default ItemCycleControl;
