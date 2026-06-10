// Card.ts
import Phaser from 'phaser';
import { HINT_ALPHA, HINT_OVERLAY_DURATION, PileType } from '../config/Consts';
import { CardNameManager, Rank, Suit } from '../managers/CardNameManager';
import ControlManager from '../managers/ControlManager';
import { getTweensForObject } from '../utils/Utils';



export default class Card extends Phaser.GameObjects.Sprite
{
    getInfo()
    {
        return this.suit + ", " + this.rank;
    }
    private faceTexture: string; // Path to the face texture
    private backTexture: string; // Path to the back texture
    public isFaceUp: boolean; // Card's state
    pileType: PileType;
    pileIndex: any;
    suit: Suit;
    rank: Rank;
    controlManager: ControlManager;
    inTransition: boolean = false;
    substackid: Number = 0;

    textures: Phaser.Textures.TextureManager;
    hintBlinkCount: number;
    hintMaxBlinks: number;
    hintTimerEvent: Phaser.Time.TimerEvent;
    outline: Phaser.GameObjects.Sprite;
    isClickEnabled: boolean = true;
    isBeingDragged: boolean = false;
    moveHistory: any = [];

    constructor(scene: Phaser.Scene, x: number, y: number, suit: Suit, rank: Rank, isFaceUp: boolean)
    {


        let faceTexture = CardNameManager.Instance.getCardName(suit, rank);

        super(scene, x, y, 'cards', 'card-back.png');
        if (isFaceUp)
        {
            this.setTexture2(faceTexture);
        }
        this.suit = suit;
        this.rank = rank;
        this.name = CardNameManager.Instance.getCardName(suit, rank);


        this.faceTexture = faceTexture;
        this.backTexture = 'card-back';
        this.isFaceUp = isFaceUp; // Initially, cards are face down

        // Add this card to the scene
        scene.add.existing(this);

        this.textures = this.scene.textures;

    }

    private isMobile()
    {
        const userAgent = navigator.userAgent
        //
        return this.scene.sys.game.device.os.android ||
            this.scene.sys.game.device.os.iOS;
    }

    disbleInteractiveTemporarily(arg0: number)
    {
        this.isClickEnabled = false;
        setTimeout(() =>
        {
            this.isClickEnabled = true;
        }, arg0);
    }

