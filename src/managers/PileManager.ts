import { COMPLETE_SEQUENCE_DELAY, DISABLE_STOCK_DISTRIBUTION, FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, getCardScale, PileType, STOCK_FOUNDATION_SCALE, TAB_DELTA_Y_MOBILE_EXTRA, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, TABLEU_STACK_TWEEN_DURATION } from "../config/Consts";
import Card from "../elements/Card";
import { GameState } from "../utils/types";
import CardLayoutManager from './CardLayoutManager';
import getRankValue, { Rank, Suit } from "./CardNameManager";
import CardTransitionManager from "./CardTransitionManager";
import { GameManager } from "./GameManager";
import UndoManager from "./UndoManager";
import { RIGHT_HANDED_MODE_IDX, SHOW_SYSTEM_NOTICE, SOUND_ACTIVE } from "../config/Config";
import { TimerManager } from "./TimerManager";
import { SoundManager } from "./SoundManager";



export default class PileManager
{
    removeAllHistory()
    {
        this.getAllCards().forEach(x => x.moveHistory = [])
    }

    removeAllHistoryExcept(c: Card)
    {
        this.getAllCards().forEach(card =>
        {
            if (card !== c)
            {
                card.moveHistory = [];
            }
        });
    }

    getCompletedFoundationCount(): number
    {
        return this.foundationPiles.filter(pile => pile.length === 13).length;
    }


    static substackId: number = 0;


    gameManager: GameManager;



    private tableauPiles: Array<Array<Card>>;
    private foundationPiles: Array<Array<Card>>;
    private stockPile: Array<Card>;
    private transitionPile: Array<Card>;
    public tableuPilesYDelta: Array<number>;

    cardLayoutManager: CardLayoutManager;
    gameplayContainer: Phaser.GameObjects.Container;
    cardTransitionManager: CardTransitionManager;
    static foldYDelta: number = 1;
    distributeDisabled: boolean = false;
    public superModeActive: boolean = false;

    constructor(gameplayContainer: Phaser.GameObjects.Container, gameManager: GameManager)
    {

        this.initializeNormal(gameplayContainer, gameManager);

        this.cardLayoutManager = new CardLayoutManager();
        this.cardTransitionManager = new CardTransitionManager();
    }


    initializeNormal(gameplayContainer: Phaser.GameObjects.Container, gameManager: GameManager)
    {
        // Initialize empty tableau piles (10 in total)
        this.gameplayContainer = gameplayContainer;
        this.gameManager = gameManager;
        this.tableauPiles = Array.from({ length: 10 }, () => []);
        this.tableuPilesYDelta = Array.from({ length: 10 }, () => TABLEU_COORDS_DELTA.y)

        // Initialize empty foundation piles (8 in total, one per suit)
        this.foundationPiles = Array.from({ length: 8 }, () => []);

        this.stockPile = [];
        this.transitionPile = [];
    }

    public getTableuPileIndexFromCard(card: Card): number
    {
        return this.tableauPiles.findIndex(pile => pile.includes(card));
    }

    public getFoundationPileIndexFromCard(card: Card): number
    {
        return this.foundationPiles.findIndex(pile => pile.includes(card));
    }
    public isValidSubstack(card: Card): boolean
    {
        const substack = this.getSubstack(card);

        if (this.superModeActive)
        {
            return substack.every(c => c.isFaceUp || c.isBeingFlipped);
        }

        for (let i = 1; i < substack.length; i++)
        {
            const current = substack[i];
            const previous = substack[i - 1];

            if (
                getRankValue(current.rank) !== getRankValue(previous.rank) - 1 || // Must be descending
                current.suit !== previous.suit                                   // Must be the same suit
            )
            {
                return false;
            }
        }
        return true;
    }

    public toggleSuperMode(): boolean
    {
        this.superModeActive = !this.superModeActive;
        return this.superModeActive;
    }

    public isValidSubstackAnyColor(card: Card): boolean
    {
        const substack = this.getSubstack(card);

        for (let i = 1; i < substack.length; i++)
        {
            const current = substack[i];
            const previous = substack[i - 1];

            if (
                getRankValue(current.rank) !== getRankValue(previous.rank) - 1  // Must be descending

            )
            {
                return false;
            }
        }
        return true;
    }



    public getSubstack(card: Card): Card[]
    {
        if (card.isOnTableu() == false)
        {
            return [];
        }
        const tableuPile = this.tableauPiles[card.pileIndex]
        const startIndex = tableuPile.indexOf(card);
        const substack = tableuPile.slice(startIndex);
        return substack;
    }

