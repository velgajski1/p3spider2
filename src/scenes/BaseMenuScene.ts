import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';

export class BaseMenuScene extends Phaser.Scene { 
    public isActive: boolean = false;
    modalBackground: Phaser.GameObjects.Graphics;

    constructor(sceneKey: string) {
        super(sceneKey);
    }

    create(): void {
        this.createModalBackground()
    }

    update(): void {
        // Check if the scene is currently active
        this.isActive = this.scene.isActive(this.scene.key);

        // Optionally, you can perform additional updates based on whether the scene is active
        if (this.isActive) {
            // Update logic for when the scene is active
        }
        // this.modalBackground
    }

    private createModalBackground(): void {
        
        this.modalBackground = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
        this.modalBackground.fillRect(0, 0, this.scale.width*4, this.scale.height*4);
        this.modalBackground.setInteractive({useHandCursor: false, hitArea : new Phaser.Geom.Rectangle(0,0,this.scale.width*4, this.scale.height*4), hitAreaCallback:Phaser.Geom.Rectangle.Contains})
    }

    restartGame = (skipStats : boolean = false) => {
        
     
        var gamemanager : GameManager = this.registry.get("gameManager")
        if (!skipStats) gamemanager.updateStats()
        gamemanager.restart()
        
        this.remove()
    }  

    remove() : void {
        // this.scene.setVisible(false)
        this.scene.sleep()
    }

    /**
     * Desktop responsiveness — shrink prompts at narrower desktop widths.
     * Mobile/tablet (Android/iOS) is left at 1 so existing mobile layouts stay untouched.
     * At/above 1920px: 1.0. At/below 800px: 0.5. In between: linear ramp.
     */
    protected getResponsiveModalScale(): number {
        const isMobile = this.game.device.os.android || this.game.device.os.iOS;
        if (isMobile) return 1;
        const w = window.innerWidth;
        if (w >= 1920) return 1;
        if (w <= 800) return 0.5;
        return 0.5 + (w - 800) * (1 - 0.5) / (1920 - 800);
    }

    /**
     * Position + scale a modal container so it never overlaps the HTML top bar. The container is SCALED
     * to fit the area below the bar (so a tall prompt can't exceed that space or overflow the bottom),
     * but POSITIONED at the true vertical centre when there's room — only pushed down far enough to clear
     * the bar on small screens. So large screens sit at true centre; small screens tuck just below the
     * bar. Reuses getResponsiveModalScale().
     */
    protected layoutModalContainer(
        container: Phaser.GameObjects.Container,
        gameSize: Phaser.Structs.Size | undefined,
        scaleXDivider: number,
        scaleYDivider: number,
        yNudge: number = 0
    ): void {
        const { width, height } = gameSize || this.scale;
        const barH = (document.querySelector('.top-bar') as HTMLElement | null)?.offsetHeight ?? 44;
        const usableHeight = height - barH;

        // Scale to fit the area BELOW the bar, so a tall prompt never exceeds the space under it
        // (and so pushing it down to clear the bar can't overflow the bottom).
        const scaleX = width / scaleXDivider;
        const scaleY = usableHeight / scaleYDivider;
        const scale = Math.min(1, Math.max(scaleX, scaleY));
        const responsive = this.getResponsiveModalScale();
        const finalScale = (scaleXDivider * scale > width || scaleYDivider * scale > usableHeight)
            ? Math.min(scaleX, scaleY) * responsive
            : scale * responsive;
        container.setScale(finalScale);

        // Prefer the true vertical centre (prompt sits higher when there's room); only push down far
        // enough to clear the top bar on small screens. On height-constrained screens halfHeight equals
        // usableHeight/2 — the snug "just below the bar" position; on large screens height/2 wins.
        const halfHeight = (scaleYDivider / 2) * finalScale;
        const centerY = Math.max(height / 2, barH + halfHeight) + yNudge;
        container.setPosition(width / 2, centerY);
    }
}
