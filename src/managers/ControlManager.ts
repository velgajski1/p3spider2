import { RIGHT_HANDED_MODE_ACTIVE, RIGHT_HANDED_MODE_IDX, setDragActive, SOUND_ACTIVE } from "../config/Config";
import { PileType, TABLEU_COORDS_INIT, TABLEU_COORDS_DELTA, CARD_MOVE_BEFORE_DRAG_ACTIVE, TABLEU_STACK_TWEEN_DURATION, DISABLE_CLICK_DURATION_NORMAL, DISABLE_CLICK_DURATION_STOCK, CARD_MOVE_BEFORE_DRAG_AND_DROP, COMPLETE_SEQUENCE_DELAY } from "../config/Consts";
import Card from "../elements/Card";
import { UIScene } from "../scenes/UIScene";
import CardLayoutManager from "./CardLayoutManager";
import getRankValue, { Rank } from "./CardNameManager";
import { GameManager } from "./GameManager";
import HintManager from "./HintManager";
import PileManager from "./PileManager";
import { SoundManager } from "./SoundManager";
import { TimerManager } from "./TimerManager";
import UndoManager from "./UndoManager";

const CHEATS_ENABLED = false;

class ControlManager
{
    update()
    {

        if (this.activeCard)
        {

            if (this.activeCard.scene)
            {
                if (this.activeCard.scene.input.activePointer.isDown == false)
                {
                    this.handlePointerUp()
                }
            }
        }
    }
    keyR: any;
    private pileManager: PileManager;
    private isClickEnabled: boolean = true;
    keyD: any;
    dragStart: number;
    initialPosition: { x: number; y: number; };
    dragging: any;
    public activeCard?: Card;
    substack: Card[];
    private lastKnownPointerPosition: { x: number; y: number } = { x: 0, y: 0 };
    keyU: any
    holdTimeout: NodeJS.Timeout;
    keySpace: any;
    keyCtrl: any;
    keyZ: any;
    keyW: any;
    keyT: any;
    substackClearTimeout: NodeJS.Timeout;
    holdTimeoutFlag: boolean = false;
    public enabled: boolean = true;
    keyH: any;
    dragAndDrop: boolean = false;

    cardsDragged: number = 0;

    constructor(pileManager: PileManager)
    {
        this.enableControls()
        this.pileManager = pileManager;
        this.pileManager.gameplayContainer.setInteractive()
        this.setupGlobalListeners();  // Setup global listeners for move and up events
    }


    disableControls()
    {
        this.enabled = false;
    }

    enableControls()
    {
        this.enabled = true
    }

    public getActiveCard(): Card | undefined { return this.activeCard; }

    setupCardClickControl(card: Card): void
    {
        card.removeAllListeners();
        const hitArea = new Phaser.Geom.Rectangle(0, 0, card.width, card.height);
        card.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        card.on('pointerdown', (pointer: Phaser.Input.Pointer) =>
        {

            if (this.pileManager.distributeDisabled) return;
            this.pileManager.gameManager.firstClickDone = true;
            if (!this.enabled) return;
            if (this.activeCard == card) return;
            if (card.pileType == PileType.Foundation) return;


            if (card.inTransition)
            {
                // HERE
                setTimeout(() =>
                {
                    if (pointer.isDown)
                    {
                        card.emit('pointerdown', pointer);
                    }
                    else
                    {
                        this.handleCardClick(card)
                    }
                }, 100);  // 100ms delay
                return;
            }

            if (this.canMoveCard(card) == false)
            {
                if (this.substack && this.substack.includes(card))
                {
                    if (this.substack.indexOf(card) > 0)
                    {
                        return;
                    }



                }

                this.handleCardClick(card);
                return;
            }

            if (!this.pileManager.isValidSubstack(card))
            {
                // this.resetDraggedCards(card, this.substack);
                return;
            }
            else
            {

            }

            this.activeCard = card;  // Set the active card

            this.dragStart = pointer.downTime;
            this.initialPosition = { x: card.x, y: card.y };
            clearTimeout(this.substackClearTimeout);
            this.substack = this.pileManager.getSubstack(card)
            this.substack.forEach((c, index) =>
            {
                c.setData('substackoffsetY', c.y - card.y);
            });
            card.setData('startX', card.x);
            card.setData('startY', card.y);
            this.isClickEnabled = true;

            let localPoint = this.pileManager.gameplayContainer.getLocalPoint(pointer.x, pointer.y);
            card.setData('dragOffsetX', localPoint.x - card.x);
            card.setData('dragOffsetY', localPoint.y - card.y);
            this.dragging = false;  // Start dragging
            setDragActive(this.dragging)
            this.holdTimeoutFlag = true

            if (this.substack.length > 0)
            {
                this.substack.forEach(c => c.y -= 3)


            } else
            {
                card.y -= 3;
            }

            // Set a timeout to enable dragging after a specified duration
            this.holdTimeout = setTimeout(() =>
            {
                if (this.holdTimeoutFlag && this.activeCard)
                {

                    this.holdTimeoutFlag = false;
                }
            }, 600);  // Duration in milliseconds
            // }, 130);  // Duration in milliseconds



        });
    }

