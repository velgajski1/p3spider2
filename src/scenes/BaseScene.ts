import Phaser from 'phaser';

export default class BaseScene extends Phaser.Scene {
    constructor(key: string) {
        super({ key });
    }

    preload(): void {
        // Override this method in your scenes to load assets
    }

    create(): void {
        // Add event listener for orientation change to maintain fullscreen
        window.addEventListener('orientationchange', () => {
            this.maintainFullscreen();
        });

        this.input.on('pointerup', () => {
            this.maintainFullscreen();
        });
    }

    protected maintainFullscreen() {
        
        if (this.isMobile() && !this.isTablet() && !this.isFullscreen() && this.isLandscape()) {
            this.enterFullscreen();
        } else if (this.isFullscreen() && !this.isLandscape()) {
            this.exitFullscreen();
        }
    }

    protected isLandscape(): boolean {
        return window.innerWidth > window.innerHeight;
    }

    protected isFullscreen(): boolean {
        return this.scale.isFullscreen;
    }

    private exitFullscreen(): void {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        }
    }

    private isMobile(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android|iphone|ipod/.test(userAgent) && !this.isTablet();
    }

    protected isTablet(): boolean {
        // Any iPad is a tablet, regardless of aspect ratio (newer iPads are wider than 4:3 and
        // Chrome's toolbar shrinks innerHeight, pushing the ratio past the 1.6 cutoff below).
        // device.os.iPad is set by Phaser for old iPads and by our Preloader override for new ones.
        if (this.game.device.os.iPad) return true;
        // Tablets generally have an aspect ratio between 1 and 1.6
        const aspectRatio = window.innerWidth / window.innerHeight;
        // Screen diagonal size in inches (e.g., diagonal of a 10.1" tablet)
        // const screenDiagonalInches = Math.sqrt(window.innerWidth**2 + window.innerHeight**2) / window.devicePixelRatio;
        
        // Typically, tablets have a screen size between 7 and 13 inches
        const isTabletAspectRatio = aspectRatio > 1 && aspectRatio < 1.6;
        // const isTabletSize = screenDiagonalInches > 7 && screenDiagonalInches < 13;

        

        return isTabletAspectRatio && (this.game.device.os.android || this.game.device.os.iOS);
    }

    private enterFullscreen(): void {
        if (!this.scale.isFullscreen && this.isMobile() && !this.isTablet()) {
            try {
                this.scale.startFullscreen();
            } catch (e) {
                console.error('Failed to enter fullscreen:', e);
            }
        }
    }
}
