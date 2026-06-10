import PileManager from './PileManager';
import Card from '../elements/Card';
import { HINT_NEXT_OVERLAY_DELTA, PileType } from '../config/Consts';
import getRankValue, { Rank, Suit } from './CardNameManager';
import CardLayoutManager from './CardLayoutManager';
import { SoundManager } from './SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

type Hint = {
    key: string;
    first: () => void;
    second: () => void;
}


export default class HintManager
{
    private static instance: HintManager;
    pileManager: PileManager;
    hints: Hint[];
    lastHintIndex: number;
    layoutManager: CardLayoutManager;
    secondTimer: NodeJS.Timeout;


    private constructor()
    {
        this.hints = [];
        this.lastHintIndex = -1;
        // this.layoutManager = this.pileManager.cardLayoutManager;
    }

    // Static method to control the access to the singleton instance
    public static getInstance(): HintManager
    {
        if (!HintManager.instance)
        {
            HintManager.instance = new HintManager();
        }
        return HintManager.instance;
    }

    /**
     * Returns `true` if the substack starting at `card` is NOT
     * the entire top chain of descending, same-suit, face-up cards.
     *
     * i.e., There's some card above it (face-up or face-down)
     * that is not part of the same chain -- so effectively "blocked".
     */
    /**
     * Returns true if there's at least one card above the start
     * of this substack — i.e., substack is "blocked" by something.
     *
     * If substack starts at index 0, there's nothing above it => false.
     * If substack starts at index > 0, it's blocked => true.
     */
    private isSubstackBlocked(pile: Card[], card: Card): boolean
    {
        const cardIndex = pile.indexOf(card);
        return (cardIndex > 0);
    }

    /**
     * Returns `true` if the largest valid top chain in `pile` does *not* start at 0.
     * i.e. at least one card in the pile is below that chain, possibly face-down or mismatch.
     */
    private isTopChainBlocked(pile: Card[]): boolean
    {
        if (pile.length === 0) return false; // empty pile not relevant
        const earliest = this.findEarliestIndexOfTopChain(pile);
        // If earliest is 0, entire pile is valid => not blocked
        // If earliest > 0, that chain is blocked by something below it
        return (earliest > 0);
    }

    /**
     * Finds the earliest index `i` in `pile` such that cards[i..(pile.length-1)]
     * form a contiguous, face-up, strictly descending-in-rank chain
     * ignoring suit (e.g. 7♠ -> 6♥ -> 5♦ -> 4♠).
     *
     * If the entire pile is valid (7–6–5–4 from index 0..3), returns 0.
     * If only part is valid, returns the earliest index of that top chain.
     * If there's no valid chain at all (e.g. top is face-down), returns -1.
     *
     * Example:
     *   Pile top is at pile.length-1.
     *   If 7–6–5–4 are consecutive ranks, face-up, you get earliest=0.
     *   If the top chain is only 6–5–4 (7 is face-down or not consecutive),
     *     you might get earliest=1, etc.
     */
    private findEarliestIndexOfTopChainAnySuit(pile: Card[]): number
    {
        if (pile.length === 0) return -1;

        let start = pile.length - 1;  // Start from the very top card

        // Traverse upward (i goes downward in index) while each next-lower card is:
        // 1) face-up
        // 2) rank exactly +1 above the card below
        // (Ignoring suit)
        for (let i = pile.length - 2; i >= 0; i--)
        {
            const below = pile[i + 1];
            const above = pile[i];

            // must be face-up
            if (!below.isFaceUp || !above.isFaceUp)
            {
                break;
            }
            // must be descending rank
            if (getRankValue(above.rank) !== getRankValue(below.rank) + 1)
            {
                break;
            }

            // valid => extend chain upward
            start = i;
        }

        return start;
    }