    private addSubstackClearTimeout()
    {
        clearTimeout(this.substackClearTimeout);
        this.substackClearTimeout = setTimeout(() =>
        {
            this.substack = []; //
        }, TABLEU_STACK_TWEEN_DURATION)
    }

    private canMoveCard(card: Card): boolean
    {


        return (card.isFaceUp || card.isBeingFlipped) && (card.pileType === PileType.Tableau || card.pileType === PileType.Foundation);
    }

    handlePointerUp = () =>
    {
        clearTimeout(this.holdTimeout);

        if (this.activeCard)
        {
            if (this.dragging)
            {
                this.activeCard.setDepth(this.activeCard.depth - 100000);
                this.substack.forEach(s =>
                {
                    if (s === this.activeCard) return;
                    s.setDepth(s.depth - 100000);
                    s.isBeingDragged = false
                });

                //
                // Foundation doesn't use click at all, so it always goes to drop
                if (!this.dragAndDrop && this.holdTimeoutFlag && this.activeCard.pileType !== PileType.Foundation)
                {
                    this.handleClick(this.activeCard);
                } else
                {
                    this.handleCardDrop(this.activeCard);
                }

                this.activeCard = undefined;  // Clear the active card reference
                this.dragging = false;
                this.dragAndDrop = false;
                setDragActive(this.dragging);
                this.holdTimeoutFlag = false;
                this.addSubstackClearTimeout();
            } else if (this.activeCard && this.isClickEnabled)
            {
                this.handleClick(this.activeCard);
            }
        }
    };

    setupGlobalListeners(): void
    {
        const input = this.pileManager.gameplayContainer.scene.input;


        input.on('pointermove', (pointer: Phaser.Input.Pointer) =>
        {
            this.lastKnownPointerPosition = { x: pointer.x, y: pointer.y };

            if (!this.dragAndDrop && this.activeCard)
            {
                const localPoint = this.pileManager.gameplayContainer.getLocalPoint(pointer.x, pointer.y);
                const movedDistance = Phaser.Math.Distance.Between(
                    this.activeCard.getData('startX'),
                    this.activeCard.getData('startY'),
                    localPoint.x - this.activeCard.getData('dragOffsetX'),
                    localPoint.y - this.activeCard.getData('dragOffsetY')
                );

                if (!this.dragAndDrop && movedDistance > CARD_MOVE_BEFORE_DRAG_AND_DROP)
                {
                    this.dragAndDrop = true;
                }

                if (!this.dragging && movedDistance > CARD_MOVE_BEFORE_DRAG_ACTIVE)
                {

                    this.dragging = true;
                    setDragActive(this.dragging);
                    let delta = 100000 + this.cardsDragged++;
                    this.activeCard.setDepth(this.activeCard.depth + delta);
                    this.substack.forEach(s =>
                    {
                        if (s === this.activeCard) return;
                        s.setDepth(s.depth + delta);
                    });
                }
            }

            if (this.dragging && this.activeCard)
            {
                const localPoint = this.pileManager.gameplayContainer.getLocalPoint(pointer.x, pointer.y);
                const newX = localPoint.x - this.activeCard.getData('dragOffsetX');
                const newY = localPoint.y - this.activeCard.getData('dragOffsetY');
                this.activeCard.x = newX;
                this.activeCard.y = newY;
                this.substack.forEach((card) =>
                {
                    if (this.activeCard == null) return;
                    if (card === this.activeCard) return;
                    card.x = this.activeCard.x;
                    card.y = this.activeCard.y + card.getData('substackoffsetY'); // Adjust Y based on original offset in the substack
                });
            }
        });



        input.on('pointerup', this.handlePointerUp);
        UIScene.myRef.input.on('pointerup', this.handlePointerUp);
        input.on('pointerupoutside', this.handlePointerUp);


        // UIScene.myRef.input

        // Add window event listeners
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        window.addEventListener('mouseout', this.handleWindowMouseOut.bind(this));
    }