    public removeSubstack(tableuPile: Card[], card: Card): void
    {
        tableuPile.splice(tableuPile.indexOf(card));
    }

    allCardsUncovered(): boolean
    {
        return this.tableauPiles.every(pile => pile.every(card => card.isFaceUp));
    }


    distributeStockPile()
    {
        if (this.distributeDisabled) return;

        // Check if any tableau pile is empty
        const hasEmptyPile = this.tableauPiles.some(pile => pile.length === 0);

        if (hasEmptyPile && SHOW_SYSTEM_NOTICE)
        {
            // Launch the SystemNoticeScene if any pile is empty
            this.gameManager.gameScene.scene.launch("SystemNoticeScene").bringToTop("SystemNoticeScene");
            return; // Exit the function to prevent dealing cards
        } else if (hasEmptyPile)
        {
            return;
        }

        // Ensure there are enough cards in the stock to distribute
        if (this.stockPile.length < 10)
        {
            console.warn("Not enough cards in the stock to distribute.");
            return;
        }

        this.distributeDisabled = true;

        setTimeout(() =>
        {
            this.distributeDisabled = false;
        }, DISABLE_STOCK_DISTRIBUTION);

        // Loop through each tableau pile with a delay for each card
        for (let i = 0; i < 10; i++)
        {

            setTimeout(() =>
            {
                const card = this.stockPile.pop(); // Remove the card from the top of the stock
                if (card)
                {
                    card.setFaceUp(false)
                    card.isBeingFlipped = true
                    // card.setFaceUp(true); // Cards dealt from the stock are face-up
                    setTimeout(() =>
                    {
                        card.flip()
                        card.isBeingFlipped = false
                        // this.cardTransitionManager.flipCard(card, 1)
                    }, TABLEU_STACK_TWEEN_DURATION * 0.4);

                    this.addCardToTableuPile(card, i, false, 'Linear.none', true); // Add card directly to tableau pile
                }

                // If it's the last card, save the game state
                if (i === 9)
                {
                    setTimeout(() =>
                    {
                        UndoManager.getInstance().saveState(this.getState());

                        // Dealing added a card to every pile, but addCardToTableuPile never
                        // recomputes the fold — re-fold all piles so tall columns compress
                        // instead of overflowing the board (same pattern as a sequence clear).
                        this.fixTableuYDeltaAll();
                        this.cardLayoutManager.layoutTableauPiles(this.getTableauPiles(), true);

                        TimerManager.setTimer(COMPLETE_SEQUENCE_DELAY, () =>
                        {
                            // this.distributeDisabled = false;
                            this.checkAndMoveCompletedSequences();
                        }, this);
                    }, 300);

                }
            }, 55 * i); // Delay increases by 30ms for each card
        }
    }




    private getValidSequenceLength(pile: Card[]): number
    {
        if (pile.length === 0) return 0;

        let length = 1; // Start with the last card
        for (let i = pile.length - 1; i > 0; i--)
        {
            const currentCard = pile[i];
            const previousCard = pile[i - 1];

            if (!previousCard.isFaceUp)
            {
                break;
            }

            // Check for descending rank and alternating color
            if (
                getRankValue(currentCard.rank) + 1 === getRankValue(previousCard.rank)
            )
            {
                length++;
            } else
            {
                break; // Sequence breaks here
            }
        }
        return length;
    }

    performMoveToTableuPile(card: Card, i: number, tableauPile: Card[], pileIndex: number): void
    {


        // Identify the substack starting from the clicked card to the end
        const substack = this.getSubstack(card);
        this.fixTableuYDelta(i, [...substack])
        this.cardLayoutManager.init(this)

        // Flip the card above the moved card if it exists and is face down

        if (tableauPile.length > substack.length)
        {

            const cardAbove = tableauPile[tableauPile.length - 1 - substack.length]; // The card now at the top of the pile

            if (!cardAbove.isFaceUp)
            {
                this.cardTransitionManager.flipCard(cardAbove, 120);  // Call the flip method to reveal the card
            }
        }

        this.cardLayoutManager.layoutTableauPile(this.tableauPiles, i, true)

        card.substackid = PileManager.substackId++;
        // Move the substack to the new tableau pile using the transition manager
        substack.forEach((movingCard, subIndex) =>
        {
            movingCard.substackid = PileManager.substackId;
            this.addCardToTableuPile(movingCard, i);

        });

        // Remove the moved substack from the original pile
        this.removeSubstack(tableauPile, card)

        this.fixTableuYDelta(pileIndex)
        this.cardLayoutManager.init(this)
        this.cardLayoutManager.layoutTableauPile(this.tableauPiles, pileIndex, true)

        UndoManager.getInstance().saveState(this.getState())
        TimerManager.setTimer(COMPLETE_SEQUENCE_DELAY, () =>
        {
            this.checkAndMoveCompletedSequences();
        }, this);
        this.gameManager.controlManager.disableControlsForFoundation()

    }