    createInvertedFrameTexture(spritesheetKey: string, frameIndex: string, newTextureKey: string)
    {

        //
        if (this.textures.checkKey(newTextureKey))
        {
            //
            return;
        }
        const frame = this.textures.getFrame(spritesheetKey, frameIndex);

        if (!frame)
        {
            console.error(`Frame ${frameIndex} not found in texture ${spritesheetKey}`);
            return;
        }

        const sourceImage = frame.source.image as HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx)
        {
            canvas.width = frame.width;
            canvas.height = frame.height;

            // Draw the specific frame onto the canvas
            ctx.drawImage(
                sourceImage,
                frame.cutX,
                frame.cutY,
                frame.width,
                frame.height,
                0,
                0,
                frame.width,
                frame.height
            );

            // Get the image data from the canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Invert the colors
            for (let i = 0; i < data.length; i += 4)
            {
                data[i] = 255 - data[i];       // Red
                data[i + 1] = 255 - data[i + 1]; // Green
                data[i + 2] = 255 - data[i + 2]; // Blue
            }

            // Put the modified image data back onto the canvas
            ctx.putImageData(imageData, 0, 0);

            // Create a new texture from the canvas
            this.textures.addCanvas(newTextureKey, canvas);
        }
    }

    setHintTexture(on: boolean)
    {
        //
        if (this.isFaceUp)
        {
            if (on)
            {
                this.setTexture(this.faceTexture + '_hint')
            }
            else
            {
                this.setTexture2(this.faceTexture)
            }
        }
        else
        {
            if (on)
            {
                this.setTexture(this.backTexture + '_hint')
            }
            else
            {
                this.setTexture2(this.backTexture)
            }
        }

    }

    update()
    {
        if (this.outline)
        {
            this.outline.x = this.x;
            this.outline.y = this.y;
        }
    }

    startHintAnim(cropY: number)
    {
        if (!this.scene) return;
        this.cancelHintAnim()
        this.addOutline(this.scene, cropY);
        const blinkInterval = HINT_OVERLAY_DURATION // Total duration divided by double the number of blinks

        this.hintTimerEvent = this.scene.time.addEvent({
            delay: blinkInterval,
            callback: () =>
            {
                this.removeOutline()

            }
        });
    }

    cancelHintAnim()
    {

        if (this.hintTimerEvent)
        {

            this.hintTimerEvent.remove()
        }

        this.removeOutline()
    }

    isOnStock()
    {
        return (PileType.Stock == this.pileType)
    }


    finishTweens()
    {
        getTweensForObject(this.scene, this).forEach(x => x.complete());
        this.inTransition = false;
    }

    removeTweens()
    {
        getTweensForObject(this.scene, this).forEach(x => x.remove());
        this.inTransition = false;
    }

    isOnTableu()
    {
        return (PileType.Tableau == this.pileType)
    }

    isBeingFlipped: boolean = false;

    addInteractive()
    {
        this.controlManager.setupCardClickControl(this);
    }

    hasTweens()
    {

        if (getTweensForObject(this.scene, this).length > 0)
        {


            return true;
        }

        return false;
    }


    setPileType(pileType: PileType)
    {
        this.pileType = pileType;
    }




    flip(): void
    {
        if (this.isFaceUp)
        {
            this.setTexture2(this.backTexture);
            this.isFaceUp = false;
        } else
        {
            this.setTexture2(this.faceTexture);
            this.isFaceUp = true;
        }
    }

    removeCompletedTweens(): void
    {
        getTweensForObject(this.scene, this).forEach(x =>
        {

            if (x.totalProgress >= 1) x.remove();
        });

    }

    setFaceUp(isFaceUp: boolean)
    {
        if (!this.scene) return
        if (isFaceUp)
        {

            this.setTexture2(this.faceTexture);
            this.isFaceUp = isFaceUp;
        } else
        {
            this.setTexture2(this.backTexture);
            this.isFaceUp = isFaceUp;
        }
    }

    setPile(pileType: PileType, pileIndex: number): void
    {
        this.pileType = pileType;
        this.pileIndex = pileIndex;
    }

    addOutline(scene: Phaser.Scene, cropY: number): void
    {
        if (!scene) return;
        this.outline = scene.add.sprite(this.x - 1, this.y - 1, 'placeholders', 'card-hint-overlay.png').setScale(this.scale)
        scene.add.existing(this.outline)
        if (this.pileType == PileType.Tableau)
        {
            this.outline.setDepth(this.depth)
        }
        else
        {
            this.outline.setDepth(15000)
        }

        this.parentContainer.add(this.outline)
        this.outline.alpha = HINT_ALPHA

        //    if (cropY > 0) {
        //     this.outline.setCrop(0,0,this.outline.width, cropY/this.scale)
        //    }

        // // Create a graphics object for the rounded rectangle mask
        // const maskGraphics = scene.make.graphics({ x: 0, y: 0} ,false );

        // // Set the fill style and draw the rounded rectangle
        // maskGraphics.fillStyle(0xffffff, 1);
        // maskGraphics.fillRoundedRect(0, 0, this.outline.width, cropY / this.scale, 10);

        // // Create a mask from the graphics object
        // const mask = maskGraphics.createGeometryMask();

        // // Apply the mask to the sprite
        // this.outline.setMask(mask);

        // // Position the mask
        // maskGraphics.setPosition(this.x - 1, this.y - 1);



    }

    removeOutline()
    {
        if (this.outline)
        {
            this.outline.destroy()
        }
    }

    setTexture2(frame: string): this
    {
        super.setTexture('cards', frame + '.png')
        return this;
    }

    getName(): string { return this.name + ", faceup=" + this.isFaceUp + ", pile=" + this.pileType + " x/y/depth= " + this.x + "," + this.y + "," + this.depth }

    // Additional methods to manipulate the card state...
}