    private handleClick(activeCard: Card)
    {
        if (!this.handleCardClick(activeCard))
        {
            if (this.substack.length > 0)
            {
                this.substack.forEach(c => c.y += 3)
            } else
            {
                activeCard.y += 3;
            }

            this.resetDraggedCards(activeCard, this.substack);
        }

        this.activeCard = undefined;  // Clear the active card reference
        this.addSubstackClearTimeout()
    }

    private handleWindowBlur(): void
    {

        if (this.activeCard)
        {
            this.pileManager.gameplayContainer.scene.input.emit('pointerup', this.lastKnownPointerPosition);
        }
    }

    private handleWindowMouseOut(event: MouseEvent): void
    {
        if (event.relatedTarget === null || event.relatedTarget === window)
        {
            if (this.activeCard)
            {
                this.pileManager.gameplayContainer.scene.input.emit('pointerup', this.lastKnownPointerPosition);
            }
        }
    }

    handleCardDrop(activeCard: Card): void
    {
        const overlappedCards = this.findDropTargets(activeCard);

        const tableauIndex = this.getTableauIndexFromCoordinates(activeCard, activeCard.x, activeCard.y, 140);

        overlappedCards.sort((a, b) =>
        {
            const aSameSuit = (a.suit === activeCard.suit);
            const bSameSuit = (b.suit === activeCard.suit);

            // Put "same suit" targets first
            if (aSameSuit && !bSameSuit) return -1;  // a should come before b
            if (bSameSuit && !aSameSuit) return 1;   // b should come before a

            // Otherwise, keep existing order or fall back to another criteria
            return 0;
        });





        let placed = false;

        for (let card of overlappedCards)
        {
            if (card.pileType == PileType.Tableau)
            {
                if (this.canPlaceCardOnTableau(activeCard, card))
                {
                    let dropIdx = this.pileManager.getTableuPileIndexFromCard(card);
                    if (dropIdx >= 0)
                    {
                        if (activeCard.pileType == PileType.Foundation)
                        {
                            this.pileManager.gameManager.incrementScore(-15);
                        }

                        let pileToFix = activeCard.pileIndex
                        let pileTypeInit = activeCard.pileType
                        if (pileTypeInit == PileType.Foundation)
                        {
                            this.pileManager.fixTableuYDelta(card.pileIndex, [activeCard, ...this.substack]);
                        } else
                        {
                            this.pileManager.fixTableuYDelta(card.pileIndex, [...this.substack]);
                        }

                        this.pileManager.cardLayoutManager.init(this.pileManager);
                        this.pileManager.cardLayoutManager.layoutTableauPile(this.pileManager.getTableauPiles(), dropIdx, true);
                        this.placeCardOnTableau(activeCard, dropIdx);
                        this.substack.forEach(c =>
                        {
                            if (c === activeCard) return;
                            this.placeCardOnTableau(c, dropIdx);
                        });
                        placed = true;
                        if (pileTypeInit == PileType.Tableau) this.pileManager.fixTableuYDelta(pileToFix);
                        this.pileManager.cardLayoutManager.layoutTableauPiles(this.pileManager.getTableauPiles());
                        UndoManager.getInstance().saveState(this.pileManager.getState());

                        TimerManager.setTimer(COMPLETE_SEQUENCE_DELAY, () =>
                        {
                            this.pileManager.checkAndMoveCompletedSequences();
                        }, this);

                        break; // Stop after successful placement
                    }
                }
            }
        }




        if (!placed)
        {

            let validDropFound = false;

            for (let i = 0; i < tableauIndex.length; i++)
            {
                let currentIndex = tableauIndex[i];
                let currentPile = this.pileManager.getTableauPiles()[currentIndex];

                // Check if the drop is valid for this pile
                if (currentPile.length === 0)
                {
                    let pileToFix = activeCard.pileIndex;
                    let pileTypeInit = activeCard.pileType
                    this.pileManager.fixTableuYDelta(currentIndex, [...this.substack]);
                    this.placeCardOnTableau(activeCard, currentIndex);
                    this.substack.forEach(c =>
                    {
                        if (c === activeCard) return;
                        this.placeCardOnTableau(c, currentIndex);
                    });

                    if (pileTypeInit == PileType.Tableau) this.pileManager.fixTableuYDelta(pileToFix);
                    this.pileManager.cardLayoutManager.layoutTableauPiles(this.pileManager.getTableauPiles());
                    UndoManager.getInstance().saveState(this.pileManager.getState());
                    validDropFound = true;
                    setTimeout(() =>
                    {
                        this.pileManager.checkAndMoveCompletedSequences()
                    }, COMPLETE_SEQUENCE_DELAY);

                    break; // Exit the loop once a valid drop is found
                }
            }

            if (!validDropFound)
            {
                // Invalid drop, reset the card and any substack to the original position
                if (this.activeCard)
                {
                    this.resetDraggedCards(this.activeCard, this.substack);
                }
            }
        }
    }