    /**
     * Given a pile of Cards (where the *top* card is at index pile.length-1),
     * find the earliest index `i` such that cards[i..(pile.length-1)] form
     * one contiguous, face-up, same-suit, strictly-descending chain to the top.
     *
     * Returns that `i`.
     * If the top card itself is face-down or no valid chain at all, it might return `pile.length - 1`.
     * If the entire pile is a valid chain, it returns 0.
     */
    private findEarliestIndexOfTopChain(pile: Card[]): number
    {
        if (pile.length === 0) return -1;

        let start = pile.length - 1;  // begin at the top

        // scan upward (i goes downward) as long as each "above" card is face-up,
        // same suit, rank exactly +1 of the card below it
        for (let i = pile.length - 2; i >= 0; i--)
        {
            const below = pile[i + 1];
            const above = pile[i];

            // must be face-up
            if (!below.isFaceUp || !above.isFaceUp)
            {
                break;
            }
            // must match suit
            if (below.suit !== above.suit)
            {
                break;
            }
            // must be rank exactly 1 less
            if (getRankValue(above.rank) !== getRankValue(below.rank) + 1)
            {
                break;
            }

            // if we get here, 'above->below' is valid => extend chain upward
            start = i;
        }

        return start;
    }



    isUsefulMove(card: Card, sourceIndex: number, targetIndex: number): boolean
    {
        // return true
        const sourcePile = this.pileManager.getTableauPiles()[sourceIndex];
        const targetPile = this.pileManager.getTableauPiles()[targetIndex];
        const targetCard: Card = targetPile[targetPile.length - 1];
        const belowCard = sourcePile[sourcePile.indexOf(card) - 1];
        if (sourcePile.length < 2 || belowCard == null)
        {
            if (targetPile.length == 0) return false;
            return true;
        }

        // Condition a: Card below is turned/uncovered
        if (!belowCard.isFaceUp || !this.pileManager.isValidSubstackAnyColor(belowCard))
        {

            return true;
        }

        return false;
    };

    private isCompleteKingToAceSequence(cards: Card[]): boolean
    {
        // Must be exactly 13 cards
        if (cards.length !== 13) return false;

        // The topmost should be face-up and a King
        if (!cards[0].isFaceUp || getRankValue(cards[0].rank) !== 13)
        {
            return false;
        }

        // Check each subsequent card for descending rank and same suit, and face-up
        for (let i = 1; i < 13; i++)
        {
            const prev = cards[i - 1];
            const current = cards[i];

            // Must be face-up
            if (!current.isFaceUp) return false;

            // Must be descending rank (Q=12 below K=13, J=11 below Q=12, etc)
            if (getRankValue(prev.rank) !== getRankValue(current.rank) + 1)
            {
                return false;
            }

            // Must be the same suit
            if (prev.suit !== current.suit)
            {
                return false;
            }
        }

        return true;
    }
    private addFoundationSequenceHints(): boolean
    {
        let foundOne = false;

        for (let i = 0; i < 10; i++)
        {
            const tableauPile = this.pileManager.getTableauPiles()[i];
            // We only check if there's enough cards for a 13-sequence
            if (tableauPile.length >= 13)
            {
                // Get the last 13 cards
                const substack = tableauPile.slice(-13);

                // Check if these 13 cards form a valid K->A sequence
                if (this.isCompleteKingToAceSequence(substack))
                {
                    // Next, see if we have an empty foundation pile
                    // (the "foundationIndex" is how PileManager picks an available pile)
                    const foundationIndex = this.findEmptyFoundationPileIndex();
                    if (foundationIndex !== -1)
                    {
                        foundOne = true;
                        // We'll highlight that substack + highlight the foundation
                        // You can adapt the "hint" style to match your existing usage
                        this.hints.push({
                            key: `found`,
                            first: () =>
                            {
                                // Highlight each of the 13 cards in that substack,
                                // or highlight only the top card, etc:
                                substack.forEach(c => this.hintTableuCard(c));
                            },
                            second: () =>
                            {
                                // If you have a method that highlights the foundation area:
                                this.hintFoundation(foundationIndex);
                            }
                        });
                    }
                }
            }
        }

        return foundOne;
    }

    /**
     * Example method for finding any empty foundation pile index.
     * If your code is different, adapt accordingly.
     */
    private findEmptyFoundationPileIndex(): number
    {
        const foundations = this.pileManager.getFoundationPiles();
        // For Spider, you typically want the first 8 foundation piles:
        for (let i = 0; i < foundations.length; i++)
        {
            if (foundations[i].length === 0)
            {
                return i;
            }
        }
        return -1;
    }

    /**
     * If you want to highlight the foundation pile:
     */
    private hintFoundation(index: number)
    {
        // highlight foundation area,
        // or do something visually to say “move cards here”
    }

