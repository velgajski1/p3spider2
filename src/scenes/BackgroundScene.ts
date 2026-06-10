import Phaser from 'phaser';
import { BACKGROUND_COLORS} from '../config/Consts';
import { BG_INDEX, getBGINDEX } from '../config/Config';

export class BackgroundScene extends Phaser.Scene {

    // List of possible background colors
    private backgroundColors: string[] = BACKGROUND_COLORS

    // Current color index
    private currentColorIndex: number = 0;

    constructor() {
        
        super('BackgroundScene');
    }

    preload(): void {
        // Preload assets for the background if any
    }

    create(): void {
        // Set the default background color
        this.changeBackgroundColor();
        // 
        // Additional setup as needed
        this.changeBackgroundColor(getBGINDEX());
        
    }

    public setToColor(color : string): void {
        this.cameras.main.setBackgroundColor(color);
        this.currentColorIndex = this.backgroundColors.indexOf(color)
    }

    // Method to change the background color, optionally to a specific color
    public changeBackgroundColor(colorIndex?: number): void {

        // If a specific color index is provided, use it; otherwise, use the current index
        if (colorIndex !== undefined && colorIndex >= 0 && colorIndex < this.backgroundColors.length) {
            this.currentColorIndex = colorIndex;
        }

        // Apply the background color
        this.cameras.main.setBackgroundColor(this.backgroundColors[this.currentColorIndex]);

        // 
        // Example of how to cycle colors every call
        // this.currentColorIndex = (this.currentColorIndex + 1) % this.backgroundColors.length;
    }
}