    handleTableauClicked(card: Card): boolean
    {

        const pileIndex = card.pileIndex;

        // Initialize moveHistory if it doesn’t exist
        if (!card.moveHistory || card.moveHistory.length === 0)
        {
            card.moveHistory = [card.pileIndex];
        }

        if (pileIndex >= 0 && pileIndex < this.tableauPiles.length)
        {
            const tableauPile = this.tableauPiles[pileIndex];
            const sourceChainLength = this.getValidSequenceLength(tableauPile);
            const isCardTopOfChain = (tableauPile[tableauPile.length - sourceChainLength] === card);

            // List to collect all possible moves with visited/unvisited status
            let possibleMoves = [];

            // Step 2: Collect moves to tableau piles, marking each as visited/unvisited and empty/nonempty
            for (let i = 0; i < this.tableauPiles.length; i++)
            {
                if (i !== pileIndex)
                {
                    const targetPile = this.tableauPiles[i];
                    const isEmpty = targetPile.length == 0;
                    const topCard = targetPile[targetPile.length - 1];
                    const isSameSuit = topCard ? topCard.suit === card.suit : true;
                    const sourceEmpty = (card == this.tableauPiles[pileIndex][0]);


                    if (isEmpty && sourceEmpty) continue;

                    if (this.canMoveToTableauPile(card, targetPile))
                    {
                        possibleMoves.push({
                            type: "tableau",
                            index: i,
                            visited: card.moveHistory.includes(i),
                            empty: isEmpty, // Mark if the tableau pile is empty,
                            sameSuit: isSameSuit,
                            sourceEmpty: sourceEmpty,
                            execute: () =>
                            {
                                this.performMoveToTableuPile(card, i, tableauPile, pileIndex);
                                card.moveHistory.push(i); // Track the target pile after the move
                            }
                        });
                    }
                }
            }

            card.moveHistory = this.removeIfMoveNotPossible(card.moveHistory, possibleMoves, pileIndex);



            // possibleMoves = this.filterSameSuitMoves(possibleMoves);



            possibleMoves.sort((a, b) =>
            {
                // 1. Unvisited tableau piles have higher priority than visited ones
                if (a.type === "tableau" && b.type === "tableau")
                {
                    const getTopCard = (pileIndex: number): Card | null =>
                        this.tableauPiles[pileIndex].length > 0
                            ? this.tableauPiles[pileIndex][this.tableauPiles[pileIndex].length - 1]
                            : null;

                    const aTopCard = a.index !== undefined ? getTopCard(a.index) : null;
                    const bTopCard = b.index !== undefined ? getTopCard(b.index) : null;

                    // Helper function to determine if cards are of the same suit
                    const isSameSuit = (card1: Card | null, card2: Card | null): boolean =>
                        card1 !== null && card2 !== null && card1.suit === card2.suit;

                    const aSameSuit = isSameSuit(card, aTopCard);
                    const bSameSuit = isSameSuit(card, bTopCard);
                    // 🔥 **NEW RULE: Always prioritize unvisited empty tableau moves**
                    if (!a.visited && a.empty && b.visited) return -1;
                    if (!b.visited && b.empty && a.visited) return 1;

                    // // Prioritize same suit over empty piles
                    // if (aSameSuit && b.empty) return -1;
                    // if (bSameSuit && a.empty) return 1;

                    // Prioritize unvisited piles
                    if (!a.visited && b.visited) return -1;
                    if (!b.visited && a.visited) return 1;

                    // Within unvisited, prioritize same suit
                    if (!a.visited && !b.visited)
                    {
                        if (aSameSuit && !bSameSuit) return -1;
                        if (bSameSuit && !aSameSuit) return 1;

                        // If both have the same suit or neither does, compare sequence length
                        if (a.index !== undefined && b.index !== undefined)
                        {
                            const aSequenceLength = this.getValidSequenceLength(this.tableauPiles[a.index]);
                            const bSequenceLength = this.getValidSequenceLength(this.tableauPiles[b.index]);

                            if (aSequenceLength !== bSequenceLength)
                            {
                                return bSequenceLength - aSequenceLength; // Prioritize longer sequence
                            }

                            // Compare pile sizes
                            const aPileSize = this.tableauPiles[a.index].length;
                            const bPileSize = this.tableauPiles[b.index].length;
                            return aPileSize - bPileSize; // Prioritize shorter pile
                        }
                    }

                    // For visited piles, prioritize same suit
                    if (a.visited && b.visited)
                    {

                        // Prioritize by move history
                        const aHistoryIndex = card.moveHistory.indexOf(a.index);
                        const bHistoryIndex = card.moveHistory.indexOf(b.index);
                        return aHistoryIndex - bHistoryIndex; // Prioritize earliest visited
                    }
                    if (a.empty && !b.empty) return 1;
                    if (!a.empty && b.empty) return -1;
                }

                // If one pile is empty and the other isn't, empty pile gets lower priority
                return 0
            });




            // Execute the best move if available
            // Execute the best move if available
            if (possibleMoves.length > 0)
            {
                const movedCard = possibleMoves[0]; // The card being moved

                // Identify the source pile before moving
                const sourcePile = this.tableauPiles[pileIndex];
                const movedCardIndex = sourcePile.indexOf(card);

                // Check if there is a card directly underneath the moved card
                if (movedCardIndex > 0)
                {
                    const uncoveredCard = sourcePile[movedCardIndex - 1]; // Card that will be uncovered





                    // If the uncovered card is the same suit as the moving card, delete move history
                    if (uncoveredCard.suit === card.suit && uncoveredCard.isFaceUp == false && getRankValue(card.rank) + 1 == getRankValue(uncoveredCard.rank))
                    {

                        card.moveHistory = []; // Reset history so the next move search is fresh
                    }
                }

                this.removeAllHistoryExcept(card);
                movedCard.execute(); // Perform the move

                this.removeFirstDuplicateAndRotate(card.moveHistory);
                return true;
            }


        } else
        {
            console.warn("Invalid pile index");
        }
        return false;
    }