    /**
   * Counts how many consecutive, face-up, same-suit, strictly descending cards
   * exist from the top card downward in the given pile.
   *
   * e.g., if a pile ends with [7♠, 6♠, 5♠, 4♠], this returns 4.
   */
    private countLongestValidDescendingChainFromTop(pile: Card[]): number
    {
        if (pile.length === 0) return 0;

        let count = 1; // at least the top card
        for (let i = pile.length - 1; i > 0; i--)
        {
            const current = pile[i];
            const above = pile[i - 1];
            // must be face-up, same suit, exactly 1 rank higher
            if (
                current.isFaceUp &&
                above.isFaceUp &&
                above.suit === current.suit &&
                getRankValue(above.rank) === getRankValue(current.rank) + 1
            )
            {
                count++;
            } else
            {
                break;
            }
        }
        return count;
    }

    /**
     * Returns how many cards form a valid descending chain in `targetPile`
     * AFTER we place `substack` on top.
     */
    private getFinalChainLengthAfterMove(targetPile: Card[], substack: Card[]): number
    {
        const combined = [...targetPile, ...substack];
        return this.countLongestValidDescendingChainFromTop(combined);
    }

    /**
     * Returns true if, starting at `card`, the substack from there
     * to the end of the pile is strictly descending in rank (face-up),
     * *ignoring* suit.
     *
     * e.g. 10♠, 9♥, 8♦ is allowed if they are all face-up
     * and 10->9->8 is descending in rank.
     */
    private isValidSubstackAnySuit(card: Card, pile: Card[]): boolean
    {
        // Find this card’s index:
        const index = pile.indexOf(card);
        if (index < 0) return false;

        // For each consecutive pair from index..(pile.length-2)
        for (let i = index; i < pile.length - 1; i++)
        {
            const current = pile[i];
            const next = pile[i + 1];
            // Both must be face-up
            if (!current.isFaceUp || !next.isFaceUp)
            {
                return false;
            }
            // Must be exactly 1 rank lower
            if (getRankValue(current.rank) !== getRankValue(next.rank) + 1)
            {
                return false;
            }
        }
        return true;
    }

    /**
     * Similar to canMoveToTableauPile, but ignoring suit checks.
     *
     * If the target pile is empty, we can move anything. If not empty,
     * we only require topCard.rank == movingCard.rank + 1 (ignore suit).
     */
    private canMoveToTableauPileAnySuit(card: Card, targetPile: Card[]): boolean
    {
        if (targetPile.length === 0)
        {
            // Usually any card can move to empty in many spider variants, or maybe only King, etc.
            // Adjust if your rules differ.
            return true;
        }
        const topCard = targetPile[targetPile.length - 1];
        return (getRankValue(topCard.rank) === getRankValue(card.rank) + 1);
    }

    private findEarliestIndexOfTopChainSameSuit(pile: Card[]): number
    {
        if (pile.length === 0) return -1;

        let start = pile.length - 1;  // top card index
        for (let i = pile.length - 2; i >= 0; i--)
        {
            const below = pile[i + 1];
            const above = pile[i];

            if (!below.isFaceUp || !above.isFaceUp) break;
            // Must be same suit
            if (below.suit !== above.suit) break;
            // Must be rank exactly 1 less
            if (getRankValue(above.rank) !== getRankValue(below.rank) + 1)
            {
                break;
            }

            start = i;
        }
        return start;
    }