    resetDraggedCards(activeCard: Card, substack: Card[])
    {
        SOUND_ACTIVE && SoundManager.instance.invalid.play()
        this.resetCardDragState(activeCard);
        this.substack.forEach(card =>
        {
            if (card === activeCard) return;
            this.resetCardDragState(card);
        });
    }
    getTableauIndexFromCoordinates(c: Card, x: number, y: number, cardWidth: number): number[]
    {
        const verticalStart = TABLEU_COORDS_INIT.y - 200; // Extend vertical detection range
        const verticalEnd = TABLEU_COORDS_INIT.y + 300;

        if (y >= verticalStart && y <= verticalEnd)
        {
            let overlaps = [];

            for (let i = 0; i < this.pileManager.getTableauPiles().length; i++)
            {
                const pileStartX = TABLEU_COORDS_INIT.x + i * TABLEU_COORDS_DELTA.x;
                const pileEndX = pileStartX + TABLEU_COORDS_DELTA.x; // Assuming piles have uniform width

                // Calculate the overlap with the tableau pile
                const overlapLeft = Math.max(0, Math.min(x + cardWidth, pileEndX) - Math.max(x, pileStartX));
                if (overlapLeft > 0) overlaps.push({ index: i, overlap: overlapLeft });
            }

            // Sort overlaps array by overlap value in descending order
            overlaps.sort((a, b) => b.overlap - a.overlap);

            // Extract and return sorted indices
            return overlaps.map(item => item.index);
        }

        return []; // Return empty array if y-coordinate is out of range
    }


    // getTableauIndexFromCoordinates(x: number, y: number, cardWidth: number): number {
    //     const verticalStart = TABLEU_COORDS_INIT.y - 200; // Extend vertical detection range
    //     const verticalEnd = TABLEU_COORDS_INIT.y + 300;

    //     if (y >= verticalStart && y <= verticalEnd) {
    //         let maxOverlap = 0;
    //         let bestIndex = -1;

    //         for (let i = 0; i < this.pileManager.getTableauPiles().length; i++) {
    //             const pileStartX = TABLEU_COORDS_INIT.x + i * TABLEU_COORDS_DELTA.x;
    //             const pileEndX = pileStartX + TABLEU_COORDS_DELTA.x; // Assuming piles have uniform width

    //             // Calculate the overlap with the tableau pile
    //             const overlapLeft = Math.max(0, Math.min(x + cardWidth, pileEndX) - Math.max(x, pileStartX));
    //             if (overlapLeft > maxOverlap) {
    //                 maxOverlap = overlapLeft;
    //                 bestIndex = i;
    //             }
    //         }

    //         return bestIndex;
    //     }

    //     return -1; // Return -1 if no appropriate pile is found or if y-coordinate is out of range
    // }




    canPlaceCardOnFoundation(card: Card, index: number): boolean
    {

        const foundationPile = this.pileManager.getFoundationPiles()[index];
        if (foundationPile.length == 0)
        {
            return card.rank == Rank.Ace; // Aces start new foundation piles
        } else
        {
            const topCard = foundationPile[foundationPile.length - 1];

            return card.suit == topCard.suit && getRankValue(card.rank) == getRankValue(topCard.rank) + 1;
        }
    }

