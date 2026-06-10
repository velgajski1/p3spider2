import Phaser from 'phaser';

export interface SuitSegment {
    mode: number; // 1 | 2 | 4
    offTexture: string;
    onTexture: string;
}

// 3-segment variant of the Klondike ToggleSwitch: exactly one segment is "on" at a time.
// Clicking any segment (including the active one) fires onSelectCallback with its mode —
// the active-segment click is what allows "restart in same mode" to go through the confirm flow.
export class SuitToggleSwitch extends Phaser.GameObjects.Container {
    icons: Phaser.GameObjects.Image[] = [];
    private onSelectCallback: (mode: number) => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        segments: SuitSegment[],
        itemDeltaX: number,
        itemDeltaY: number,
        onSelectCallback: (mode: number) => void,
        initMode: number
    ) {
        super(scene, x, y);

        this.onSelectCallback = onSelectCallback;

        segments.forEach((segment, i) => {
            const icon = this.createIcon(segment, i * itemDeltaX, i * itemDeltaY);
            icon.setOrigin(0, 0);
            this.icons.push(icon);
            this.add(icon);
        });

        scene.add.existing(this);

        this.setSelectedMode(initMode);
    }

    private createIcon(segment: SuitSegment, xOffset = 0, yOffset = 0) {
        const icon = this.scene.add.image(xOffset, yOffset, segment.offTexture).setInteractive({ useHandCursor: true });
        (icon as any).onTexture = segment.onTexture;
        (icon as any).offTexture = segment.offTexture;
        (icon as any).mode = segment.mode;
        (icon as any).state = false;
        (icon as any).isHovered = false;

        icon.on('pointerdown', () => {
            this.selectIcon(icon, false);
        });
        icon.on('pointerover', () => {
            (icon as any).isHovered = true;
            this.applyIconTexture(icon);
        });
        icon.on('pointerout', () => {
            (icon as any).isHovered = false;
            this.applyIconTexture(icon);
        });

        return icon;
    }

    // External programmatic state setter — flips visuals without firing the callback.
    // Used to revert the selector when the new-game confirm prompt is cancelled.
    public setSelectedMode(mode: number): void {
        const target = this.icons.find(icon => (icon as any).mode === mode) || this.icons[0];
        this.selectIcon(target, true);
    }

    private applyIconTexture(icon: Phaser.GameObjects.Image): void {
        const base: string = (icon as any).state ? (icon as any).onTexture : (icon as any).offTexture;
        const hoverKey = base + '-hover';
        const texture = (icon as any).isHovered && this.scene.textures.exists(hoverKey) ? hoverKey : base;
        icon.setTexture(texture);
    }

    private selectIcon(icon: Phaser.GameObjects.Image, skipCallback: boolean): void {
        this.icons.forEach(other => {
            (other as any).state = (other === icon);
            this.applyIconTexture(other);
        });

        if (!skipCallback) {
            this.onSelectCallback((icon as any).mode);
        }
    }
}

export default SuitToggleSwitch;