    private addAnySuitTableauMoveHints(ignoreuseful: boolean = false): void
    {
        const anySuitMoves: {
            card: Card;
            fromIndex: number;
            toIndex: number;
            priority: number;
        }[] = [];

        // For each tableau pile
        for (let i = 0; i < 10; i++)
        {
            const sourcePile = this.pileManager.getTableauPiles()[i];

            // We'll find the earliest index of the top chain that is SAME SUIT
            // (since your existing isValidSubstack enforces same suit)
            const earliestIndex = this.findEarliestIndexOfTopChainSameSuit(sourcePile);
            if (earliestIndex < 0)
            {
                // Means no valid same-suit chain from top
                continue;
            }

            // The card at earliestIndex is the topmost same-suit substack
            const card = sourcePile[earliestIndex];
            if (!card.isFaceUp) continue;
            // Must pass your existing isValidSubstack
            if (!this.pileManager.isValidSubstack(card))
            {
                continue;
            }

            // Attempt to move that substack onto another tableau ignoring suit for the target
            for (let k = 0; k < 10; k++)
            {
                if (k === i) continue; // skip same pile

                let useful = this.isUsefulMove(card, i, k) || ignoreuseful;

                const targetPile = this.pileManager.getTableauPiles()[k];
                if (
                    this.canMoveToTableauPileAnySuit(card, targetPile) &&
                    useful
                )
                {
                    // Low priority
                    const priority = 1;
                    anySuitMoves.push({
                        card,
                        fromIndex: i,
                        toIndex: k,
                        priority
                    });
                }
            }
        }

        // Sort and add them
        anySuitMoves.sort((a, b) => b.priority - a.priority);
        for (const move of anySuitMoves)
        {
            this.hints.push({
                key: `${move.card}-${move.toIndex}`,
                first: () => this.hintTableuCard(move.card),
                second: () => this.hintTableu(move.toIndex)
            });
        }
    }





    private addTableauMoveHints(ignoreUseful: boolean = false): void
    {
        const possibleMoves: {
            card: Card;
            fromIndex: number;
            toIndex: number;
            priority: number;
        }[] = [];

        // Loop over each tableau pile as a "source"
        for (let i = 0; i < 10; i++)
        {
            const sourcePile = this.pileManager.getTableauPiles()[i];

            // 1) Measure how big the *current* descending chain is at the top of the source
            const sourceChainLenBefore = this.countLongestValidDescendingChainFromTop(sourcePile);

            // For each card in that pile...
            for (let j = 0; j < sourcePile.length; j++)
            {
                const card = sourcePile[j];

                // Must be face-up and a valid substack start
                if (card.isFaceUp && this.pileManager.isValidSubstack(card))
                {
                    // The group of cards we propose moving
                    const substack = this.pileManager.getSubstack(card);

                    // Attempt moves to every OTHER tableau
                    for (let k = 0; k < 10; k++)
                    {
                        if (k === i) continue; // skip same pile

                        const targetPile = this.pileManager.getTableauPiles()[k];

                        // 2) Check if we can move to the target
                        if (this.pileManager.canMoveToTableauPile(card, targetPile))
                        {
                            if (!this.isBeneficialHintMove(card, sourcePile, targetPile))
                            {
                                continue;
                            }

                            // --- (A) Measure chain length we *gain* on the target
                            const finalChainLenOnTarget = this.getFinalChainLengthAfterMove(targetPile, substack);

                            // --- (B) Hypothetically remove substack from source,
                            //     then measure if that "unblocks" the source in any way
                            //
                            //     This simply slices the pile from 0..j (excluding the substack)
                            //     If your rules also flip a newly uncovered card face-up, you’d factor that in here.
                            const hypotheticalSource = sourcePile.slice(0, j);
                            const sourceChainLenAfter = this.countLongestValidDescendingChainFromTop(hypotheticalSource);

                            // Some difference or "gain" from removing that top substack
                            const sourceChainGain = sourceChainLenAfter - sourceChainLenBefore;

                            // If we *only* want moves that actually help on either side,
                            // skip if both improvements are zero or negative:
                            if (finalChainLenOnTarget <= sourceChainLenBefore && sourceChainGain <= 0)
                            {
                                continue;
                            }

                            // --- (C) Compute a combined priority
                            //     We'll pass both finalChainLenOnTarget and sourceChainGain into a custom method.
                            const priority = this.calculateMovePriority(
                                card,
                                i,
                                k,
                                finalChainLenOnTarget,
                                sourceChainGain
                            );

                            possibleMoves.push({
                                card,
                                fromIndex: i,
                                toIndex: k,
                                priority
                            });
                        }
                    }
                }
            }
        }

        // Sort moves by priority descending
        possibleMoves.sort((a, b) => b.priority - a.priority);

        // Add them to the hints array in that order
        for (const move of possibleMoves)
        {
            this.hints.push({
                key: `${move.card.getInfo()}-${move.toIndex}`,
                first: () => this.hintTableuCard(move.card),
                second: () => this.hintTableu(move.toIndex)
            });
        }
    }






