import { SOUND_ACTIVE } from "../config/Config";
import Card from "../elements/Card";
import { GameState } from "../utils/types";
import getRankValue from "./CardNameManager";
import { GameManager } from "./GameManager";
import HintManager from "./HintManager";
import { SoundManager } from "./SoundManager";
import statsManager from "./StatsManager";

export default class UndoManager
{

    private static instance: UndoManager | null = null;
    private states: GameState[] = [];
    public enabled = true;
    private static scene: Phaser.Scene;
    static gameManager: GameManager;

    private constructor() { }

    public static init(scene: Phaser.Scene, gameManager: GameManager): void
    {
        if (!UndoManager.instance)
        {
            UndoManager.instance = new UndoManager();
            UndoManager.scene = scene;
            SoundManager.init(scene);
            UndoManager.gameManager = gameManager;
        }
    }

    public static getInstance(): UndoManager
    {
        if (!UndoManager.instance)
        {
            throw new Error("UndoManager is not initialized. Call UndoManager.init(scene) first.");
        }
        return UndoManager.instance;
    }

    static removeInstance()
    {
        this.instance = null;
    }

    disableUndo()
    {
        this.enabled = false;
    }

    enableUndo()
    {
        this.enabled = true;
    }

    public saveState(state: GameState): void
    {

        const copiedState = this.deepCopyState(state);
        const lastState = this.states[this.states.length - 1];
        const totalCards = this.countTotalCards(copiedState);

        // Check if there are completed sequences
        const hasCompletedStack = copiedState.tableauPiles.some(pile =>
        {
            const sequenceLength = 13;
            if (pile.length < sequenceLength) return false;

            // Get the last 13 cards
            const lastCards = pile.slice(-sequenceLength);

            // Check if the last 13 cards form a complete sequence
            return lastCards.every((card, index) =>
            {
                if (!card.isFaceUp) return false; // All cards must be face-up

                if (index === 0)
                {
                    return getRankValue(card.rank) === 13; // First card must be a King
                }

                const previousCard = lastCards[index - 1];
                return (
                    getRankValue(previousCard.rank) === getRankValue(card.rank) + 1 &&
                    previousCard.suit === card.suit
                );
            });
        });

        if (totalCards == 104 && !hasCompletedStack && (!lastState || !this.areStatesEqual(lastState, copiedState)))
        {



            this.states.push(copiedState);

            HintManager.getInstance().clearHints();

            if (this.states.length > 1)
            {
                UndoManager.gameManager.incrementMoves()
            }
        } else if (hasCompletedStack)
        {
            setTimeout(() =>
            {
                UndoManager.gameManager.extrascore++
            }, 350);
        }
    }

    private deepCopyState(state: GameState): GameState
    {



        const tableauPiles = state.tableauPiles.map(pile => [...pile]);
        const foundationPiles = state.foundationPiles.map(pile => [...pile]);
        const stockPile = [...state.stockPile];
        const score = state.score;
        // const tableuYDelta = state.tableuYDelta;



        const flippedCounts = tableauPiles.map(pile =>
            pile.reduce((count, card) => count + (card.isFaceUp ? 1 : 0), 0)
        );

        return {
            tableauPiles,
            foundationPiles,
            stockPile,
            flippedCounts,
            score,
        };
    }

    private countTotalCards(state: GameState): number
    {
        return state.tableauPiles.flat().length +
            state.foundationPiles.flat().length +
            state.stockPile.length
    }

    private areStatesEqual(state1: GameState, state2: GameState): boolean
    {

        if (state1.tableauPiles.length !== state2.tableauPiles.length ||
            state1.foundationPiles.length !== state2.foundationPiles.length ||
            state1.stockPile.length !== state2.stockPile.length)
        {

            return false;
        }

        const comparePiles = (pile1: Card[], pile2: Card[]) =>
        {
            return pile1.length === pile2.length && pile1.every((card, index) =>
                card.suit === pile2[index].suit &&
                card.rank === pile2[index].rank &&
                card.isFaceUp === pile2[index].isFaceUp
            );
        };

        for (let i = 0; i < state1.tableauPiles.length; i++)
        {
            if (!comparePiles(state1.tableauPiles[i], state2.tableauPiles[i]))
            {
                return false;
            }
        }

        for (let i = 0; i < state1.foundationPiles.length; i++)
        {

            if (!comparePiles(state1.foundationPiles[i], state2.foundationPiles[i]))
            {
                return false;
            }
        }

        if (!comparePiles(state1.stockPile, state2.stockPile))
        {
            return false;
        }

        return true;
    }

    public undo(): GameState | null
    {

        if (!this.enabled) return null;



        if (this.states.length > 1)
        {

            this.states.pop();
            const prevState = this.states[this.states.length - 1];

            HintManager.getInstance().clearHints();
            SOUND_ACTIVE && SoundManager.instance.undo.play();
            UndoManager.gameManager.incrementMoves()

            return prevState;
        }
        return null;
    }

    undoFully(): GameState | null
    {
        HintManager.getInstance().clearHints();
        if (UndoManager.gameManager.getElapsedTime() > 0)
        {
            statsManager.updateStatsAfterGame(false, UndoManager.gameManager.getCurrentScore(), UndoManager.gameManager.getElapsedTime())
        }

        this.states = this.states.slice(0, 1);
        return this.states[0];
    }
}