    private filterSameSuitMoves<T extends { sameSuit: boolean, empty: boolean, sourceEmpty?: boolean }>(possibleMoves: T[]): T[]
    {
        return possibleMoves.some(move => move.sameSuit)
            ? possibleMoves.filter(move => move.sameSuit || move.empty || (move.sourceEmpty ?? false))
            : possibleMoves;
    }
    removeIfMoveNotPossible(moveHistory: any[], possibleMoves: any[], pileIndex: unknown)
    {



        // Collect all valid indices: from possibleMoves and the current pileIndex
        const validIndices = new Set(
            possibleMoves.map((move: { index: any; }) => move.index)
        );
        validIndices.add(pileIndex); // Add the current pileIndex to valid indices


        // Filter the moveHistory to retain only valid indices
        for (let i = moveHistory.length - 1; i >= 0; i--)
        {
            if (!validIndices.has(moveHistory[i]))
            {
                moveHistory.splice(i, 1);
            }
        }


        return moveHistory;
    }


    removeFirstDuplicateAndRotate<T>(array: T[]): void
    {
        const seen = new Set<T>();
        let duplicateRemoved = false;

        for (let i = 0; i < array.length; i++)
        {
            const item = array[i];
            if (seen.has(item))
            {
                // Found the first duplicate, remove it
                array.splice(i, 1);
                duplicateRemoved = true;
                break; // Stop after removing the first duplicate
            }
            seen.add(item);
        }

        // If a duplicate was removed, move the first element to the last position
        if (duplicateRemoved && array.length > 0)
        {
            array.push(array.shift() as T);
        }
    }



    uncoverTableuPile(pileIndex: number)
    {

        // Retrieve the pile by index
        const tableauPile = this.tableauPiles[pileIndex];
        if (tableauPile && tableauPile.length > 0)
        {
            // Get the top card
            const topCard = tableauPile[tableauPile.length - 1];

            if (!topCard.isFaceUp)
            {
                this.cardTransitionManager.flipCard(topCard, 120);
                this.gameManager.incrementScore(5)
            }
        }
    }



    getTopStockCard(): Card | undefined
    {

        return this.stockPile[this.stockPile.length - 1];
    }

    getTopStockCards(num: number = 3): Card[]
    {
        const numberOfCardsToRetrieve = Math.min(num, this.stockPile.length);
        return this.stockPile.slice(-numberOfCardsToRetrieve);
    }

