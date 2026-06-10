// CardLayoutManager.ts
import { RIGHT_HANDED_MODE_ACTIVE, RIGHT_HANDED_MODE_IDX } from "../config/Config";
import { FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, getCardScale, HINT_ALPHA, HINT_ALPHA_FOUNDATION_EMPTY, HINT_OVERLAY_DURATION, STOCK_COORDS, STOCK_COORDS_DELTA_X, STOCK_FOUNDATION_SCALE, TAB_DELTA_Y_MOBILE_EXTRA, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT } from "../config/Consts";
import Card from "../elements/Card";
import { Rank } from "./CardNameManager";
import { GameManager } from "./GameManager";
import PileManager from "./PileManager";
class CardLayoutManager
{

    private static readonly HINT_OVERLAY_DURATION: number = 5000; // Example duration
    private static readonly TEXTURE_KEY: string = 'generated_outline';
    private static textureGenerated: boolean = false;

    stockpile: Card[];
    tableauPiles: Card[][];
    foundationPiles: Card[][];
    pileManager: PileManager;
    stockIndicator: Phaser.GameObjects.Sprite;

    tabIndicators: Phaser.GameObjects.Sprite[];
    foundIndicators: Phaser.GameObjects.Sprite[];
    outline: Phaser.GameObjects.Sprite;
    hintTimerEvent: any;
    timeout: NodeJS.Timeout;

    init(pileManager: PileManager)
    {
        this.pileManager = pileManager;
        addEventListener('rightHandedEvent', () => { this.update() });
    }

