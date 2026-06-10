import { RIGHT_HANDED_MODE_IDX, SOUND_ACTIVE } from '../config/Config';
import { CARD_SCALE, getCardScale, PileType, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, TABLEU_STACK_TWEEN_DURATION, TABLEU_TABLUEU_TWEEN_DURATION } from '../config/Consts';
import Card from '../elements/Card'; // Adjust import path as needed
import { getTweensForObject } from '../utils/Utils';
import { Rank } from './CardNameManager';
import { SoundManager } from './SoundManager';

class CardTransitionManager
{


    private scene: Phaser.Scene;

    constructor() { }


    moveCardToTableau(tab_deltaY: number, tableuPiles: Card[][], card: Card, targetPileIndex: number, indexWithinTargetPile: number, container: Phaser.GameObjects.Container, onComplete: () => void, immediately: boolean = false, ease = 'Cubic.easeOut', skipSound = false)
    {
        let duration = TABLEU_STACK_TWEEN_DURATION
        if (ease == 'Cubic.easeOut') duration = TABLEU_TABLUEU_TWEEN_DURATION
        if (immediately)
        {
            duration = 10
        }
        card.setInteractive(false); // Temporarily disable interaction during the movement
        getTweensForObject(card.scene, card).forEach(x => x.complete());
        !skipSound && SOUND_ACTIVE && SoundManager.instance.valid.play()

        // Calculate the correct y position for the card based on the pile state
        let yPosition = TABLEU_COORDS_INIT.y;
        const targetPile = tableuPiles[targetPileIndex]; // Assuming tableauPiles is available from pileManager


        targetPile.filter(card => card.inTransition).forEach(c =>
        {
            if (card.substackid != c.substackid)
            {
                getTweensForObject(c.scene, c).forEach(x => x.complete());
            }
        });

        for (let i = 0; i < indexWithinTargetPile; i++)
        {
            if (targetPile[i].isFaceUp)
            {
                yPosition += tab_deltaY;
            } else
            {
                yPosition += TABLEU_COORDS_DELTA.y_covered;
            }
        }

        // Tween to move the card to the new pile visually
        card.scene.tweens.add({
            targets: card,
            x: TABLEU_COORDS_INIT.x + TABLEU_COORDS_DELTA.x * targetPileIndex,
            y: yPosition,
            scale: getCardScale(),
            duration: duration, // Adjust as necessary
            ease: ease,
            onComplete: () =>
            {
                // Enable interaction and call the completion callback
                card.setInteractive(true);
                card.x = TABLEU_COORDS_INIT.x + TABLEU_COORDS_DELTA.x * targetPileIndex;
                card.y = yPosition;
                onComplete();
                //
            }
        });

        card.setDepth(10000 + indexWithinTargetPile);
        container.sort("depth");
    }

    moveWithTween(card: Card, x: number, y: number)
    {
        if (card.x == x && card.y == y) return;
        if (card.hasTweens()) card.finishTweens()
        card.scene.tweens.add({
            targets: card,
            x: x,
            y: y,
            duration: TABLEU_STACK_TWEEN_DURATION / 4, // Adjust as necessary
            ease: 'Cubic.easeOut',
        });
    }

    moveWithoutTween(card: Card, x: number, y: number)
    {
        card.finishTweens();
        card.x = x;
        card.y = y;
    }

    // Move a card to the foundation with a visual transition
    moveCardToFoundation(card: Card, targetX: number, targetY: number, foundationPile: Card[], pileIndex: number, gameplayContainer: Phaser.GameObjects.Container, onComplete?: () => void)
    {
        // Temporarily disable interaction during the transition
        card.setInteractive(false);
        // getTweensForObject(card.scene, card).forEach(x => x.complete());


        SOUND_ACTIVE && SoundManager.instance.cardToFoundation.play()
        // Create a tween to move the card visually to the foundation pile
        card.scene.tweens.add({
            targets: card,
            x: targetX,
            y: targetY,
            duration: TABLEU_STACK_TWEEN_DURATION - 2, // Adjust as needed
            ease: 'Cubic.easeOut',
            onComplete: () =>
            {

                card.x = targetX;
                card.y = targetY

                // Optionally, call additional completion logic
                if (onComplete) onComplete();

                // Re-enable interaction
                card.setInteractive(true);
                card.setFaceUp(true)


            }
        });
        card.setDepth(12000);
        if (card.rank == Rank.Ace) card.setDepth(13000)
        gameplayContainer.sort("depth");
    }




    // Flip the card with animation (from back to front or vice versa)
    flipCard(card: Card, duration: number = 300, onComplete?: () => void)
    {


        if (card.isBeingFlipped) return;
        card.isBeingFlipped = true;
        card.scene.tweens.add({
            targets: card,
            scaleX: 0, // Shrink to zero width to simulate a flip
            duration: duration / 2,
            onComplete: () =>
            {
                // Swap textures and then expand back to normal size
                card.scaleX = 0;
                card.flip();

                card.scene.tweens.add({
                    targets: card,
                    scaleX: getCardScale(),
                    duration: duration / 2,
                    onComplete: () =>
                    {
                        if (onComplete) onComplete();
                        card.isBeingFlipped = false;
                        card.scaleX = getCardScale();
                    }
                });
            }
        });
    }


}

export default CardTransitionManager;