    private findDropTargets(activeCard: Card): Card[]
    {
        let overlaps: { card: Card, overlap: number }[] = [];

        // Iterate over tableau piles to find any potential drop targets
        for (let pile of this.pileManager.getTableauPiles())
        {
            for (let card of pile)
            {
                if (!pile.includes(activeCard) && card !== activeCard && card.isFaceUp)
                {
                    const overlap = this.overlapArea(activeCard, card);
                    if (overlap > 0)
                    {
                        overlaps.push({ card, overlap });
                    }
                }
            }
        }

        // Iterate over foundation piles to find any potential drop targets
        for (let pile of this.pileManager.getFoundationPiles())
        {
            for (let card of pile)
            {
                if (card !== activeCard)
                {
                    const overlap = this.overlapArea(activeCard, card);
                    if (overlap > 0)
                    {
                        overlaps.push({ card, overlap });
                    }
                }
            }
        }

        // Sort overlaps based on the area in descending order
        overlaps.sort((a, b) => b.overlap - a.overlap);

        // Return only the cards, sorted by overlap area
        return overlaps.map(o => o.card);
    }


    private overlapArea(card1: Card, card2: Card): number
    {
        const bounds1 = card1.getBounds();
        const bounds2 = card2.getBounds();
        const intersection = Phaser.Geom.Rectangle.Intersection(bounds1, bounds2);

        return intersection.width * intersection.height;  // Area of the intersection
    }

    private canPlaceCardOnTableau(activeCard: Card, targetCard: Card): boolean
    {
        // First, find the tableau pile containing the target card
        const targetPile = this.findTableauPileContainingCard(targetCard);

        // Use the PileManager's method to check if moving the activeCard to this pile is allowed
        if (targetPile)
        {

            return this.pileManager.canMoveToTableauPile(activeCard, targetPile);
        }
        else
        {

            return false;
        }

    }

    private placeCardOnTableau(activeCard: Card, targetPileIndex: number): void
    {

        this.pileManager.addCardToTableuPile(activeCard, targetPileIndex, true);
        this.pileManager.getTableauPiles().forEach((pile, index) =>
        {
            this.pileManager.uncoverTableuPile(index)
        })

        this.disableControlsForFoundation()


    }

    disableControlsForFoundation()
    {
        if (this.pileManager.doesCompleteSequenceExist())
        {
            console.log("disable clicks and interaction")
            this.disableCardClicksTemporarily(500);
            const undoManager = UndoManager.getInstance();
            undoManager.disableUndo()
            this.disableControls()
            setTimeout(() =>
            {
                this.enableControls()
                undoManager.enableUndo()
            }, (500));
        }
    }

    private findTableauPileContainingCard(targetCard: Card): Array<Card> | null
    {
        for (let pile of this.pileManager.getTableauPiles())
        {
            if (pile.includes(targetCard))
            {
                return pile;
            }
        }
        return null;
    }

    private resetCardDragState(card: Card): void
    {
        this.dragging = false;
        setDragActive(this.dragging)
        //
        card.x = this.initialPosition.x;
        if (card.getData("substackoffsetY"))
        {
            card.y = this.initialPosition.y + card.getData("substackoffsetY")
        } else
        {
            card.y = this.initialPosition.y
        }


        card.setData("substackoffsetY", 0);

        this.isClickEnabled = true;

    }

    setupControls()
    {
        // Set up tableau cards
        this.pileManager.getTableauPiles().forEach((pile) =>
        {
            pile.forEach((card) => this.setupCardClickControl(card));
        });

        // Set up foundation cards
        this.pileManager.getFoundationPiles().forEach((pile) =>
        {
            pile.forEach((card) => this.setupCardClickControl(card));
        });

        // Set up stock cards
        this.pileManager.getStockPile().forEach((card) => this.setupCardClickControl(card));

        // Set up keyboard controls
        this.setupKeyboardControls();
    }

    setupKeyboardControls()
    {
        // Create a key object for 'D'
        this.keyD = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyD.on('down', this.handleDKey, this);

        // Create a key object for 'D'
        this.keyH = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.keyH.on('down', this.handleHKey, this);

        // Create a key object for 'D'
        this.keyR = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keyR.on('down', this.handleRKey, this);

        // Create a key object for 'U' for undo
        this.keyU = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.U);
        this.keyU.on('down', this.handleUKey, this);

        // Create a key object for 'Space' for the same action as 'D'
        this.keySpace = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keySpace.on('down', this.handleDKey, this);

        // Create key object for 'Ctrl+Z' for undo
        this.keyCtrl = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        this.keyZ = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyZ.on('down', this.handleCtrlZKey, this);