    layoutAll(pileManager: PileManager, withTween: boolean = false)
    {
        this.init(pileManager)
        this.layoutStockPile(pileManager.getStockPile())
        this.layoutTableauPiles(pileManager.getTableauPiles(), withTween)
        this.layoutFoundationPiles(pileManager.getFoundationPiles())
    }
    // Layout method for stock pile, usually a single stack
    layoutStockPile(cards: Card[])
    {
        // Ensure cards are grouped into mini-decks
        const batchSize = 10; // Number of cards in each mini-deck
        const numBatches = Math.ceil(cards.length / batchSize); // Calculate the number of batches

        cards.forEach((card, index) =>
        {
            // Determine the batch this card belongs to
            const batchIndex = Math.floor(index / batchSize);

            // Calculate the x-coordinate with delta for batches
            card.x = STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX] + batchIndex * STOCK_COORDS_DELTA_X;
            card.y = STOCK_COORDS.y;
            if (batchIndex == 4) card.x -= 1;
            if (batchIndex == 1) card.x += 1;
            if (batchIndex == 2) card.x += 1;
            if (batchIndex == 3) card.x += 2;
            if (batchIndex == 4) card.x += 3;

            // Set card properties for stock layout
            card.scale = getCardScale() * STOCK_FOUNDATION_SCALE;
            card.setDepth(index); // Ensure stacking order within the stock
            card.setFaceUp(false); // All cards in stock are facedown initially
        });
    }



    layoutTableauPile(tableauPiles: Array<Array<Card>>, pileIndex: number, withTween: boolean = false)
    {

        let pile = tableauPiles[pileIndex];

        const x = TABLEU_COORDS_INIT.x + pileIndex * TABLEU_COORDS_DELTA.x; // Adjust horizontal spacing
        let y = TABLEU_COORDS_INIT.y; // Initialize the y coordinate for the first card in the pile

        pile.forEach((card, cardIndex) =>
        {
            if (withTween && this.pileManager)
            {
                this.pileManager.cardTransitionManager.moveWithTween(card, x, y)
            }
            else
            {
                card.x = x;
                card.y = y;
            }

            if (card.isFaceUp)
            {

                if (this.pileManager)
                {
                    y += this.pileManager.getTableuCardsDeltaYForPile(pileIndex); // Use larger vertical offset for face-up cards
                }
                else
                {
                    let tabCoordsDeltaY = TABLEU_COORDS_DELTA.y;
                    if (GameManager.isMobile) tabCoordsDeltaY += TAB_DELTA_Y_MOBILE_EXTRA
                    y += tabCoordsDeltaY;



                }

            } else
            {
                y += TABLEU_COORDS_DELTA.y_covered; // Use smaller vertical offset for face-down cards
                //
            }

            if (card.inTransition)
            {
                card.setDepth(20000 + cardIndex)
                //
            }
            else
            {
                //
                card.setDepth(pileIndex * 100 + cardIndex); // Ensure correct stacking order
            }



            card.scale = getCardScale();
        });


    }

    // Add more layout methods for additional pile types or special layouts...
    // Layout method for the tableau piles
    layoutTableauPiles(tableauPiles: Array<Array<Card>>, withTween: boolean = false)
    {
        tableauPiles.forEach((pile, pileIndex) =>
        {
            this.layoutTableauPile(tableauPiles, pileIndex, withTween);
        });
    }


    // Layout method for the foundation piles
    layoutFoundationPiles(foundationPiles: Array<Array<Card>>, baseX: number = 700, baseY: number = 100, horizontalOffset: number = 150)
    {
        foundationPiles.forEach((pile, pileIndex) =>
        {
            const x = baseX + pileIndex * horizontalOffset; // Adjust horizontal spacing
            pile.forEach((card, cardIndex) =>
            {

                card.removeTweens()
                card.x = FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + pileIndex * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX] * STOCK_FOUNDATION_SCALE;
                card.y = FOUNDATION_COORDS_INIT.y;
                card.setDepth(1000 + pileIndex * 10 + cardIndex); // Ensure correct stacking order
                if (card.rank == Rank.Ace) card.setDepth(card.depth + 100)
                card.setScale(getCardScale() * STOCK_FOUNDATION_SCALE)
            });
        });
    }


    // Add visual indicators for the foundation piles
    addFoundationIndicators(scene: Phaser.Scene, cont: Phaser.GameObjects.Container)
    {
        this.foundIndicators = [];
        for (let i = 0; i < 8; i++) // Update loop to create 8 indicators
        {
            const x = FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] +
                i * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX];
            const y = FOUNDATION_COORDS_INIT.y;

            // Create a sprite for the foundation indicator
            const foundationIndicator = scene.add.sprite(x, y, 'placeholders', 'foundation-empty.png');
            foundationIndicator.setDepth(9000); // Ensure the indicator is below cards
            cont.add(foundationIndicator);

            // Scale the indicator to 75% of the original card size
            foundationIndicator.setScale(0.75 * getCardScale());

            // Add the indicator to the array
            this.foundIndicators[i] = foundationIndicator;
        }

        this.updateFoundIndicators()
    }


    addHintOutline(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, deltaX: number = 0, deltaY: number = 0, alpha = HINT_ALPHA, frame: string = 'card-hint-overlay.png')
    {

        this.removeHintOutline()
        this.outline = scene.add.sprite(sprite.x, sprite.y, 'placeholders', frame).setScale(sprite.scale)
        scene.add.existing(this.outline)
        this.outline.setDepth(100000)
        sprite.parentContainer.add(this.outline)
        this.outline.x += deltaX
        this.outline.y += deltaY
        this.outline.alpha = alpha;


        this.removeHintTimer()
        this.timeout = setTimeout(() =>
        {
            this.removeHintOutline()
        }, HINT_OVERLAY_DURATION);

    }



    removeHintOutline()
    {
        if (this.outline) this.outline.destroy();
    }

    removeHintTimer()
    {
        if (this.timeout)
        {
            clearTimeout(this.timeout)
        }
    }

    hintTabIdx(idx: number)
    {
        let spr = this.tabIndicators[idx]
        this.addHintOutline(spr.scene, spr, 0, 0, HINT_ALPHA_FOUNDATION_EMPTY, 'card-hint-overlay-on-wood.png');
    }

    hintFoundIdx(idx: number)
    {

        let fPile = this.pileManager.getFoundationPiles()[idx];
        if (fPile.length > 0)
        {
            fPile[0].startHintAnim(0)
        } else
        {
            let spr = this.foundIndicators[idx]
            this.addHintOutline(spr.scene, spr, 0, 0, HINT_ALPHA_FOUNDATION_EMPTY, 'card-hint-overlay-on-wood.png');
        }


    }


    hintStock()
    {
        let spr = this.stockIndicator

        let stockPileLen = this.pileManager.getStockPile().length

        if (stockPileLen > 0)
        {

            this.addHintOutline(spr.scene, spr, 0, 0, HINT_ALPHA);
        } else
        {
            this.addHintOutline(spr.scene, spr, 0, 0, HINT_ALPHA_FOUNDATION_EMPTY, 'card-hint-overlay-on-wood.png');
        }

    }



    addTableuIndicators(scene: Phaser.Scene, cont: Phaser.GameObjects.Container)
    {
        this.tabIndicators = [];
        for (let i = 0; i < 10; i++)
        {
            const x = TABLEU_COORDS_INIT.x + i * TABLEU_COORDS_DELTA.x;
            const y = TABLEU_COORDS_INIT.y;

            // Create a sprite for the foundation indicator
            const tabIndicator = scene.add.sprite(x, y, 'placeholders', 'tableau-empty.png');
            tabIndicator.setDepth(-100); // Ensure the indicator is below cards
            cont.add(tabIndicator);
            // Optionally, customize the indicator with scale or tint
            tabIndicator.setScale(getCardScale());
            // foundationIndicator.setTint(0xaaaaaa); // Example: Slight gray tint
            this.tabIndicators[i] = tabIndicator;



        }
    }




    updateTabIndicators()
    {
        this.tabIndicators.forEach((tabId, i) =>
        {
            tabId.setX(TABLEU_COORDS_INIT.x + i * TABLEU_COORDS_DELTA.x)
            tabId.setScale(getCardScale())
        })
    }

    updateFoundIndicators()
    {
        this.foundIndicators.forEach((fid, i) =>
        {
            fid.setX(FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + i * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX] * STOCK_FOUNDATION_SCALE)
            fid.setScale(getCardScale() * STOCK_FOUNDATION_SCALE)
        })
    }

    update()
    {
        this.updateFoundIndicators();
        this.layoutStockPile(this.pileManager.getStockPile())
        this.layoutFoundationPiles(this.pileManager.getFoundationPiles())
    }


}

export default CardLayoutManager;