    // Distribute the deck into piles based on spider Solitaire rules
    distributeCardsToPiles(deck: Card[])
    {
        // Define the tableau piles structure for Spider Solitaire
        const tableauConfig = [6, 6, 6, 6, 5, 5, 5, 5, 5, 5]; // 10 piles

        // Loop through each pile and distribute cards
        for (let i = 0; i < tableauConfig.length; i++)
        {
            const cardsInPile = tableauConfig[i];
            for (let j = 0; j < cardsInPile; j++)
            {
                const card = deck.shift(); // Remove the card from the deck
                if (card)
                {
                    // Only the top card in each pile is face-up
                    card.setFaceUp(j === cardsInPile - 1);
                    this._addCardToTableau(card, i);
                }
            }
        }

        // Remaining cards go to the stock
        deck.forEach(card => this._addCardToStock(card));
    }
    sortDeckByRank(deck: Card[]): Card[]
    {
        return deck.sort((a, b) => a.rank - b.rank);
    }

    distributeCardsToPilesEndGame(deck: Card[])
    {
        // Define the suit order for foundation piles
        const suits: Suit[] = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
        deck = this.sortDeckByRank(deck)

        while (deck.length > 0)
        {
            const card = deck.shift(); // Take the top card from the deck
            if (!card) continue; // If by some reason there's no card, continue to the next iteration

            if ((card.rank === Rank.King || card.rank == Rank.Queen) && this.stockPile.length < 8)
            {
                // Place Kings and Queens in the stock pile
                // card.setFaceUp(false);  // Kings and Queens should be facedown in the stock
                this._addCardToStock(card)
            } else if (card.rank <= Rank.Jack)
            {
                // Check if the card can be placed in the foundation (i.e., is the next card in sequence)
                this._addCardToFoundation(card, card.suit)
            }
        }

        // Optionally shuffle the stock pile to prevent predictable outcomes
        // this.shufflePile(this.stockPile);
    }

    // Tableau Management


    getCardFromTableau(pileIndex: number, cardIndex: number): Card | undefined
    {
        return this.tableauPiles[pileIndex][cardIndex];
    }

    getTopCardFromTableau(pileIndex: number): Card | undefined
    {
        const pile = this.tableauPiles[pileIndex];
        return pile.length > 0 ? pile[pile.length - 1] : undefined;
    }



    drawCardFromStock(): Card | undefined
    {
        return this.stockPile.pop();
    }



    // Counting Cards in Piles
    countCardsInTableau(): number
    {
        return this.tableauPiles.reduce((count, pile) => count + pile.length, 0);
    }

    countCardsInFoundation(): number
    {
        return this.foundationPiles.reduce((count, pile) => count + pile.length, 0);
    }

    countCardsInStock(): number
    {
        return this.stockPile.length;
    }


    getTableauPiles(): Array<Array<Card>>
    {
        return this.tableauPiles;
    }

    getFoundationPiles(): Array<Array<Card>>
    {
        return this.foundationPiles;
    }

    getStockPile(): Card[]
    {
        return this.stockPile;
    }


    calculateTableuPileHeight(pileIndex: number, tabCoordsDeltaY: number, tabCoordsDeltaYCovered: number, substack: Card[] = [], extraSubstacks: number = 0): number
    {
        let targetPile = this.tableauPiles[pileIndex];
        let yPosition = TABLEU_COORDS_INIT.y;
        for (let i = 0; i < targetPile.length; i++)
        {
            if (targetPile[i].isFaceUp)
            {
                yPosition += tabCoordsDeltaY;
            } else
            {
                yPosition += tabCoordsDeltaYCovered;
            }
        }
        //
        for (let i = 0; i < substack.length; i++)
        {
            yPosition += tabCoordsDeltaY;

        }

        return yPosition;

    }

    fixTableuYDeltaAll()
    {

        //
        this.tableuPilesYDelta.forEach((x, i) => this.fixTableuYDelta(i, [], 50, 0));
    }