        if (CHEATS_ENABLED)
        {
            this.keyW = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyW.on('down', this.handleWKey, this);

            this.keyT = GameManager.gameScene?.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T);
            this.keyT.on('down', this.handleTKey, this);
        }

        this.isClickEnabled = true; // Assuming this is defined somewhere in your class
    }
    handleWKey()
    {
        if (!CHEATS_ENABLED) return;
        if (this.activeCard) return;
        if (!this.enabled) return;
        this.pileManager.gameManager.winGame();
    }
    handleTKey()
    {
        if (!CHEATS_ENABLED) return;
        if (this.activeCard) return;
        if (!this.enabled) return;
        const enabled = this.pileManager.toggleSuperMode();
        console.log(`Spider supermode ${enabled ? 'enabled' : 'disabled'}`);
    }
    handleHKey(arg0: string, handleHKey: any, arg2: this)
    {
        if (!this.enabled) return;
        if (this.activeCard) return;
        HintManager.getInstance().getHint(this.pileManager)
    }
    handleRKey(arg0: string, handleRKey: any, arg2: this)
    {
        if (!this.enabled) return;
        if (this.activeCard) return;
        GameManager.removeInstance();
        GameManager.gameScene.events.emit('restartScene');
        // this.events.emit
    }

    handleDKey()
    {
        if (this.activeCard) return;
        if (!this.enabled) return;
        if (this.isClickEnabled)
        {
            if (this.pileManager.getTopStockCard() === undefined)
            {
                //do nothing
            } else
            {
                //TODO: move from stock to tableu
                this.pileManager.distributeStockPile()

            }

            // Disable clicks for the cooldown period
            this.disableCardClicksTemporarily(DISABLE_CLICK_DURATION_STOCK);
        }
    }

    handleUKey()
    {

        if (this.activeCard) return;
        if (!this.enabled) return;
        if (this.pileManager.getAllCards().find(c => c.inTransition || (c.isBeingFlipped == false && c.hasTweens())))
        {


            setTimeout(() =>
            {

                if (this.pileManager.getAllCards().find(c => c.inTransition || (c.isBeingFlipped == false && c.hasTweens()))) return
                const undoManager = UndoManager.getInstance();
                const state = undoManager.undo(); // Assuming you have an UndoManager implemented as a singleton
                this.pileManager.removeAllHistory()
                if (state)
                {
                    this.pileManager.setToGameState(state);
                }
            }, 250);
            // this.pileManager.getAllCards().forEach(c => c.finishTweens())
            this.pileManager.getAllCards().forEach(c => c.removeCompletedTweens())
            return;
        }
        const undoManager = UndoManager.getInstance();
        if (this.pileManager.countCardsInTableau() > 0)
        {
            const state = undoManager.undo();
            this.pileManager.removeAllHistory()

            if (state)
            {
                this.pileManager.setToGameState(state);
            }
        }

    }

    handleCtrlZKey()
    {
        if (this.activeCard) return;
        if (this.keyCtrl?.isDown)
        {
            this.handleUKey();
        }
    }

    // Handler for card click events
    // Handle the click event based on card's pile type
    private handleCardClick(card: Card): boolean
    {

        // Prevent additional clicks if a card click was already processed
        if (!this.isClickEnabled)
        {

            return false;
        }

        if (!card.isClickEnabled)
        {
            return false;
        }

        let disableClickDuration = DISABLE_CLICK_DURATION_NORMAL;
        let ret = false



        switch (card.pileType)
        {
            case PileType.Tableau:
                if (card.isFaceUp || card.isBeingFlipped)
                {
                    ret = this.pileManager.handleTableauClicked(card);

                }
                break;

            case PileType.Foundation:
                // Example: Show an error or display a message
                break;

            case PileType.Stock:
                this.pileManager.distributeStockPile()
                disableClickDuration = DISABLE_CLICK_DURATION_STOCK;
                ret = true
                break;

            default:
                console.warn('Unknown pile type.');
                break;
        }
        // Disable clicks for the cooldown period
        if (card.pileType != PileType.Stock)
        {
            card.disbleInteractiveTemporarily(240);
            this.disableCardClicksTemporarily(disableClickDuration);
        } else
        {
            card.disbleInteractiveTemporarily(40);
            this.disableCardClicksTemporarily(disableClickDuration);
        }
        return ret

    }

    // Disable card clicks and re-enable after 100 ms
    private disableCardClicksTemporarily(duration = 160)
    {
        this.isClickEnabled = false;

        // Re-enable clicks after 100 milliseconds
        setTimeout(() =>
        {
            this.isClickEnabled = true;
        }, duration);
    }

}

export default ControlManager;