    /**
     * Example priority calculator that gives top priority to moves
     * that involve the largest possible substack. Optionally,
     * add extra bonus if the substack is same-suit, etc.
     */
    /**
     * @param finalChainLenOnTarget The length of the chain at the target if we move the substack
     * @param sourceChainGain       How many cards we "free up" or how many extra valid chain links appear on the source once removed
     */
    private calculateMovePriority(
        card: Card,
        fromIndex: number,
        toIndex: number,
        finalChainLenOnTarget: number,
        sourceChainGain: number
    ): number
    {
        const substack = this.pileManager.getSubstack(card);
        const substackSize = substack.length;

        // Weighted formula, for example:
        //
        //   - We heavily reward a big final chain on the target
        //   - We add smaller reward for substack size itself
        //   - We also add some reward (or penalty) for unblocking the source
        //
        let priority = (finalChainLenOnTarget * 100) + substackSize;

        // If you want to *reward* unblocking, do something like:
        // e.g. each card unblocked is worth +50
        priority += sourceChainGain * 50;

        return priority;
    }


    /**
     * Returns true if the substack extends all the way to the top
     * of `pile` (the last card in the substack is the last card in the pile).
     */
    private substackGoesToTop(pile: Card[], substack: Card[]): boolean
    {
        if (substack.length === 0) return false;
        const lastCardInSubstack = substack[substack.length - 1];
        const lastCardInPile = pile[pile.length - 1];
        return lastCardInSubstack === lastCardInPile;
    }


    private addEmptyTableauMoveHints(ignoreuseful: boolean = false): void
    {
        const emptyMoves: {
            card: Card;
            fromIndex: number;
            toIndex: number;
            priority: number;
        }[] = [];

        for (let i = 0; i < 10; i++)
        {
            const sourcePile = this.pileManager.getTableauPiles()[i];

            // If not blocked, skip
            if (!this.isTopChainBlocked(sourcePile))
            {
                continue;
            }

            // The earliest index of the top chain
            const earliest = this.findEarliestIndexOfTopChain(sourcePile);
            if (earliest < 0) continue; // no valid chain at all

            // The card at that index
            const card = sourcePile[earliest];
            // If the substack is valid, we try to move it
            if (!this.pileManager.isValidSubstack(card))
            {
                continue;
            }

            // Attempt to move that entire top chain to an empty pile
            for (let k = 0; k < 10; k++)
            {
                if (k === i) continue;

                let usefull = this.isUsefulMove(card, i, k) || ignoreuseful;

                const targetPile = this.pileManager.getTableauPiles()[k];
                if (targetPile.length === 0)
                {
                    // It's empty; check if it's a legit move
                    if (
                        this.pileManager.canMoveToTableauPile(card, targetPile) &&
                        usefull
                    )
                    {
                        // Low priority
                        const priority = 11;

                        emptyMoves.push({
                            card,
                            fromIndex: i,
                            toIndex: k,
                            priority
                        });
                    }
                }
            }
        }

        // Sort, then push into hints
        emptyMoves.sort((a, b) => b.priority - a.priority);
        for (const move of emptyMoves)
        {
            this.hints.push({
                key: `${move.card.getInfo()}-${move.toIndex}`,
                first: () => this.hintTableuCard(move.card),
                second: () => this.hintTableu(move.toIndex)
            });
        }
    }

    private filterDuplicateHints(): void
    {
        const seen = new Set<string>();
        this.hints = this.hints.filter((hint: Hint) =>
        {
            if (seen.has(hint.key))
            {
                return false;
            }
            seen.add(hint.key);
            return true;
        });
    }