    fixTableuYDelta(pileIndex: number, substack: Card[] = [], maxTries: number = 50, extraSubstacks: number = 0, resetDeltaY: boolean = true): number
    {
        //
        //
        let tabCoordsDeltaY = TABLEU_COORDS_DELTA.y;
        if (GameManager.isMobile) tabCoordsDeltaY += TAB_DELTA_Y_MOBILE_EXTRA;
        if (resetDeltaY) this.tableuPilesYDelta[pileIndex] = tabCoordsDeltaY;
        maxTries--;
        if (maxTries <= 0) return this.tableuPilesYDelta[pileIndex];
        let height = this.calculateTableuPileHeight(pileIndex, this.tableuPilesYDelta[pileIndex], TABLEU_COORDS_DELTA.y_covered, substack, extraSubstacks) + 30;
        //
        let renderHeight = GameManager.rendererHeight

        if (GameManager.isMobile && GameManager.isPotrait) renderHeight *= 0.70;
        if (GameManager.isMobile && !GameManager.isPotrait) renderHeight *= 0.94; // mobile/tablet landscape: toolbar is on the side, more bottom space available
        if (!GameManager.isMobile) renderHeight *= 0.875; // desktop: reserve ~12.5% bottom margin so the fold fires above the bottom toolbar
        let x = (renderHeight - GameManager.gameplayContainerY - GameManager.gameplayContainerScale * height);




        if (x > 20 && this.tableuPilesYDelta[pileIndex] < tabCoordsDeltaY)
        {
            this.tableuPilesYDelta[pileIndex] = this.tableuPilesYDelta[pileIndex] + 1;
            return this.fixTableuYDelta(pileIndex, substack, maxTries, extraSubstacks, false); // maybe i messed up here?

        }
        else if (x < 0)
        {
            this.tableuPilesYDelta[pileIndex] = this.tableuPilesYDelta[pileIndex] - 1;
            return this.fixTableuYDelta(pileIndex, substack, maxTries, extraSubstacks, false);// maybe i messed up here?
        }
        else
        {

            return this.tableuPilesYDelta[pileIndex];
        }
    };



    getTableuCardsDeltaYForPile(pileIndex: number): number
    {

        return this.tableuPilesYDelta[pileIndex];
    }

    // Check if a card can be placed in the target tableau pile according to spider rules
    public canMoveToTableauPile(card: Card, targetPile: Array<Card>): boolean
    {
        if (this.superModeActive)
        {
            return true;
        }

        if (targetPile.length === 0)
        {
            return true
        }

        // Rule 2: Cards must be in descending order
        const topCard = targetPile[targetPile.length - 1];

        const isDescending = getRankValue(topCard.rank) === getRankValue(card.rank) + 1;

        return isDescending;
    }


    // Remove the card from whichever pile it currently belongs to
    private removeCardFromCurrentPile(card: Card): void
    {
        switch (card.pileType)
        {
            case PileType.Stock:
                this.stockPile = this.stockPile.filter(c => c !== card);
                break;
            case PileType.Foundation:
                const foundationPile = this.foundationPiles[card.pileIndex];
                this.foundationPiles[card.pileIndex] = foundationPile.filter(c => c !== card);
                break;
            case PileType.Tableau:
                const tableauPile = this.tableauPiles[card.pileIndex];
                this.tableauPiles[card.pileIndex] = tableauPile.filter(c => c !== card);
                break;
            case PileType.Transition:
                this.transitionPile = this.transitionPile.filter(c => c !== card);

        }
    }

    private addCardToPile(card: Card, pileType: PileType, pileIndex: number): void
    {
        // Remove the card from its current pile

        this.removeCardFromCurrentPile(card);

        // Add to the new pile
        card.setPileType(pileType);
        card.pileIndex = pileIndex;
        let newLen = 0;

        switch (pileType)
        {
            case PileType.Stock:
                newLen = this.stockPile.push(card);
                break;
            case PileType.Foundation:
                newLen = this.foundationPiles[pileIndex].push(card);
                break;
            case PileType.Tableau:
                newLen = pileIndex * 100 + this.tableauPiles[pileIndex].push(card) - 1;
                break;
        }

        if (card.inTransition) newLen += 20000;


        card.setDepth(newLen);


        //
        this.gameplayContainer.sort("depth");



    }

    public getState(): GameState
    {
        return {
            tableauPiles: this.getTableauPiles(),
            foundationPiles: this.getFoundationPiles(),
            stockPile: this.getStockPile(),
            flippedCounts: [],
            score: this.gameManager.getCurrentScore(),
            // tableuYDelta: [...this.tableuPilesYDelta],
            // Include other elements of the game state
        }
    }


