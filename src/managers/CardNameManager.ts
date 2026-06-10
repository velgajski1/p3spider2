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
    public loadCardData(frames: any[]): void {
        frames.forEach((frame) => {
            const match = frame.filename.match(/cards\/(\w+)_(\w+)\.png/);

            if (match) {
                const [_, suitStr, rankStr] = match;
            // Get Suit index from the enum
            const suitKey = suitStr[0].toUpperCase() + suitStr.slice(1);

            let suitIndex: number | undefined = undefined;

            if (suitKey in Suit) {
                suitIndex = Suit[suitKey as keyof typeof Suit] as number;
            }

            // Get Rank index from the enum
            let rankKey = rankStr[0].toUpperCase() + rankStr.slice(1);
         
            let rankIndex: number | undefined = undefined;

            // Check if the rank is a numeric string (2 to 10)
            const numericRank = parseInt(rankKey, 10);
            if (!isNaN(numericRank)) {
                // Directly map numeric ranks (2 to 10)
                rankIndex = numericRank - 2; // Zero-based index starting from 2
            } else if (rankKey in Rank) {
                // Directly map face card ranks and Ace using enum
                rankIndex = Rank[rankKey as keyof typeof Rank] as number;
            }
            

            if (suitIndex !== undefined && rankIndex !== undefined) {
                this.cardNames[suitIndex][rankIndex] = `${suitStr}_${rankStr}`;
            }

            }
        });
    }

    // Get a card name by suit and rank
    public getCardName(suit: Suit, rank: Rank): string {
        return this.cardNames[suit][rank];
    }
}

// Export the CardManager class for use in other files
export { CardNameManager as CardNameManager, Suit, Rank };
