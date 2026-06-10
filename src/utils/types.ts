import Card from "../elements/Card";

export interface GameState
{
    tableauPiles: Card[][];
    foundationPiles: Card[][];
    stockPile: Card[];
    flippedCounts: number[]; // Array to hold the number of flipped cards per tableau pile
    score: number; //
    // tableuYDelta : number[];
}