    public addCardToTableuPile(card: Card, pileIndex: number, immediately: boolean = false, ease = 'Cubic.easeOut', skipSound: boolean = false): void
    {
        let targetPile = this.tableauPiles[pileIndex];


        this.cardTransitionManager.moveCardToTableau(
            this.getTableuCardsDeltaYForPile(pileIndex),
            this.getTableauPiles(),
            card,
            pileIndex,
            targetPile.length,
            this.gameplayContainer,
            () =>
            {
                this.removeCardFromTransition(card);
                this._addCardToTableau(card, pileIndex);
                this.fixTableuDepthAndFlipstatus()
                this.gameplayContainer.sort("depth");
                card.setScale(getCardScale())


            },
            immediately,
            ease,
            skipSound
        );


        this._addCardToTransition(card)
        this._addCardToTableau(card, pileIndex);
        card.setInteractive(false);

    }
    isCompleteSequence(cards: Card[]): boolean
    {
        return cards.every((card, index) =>
        {
            // 1) Check if card is face-up
            if (!card.isFaceUp)
            {
                return false;
            }

            // 2) Check the first card specifically (it should be a King)
            if (index === 0)
            {
                return getRankValue(card.rank) === 13;
            }

            // 3) For subsequent cards, verify "previous card rank = current card rank + 1" AND same suit
            const previousCard = cards[index - 1];
            return getRankValue(previousCard.rank) === getRankValue(card.rank) + 1 && previousCard.suit === card.suit;
        });
    }

    doesCompleteSequenceExist()
    {
        let complete: boolean = false;
        this.tableauPiles.forEach((pile, pileIndex) =>
        {
            const sequenceLength = 13;

            // You can't form a 13-card sequence if there aren't at least 13 cards
            if (pile.length < sequenceLength) return;

            // Get the last 13 cards
            const lastCards = pile.slice(-sequenceLength);

            // Check if the last 13 cards form a complete sequence
            const isCompleteSequence = this.isCompleteSequence(lastCards);

            // If all checks pass, move the sequence to the foundation
            if (isCompleteSequence)
            {
                console.log("complete exists")
                complete = true;
            }
        });

        return complete;
    }

    checkAndMoveCompletedSequences()
    {

        // Iterate through all tableau piles
        this.tableauPiles.forEach((pile, pileIndex) =>
        {
            const sequenceLength = 13;

            // You can't form a 13-card sequence if there aren't at least 13 cards
            if (pile.length < sequenceLength) return;

            // Get the last 13 cards
            const lastCards = pile.slice(-sequenceLength);

            // Check if the last 13 cards form a complete sequence
            const isCompleteSequence = this.isCompleteSequence(lastCards);

            // If all checks pass, move the sequence to the foundation
            if (isCompleteSequence)
            {


                // Find the first available foundation pile
                const foundationIndex = this.foundationPiles.findIndex(pile => pile.length === 0);

                if (foundationIndex !== -1)
                {
                    SOUND_ACTIVE && SoundManager.instance.clearSequence.play()

                    // Move each card in the completed sequence to the foundation
                    lastCards.forEach(card =>
                    {
                        this.addCardToFoundationPile(card, foundationIndex);
                    });

                    // Remove the completed sequence from the tableau pile
                    this.tableauPiles[pileIndex] = pile.slice(0, -sequenceLength);

                    this.fixTableuYDeltaAll()


                    this.cardLayoutManager.layoutTableauPile(this.tableauPiles, pileIndex, true)

                    // Save the updated game state
                    UndoManager.getInstance().saveState(this.getState());


                }
                else
                {
                    console.warn("No available foundation pile found for completed sequence.");
                }
            }
        });
    }




    public addCardToFoundationPile(card: Card, foundationIndex: number)
    {
        // Retrieve the target foundation pile using the provided index
        let targetPile: Card[] = this.foundationPiles[foundationIndex];


        // Call the transition manager to animate the card moving to the foundation pile
        this.cardTransitionManager.moveCardToFoundation(
            card,
            FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + foundationIndex * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX] * STOCK_FOUNDATION_SCALE, // X position of the foundation pile
            FOUNDATION_COORDS_INIT.y, // Y position of the foundation pile
            targetPile, // Depth in the pile
            targetPile.length,
            this.gameplayContainer,
            () =>
            {
                // Callback after the transition is complete
                this.removeCardFromTransition(card);
                this._addCardToFoundation(card, foundationIndex);
                this.fixFoundationLayering()
            }
        );

        // Add the card to the transition state to manage its state during the animation
        this._addCardToTransition(card);

        // Immediately add the card to the foundation pile to update the game state
        this._addCardToFoundation(card, foundationIndex);

        // Disable further interactions with the card as it is now in a foundation pile
        card.setInteractive(false);

