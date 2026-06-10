// Enums for Suit and Rank
enum Suit {
    Clubs,
    Diamonds,
    Hearts,
    Spades
}

enum Rank {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace
}

export default function getRankValue(rank: Rank): number {
    const rankValues: { [key in Rank]: number } = {
        [Rank.Two]: 2,
        [Rank.Three]: 3,
        [Rank.Four]: 4,
        [Rank.Five]: 5,
        [Rank.Six]: 6,
        [Rank.Seven]: 7,
        [Rank.Eight]: 8,
        [Rank.Nine]: 9,
        [Rank.Ten]: 10,
        [Rank.Jack]: 11,
        [Rank.Queen]: 12,
        [Rank.King]: 13,
        [Rank.Ace]: 1 // Ace is usually 1 in Solitaire
    };
    return rankValues[rank];
}

// CardManager class definition
class CardNameManager {
    private cardNames: string[][];
    private static instance: CardNameManager | null = null;

    constructor() {
        // Initialize a 2D array for all suits and ranks
        this.cardNames = [
            new Array(Object.keys(Rank).length / 2),
            new Array(Object.keys(Rank).length / 2),
            new Array(Object.keys(Rank).length / 2),
            new Array(Object.keys(Rank).length / 2)
        ];
    }

    public static get Instance(): CardNameManager {
        if (!this.instance) {
            this.instance = new CardNameManager();
        }
        return this.instance;
    }

    // Load card data and populate the cardNames array
    // Expects new naming: c2..c10, ca, cj, cq, ck (and d/h/s variants). Backside is card-back.png.
    public loadCardData(frames: any[]): void {
        const suitMap: { [key: string]: Suit } = {
            c: Suit.Clubs, d: Suit.Diamonds, h: Suit.Hearts, s: Suit.Spades,
        };
        const rankMap: { [key: string]: Rank } = {
            '2': Rank.Two, '3': Rank.Three, '4': Rank.Four, '5': Rank.Five,
            '6': Rank.Six, '7': Rank.Seven, '8': Rank.Eight, '9': Rank.Nine,
            '10': Rank.Ten, 'a': Rank.Ace, 'j': Rank.Jack, 'q': Rank.Queen, 'k': Rank.King,
        };

        frames.forEach((frame) => {
            const match = frame.filename.match(/^([cdhs])(10|[2-9]|[ajqk])\.png$/i);
            if (!match) return;
            const suitStr = match[1].toLowerCase();
            const rankStr = match[2].toLowerCase();
            const suitIndex = suitMap[suitStr];
            const rankIndex = rankMap[rankStr];
            if (suitIndex !== undefined && rankIndex !== undefined) {
                this.cardNames[suitIndex][rankIndex] = `${suitStr}${rankStr}`;
            }
        });
    }

    // Get a card name by suit and rank, e.g. 'c10', 'ca', 'sj'.
    public getCardName(suit: Suit, rank: Rank): string {
        return this.cardNames[suit][rank];
    }
}

// Export the CardManager class for use in other files
export { CardNameManager as CardNameManager, Suit, Rank };