    /**
     * Returns true if moving the given card from its source pile to the target pile
     * is beneficial—in other words, if the moving card is built on its natural base
     * (e.g. an 8 built on a 9) then only moving it to a target pile where the top card
     * is the ideal card (e.g. a 9 of the same suit as the 8) is considered to advance the game.
     *
     * For example, for an 8♥ that sits on any 9, moving it onto a 9 that is not a 9♥
     * is redundant and will be filtered out.
     *
     * @param card The moving card.
     * @param sourcePile The tableau pile from which the card is moving.
     * @param targetPile The candidate target tableau pile.
     * @returns true if the move is beneficial, false if it should be filtered out.
     */
    private isBeneficialHintMove(card: Card, sourcePile: Card[], targetPile: Card[]): boolean
    {
        const cardIndex = sourcePile.indexOf(card);
        // Only check if there is a card beneath the moving card
        if (cardIndex > 0)
        {
            const baseCard = sourcePile[cardIndex - 1];
            // Calculate the expected rank (if card is 8, expected is 9, etc.)
            const expectedRank = getRankValue(card.rank) + 1;

            // If the moving card is built on its natural base (e.g. a 9 underneath)
            if (getRankValue(baseCard.rank) === expectedRank)
            {
                // If the target pile isn’t empty, examine its top card.
                if (targetPile.length > 0)
                {
                    const destTopCard = targetPile[targetPile.length - 1];
                    // If the destination top card is of the expected rank...
                    if (getRankValue(destTopCard.rank) === expectedRank)
                    {
                        // ...but its suit does not match the moving card’s suit,
                        // then moving here doesn’t help build an in-suit sequence.

                        if (destTopCard.suit != card.suit)
                        {

                            return false; // Filter out this hint candidate.
                        }
                    }
                }
            }
        }
        return true;
    }



    generateHints(pileManager: PileManager)
    {
        this.pileManager = pileManager;
        this.hints = [];

        // 1) Highest: foundation sequences
        const foundationHintsFound = this.addFoundationSequenceHints();
        if (foundationHintsFound)
        {
            this.hints = this.hints.reverse();
            return;
        }

        // 2) Normal same-suit chain-building moves
        this.addTableauMoveHints();

        // 3) Then, any-suit descending moves (lowest priority)
        this.addAnySuitTableauMoveHints();

        // 4) Blocked substack to empty
        this.addEmptyTableauMoveHints();

        // 5) Finally, ignore move usefulness here
        this.addEmptyTableauMoveHints(true);

        this.addTableauMoveHints(true);

        // 3) Then, any-suit descending moves (lowest priority)
        // this.addAnySuitTableauMoveHints(true);

        this.filterDuplicateHints();



        // If no hints
        if (this.hints.length === 0)
        {
            // this.hints.push('No hints available');
        }
    }



    hintTableuCard(tableauTopCard: Card)
    {
        let substack: Card[] = this.pileManager.getSubstack(tableauTopCard);
        substack.forEach((c, i) =>
        {
            c.startHintAnim(0)

            if (i < substack.length - 1)
            {
                let cNextY: number = substack[i + 1].y;
                let yDelta = cNextY - c.y

                c.startHintAnim(yDelta)
            }
        })

    }
    hintTableu(k: number)
    {
        let tabPile = this.pileManager.getTableauPiles()[k];
        if (tabPile.length <= 0)
        {
            this.pileManager.cardLayoutManager.hintTabIdx(k)
        }
        else
        {
            this.pileManager.getTopCardFromTableau(k)?.startHintAnim(0)
        }
    }

    clearHints()
    {

        this.hints = [];
        this.lastHintIndex = -1;
        if (this.pileManager)
        {
            this.pileManager.getAllCards().forEach(c => c.cancelHintAnim())
            this.layoutManager = this.pileManager.cardLayoutManager
        }
        if (this.layoutManager)
        {
            this.layoutManager.removeHintTimer()
            this.layoutManager.removeHintOutline()

        }
        if (this.secondTimer)
        {
            clearTimeout(this.secondTimer)
        }

    }

    // Provide hints to the player
    getHint(pileManager: PileManager): void
    {
        // Generate hints if none exist
        if (this.hints.length === 0)
        {
            this.generateHints(pileManager);
        }

        // Cycle through hints
        if (this.hints.length == 0 && this.pileManager.countCardsInStock() == 0)
        {
            SOUND_ACTIVE && SoundManager.instance.noHint.play();
            return;
        }
        else if (this.hints.length == 0 && this.pileManager.countCardsInStock() > 0)
        {
            this.pileManager.getTopStockCard()?.startHintAnim(0)
            SOUND_ACTIVE && SoundManager.instance.hint.play();
            return;
        }
        this.lastHintIndex = (this.lastHintIndex + 1) % this.hints.length;



        const hint = this.hints[this.lastHintIndex];
        hint.first()

        SOUND_ACTIVE && SoundManager.instance.hint.play();

        const blinkInterval = HINT_NEXT_OVERLAY_DELTA // Total duration divided by double the number of blinks

        this.secondTimer = setTimeout(() =>
        {
            hint.second()
        }, blinkInterval);



    }
}