        card.setScale(getCardScale() * STOCK_FOUNDATION_SCALE)
    }

    // Add a card to the foundation pile
    private _addCardToFoundation(card: Card, pileIndex: number)
    {
        this.addCardToPile(card, PileType.Foundation, pileIndex);

    }


    // Add a card to the tableau pile
    private _addCardToTableau(card: Card, pileIndex: number)
    {

        this.addCardToPile(card, PileType.Tableau, pileIndex);
    }


    // Add a card to the stock pile
    private _addCardToStock(card: Card)
    {
        this.addCardToPile(card, PileType.Stock, 0); // Only one stock pile
    }

    // Add a card to the stock pile
    private _addCardToTransition(card: Card)
    {
        card.inTransition = true;
    }

    removeCardFromTransition(card: Card)
    {
        card.inTransition = false;
    }

    listTableauCardsWithDepthAndName(listOnlyFaceUp: boolean)
    {

        this.tableauPiles.forEach((pile, pileIndex) =>
        {

            pile.forEach((card) =>
            {
                const depth = card.depth; // Assuming `depth` is a property on Card
                const name = card.getName(); // Assuming `getName` is a method on Card
                const isfaceup = card.isFaceUp;
                if (listOnlyFaceUp && isfaceup)
                {

                }
                else if (!listOnlyFaceUp)
                {

                }

            });
        });

    }

    listTransitionCardsWithDepthAndName()
    {
        this.transitionPile.forEach(card =>
        {
            const depth = card.depth; // Assuming `depth` is a property on Card
            const name = card.getName(); // Assuming `getName` is a method on Card
            const isfaceup = card.isFaceUp;


        })
    }

    setToGameState(state: GameState): void
    {
        this.gameManager.setScore(state.score)

        this.clearPiles();


        // Rearrange cards according to the saved state
        state.tableauPiles.forEach((pile, pileIndex) =>
        {
            pile.forEach(card => this.addCardToPile(card, PileType.Tableau, pileIndex));
            this.fixTableuYDelta(pileIndex);
        });
        state.foundationPiles.forEach((pile, pileIndex) =>
        {
            pile.forEach(card => this.addCardToPile(card, PileType.Foundation, pileIndex));
        });
        state.stockPile.forEach(card =>
        {

            this.addCardToPile(card, PileType.Stock, 0);
        });
        this.applyFlippedCounts(state.flippedCounts)

        // this.fixTableuYDeltaAll()

        this.gameManager.layoutManager.layoutAll(this)
        // this.gameManager.layoutManager.layoutTableauPiles(this.gameManager.pileManager.getTableauPiles())
        this.fixTableuDepthAndFlipstatus()
        // this.fixTableuYDeltaAll()
    }

    fixTableuDepthAndFlipstatus()
    {
        for (var i = 0; i < 10; i++)
        {
            let c = this.getTopCardFromTableau(i);
            if (c?.isFaceUp == false && c?.isBeingFlipped == false)
            {
                c.setFaceUp(true);
            }

        }
        this.fixTableuDepth()
    }
    fixFoundationLayering()
    {
        this.getFoundationPiles().forEach(pile =>
        {
            pile.forEach((card, index) =>
            {
                if (card.inTransition == false)
                {

                    card.setDepth(getRankValue(card.rank))
                    if (card.rank == Rank.Ace) card.setDepth(100);

                }
            })
            pile.sort((a, b) => a.depth - b.depth);
        })

        this.gameplayContainer.sort("depth");
    }

    private applyFlippedCounts(flippedCounts: number[]): void
    {
        this.tableauPiles.forEach((pile, index) =>
        {
            const count = flippedCounts[index] || 0; // Get the count of face-up cards or default to 0
            let faceUpCount = 0;
            // Traverse the pile from the top (end of the array) downwards
            for (let i = pile.length - 1; i >= 0; i--)
            {
                if (faceUpCount < count)
                {
                    // pile[i].isFaceUp = true;
                    pile[i].setFaceUp(true)
                    faceUpCount++;
                } else
                {
                    pile[i].setFaceUp(false); // Ensure cards above the last face-up are facedown if needed
                }
            }
        });
    }

    private clearPiles(): void
    {
        // Clear the arrays but keep the card objects in memory
        this.tableauPiles.forEach(pile => pile.length = 0);
        this.foundationPiles.forEach(pile => pile.length = 0);
        this.stockPile.length = 0;
    }

    fixTableuDepth()
    {
        this.getTableauPiles().forEach((pile, pileindex) =>
        {
            pile.forEach((c, index) =>
            {
                if (!c.isBeingFlipped && !c.inTransition && c.depth < 1000)
                {
                    c.setDepth(100 * pileindex + index);
                }

            })
        })
    }

    getAllCards(): Card[]
    {
        // Combine all the piles into a single array
        return [
            ...this.stockPile,
            ...this.transitionPile,
            ...this.tableauPiles.flat(),
            ...this.foundationPiles.flat()
        ];
    }

    // Additional utility methods like checking game rules, validating moves, etc.
}
