export enum PileType
{
    Tableau = 'Tableau',
    Foundation = 'Foundation',
    Stock = 'Stock',
    Transition = 'Transition'
}

export const getCardScale = () =>
{
    // Replace `condition` with your actual condition logic

    if (innerWidth > innerHeight)
    {
        return CARD_SCALE_SMALLER_SCREEN; // Return a smaller scale for specific cases
    } else
    {
        return CARD_SCALE; // Default scale
    }
};


export const CARD_SCALE = 0.56;
export const CARD_SCALE_SMALLER_SCREEN = 0.56

export const COMPLETE_SEQUENCE_DELAY = 400;

export const STOCK_COORDS = { x: [-488, 430], y: 80 };
export const STOCK_COORDS_DELTA_X = 13;
export const TABLEU_COORDS_INIT = { x: STOCK_COORDS.x[0] + 10, y: 220 }
export const TABLEU_COORDS_DELTA = { x: 106, y: 27, y_covered: 14 }
export const FOUNDATION_COORDS_INIT = { x: [STOCK_COORDS.x[0] + 380, STOCK_COORDS.x[1] - 321], y: 80 }
export const FOUNDATION_COORDS_DELTA = { x: [106, -106], y: 0 }
// export const CARD_MOVE_BEFORE_DRAG_ACTIVE = 2;
export const CARD_MOVE_BEFORE_DRAG_ACTIVE = 0.1;
// export const CARD_MOVE_BEFORE_DRAG_AND_DROP = 30;
export const CARD_MOVE_BEFORE_DRAG_AND_DROP = 40;
export const TABLEU_STACK_TWEEN_DURATION = 150;
export const TABLEU_TABLUEU_TWEEN_DURATION = 300;
export const DISABLE_CLICK_DURATION_NORMAL = 40
export const DISABLE_CLICK_DURATION_STOCK = 20;
export const DISABLE_STOCK_DISTRIBUTION = 800;
export const TABLEU_FOLD_HEIGHT = 700;
export const FOLD_PIXELS_RATE = 20;
export const HINT_OVERLAY_DURATION = 600
export const HINT_NEXT_OVERLAY_DELTA = 250;
export const HINT_ALPHA = 0.25;
export const HINT_ALPHA_FOUNDATION_EMPTY = 0.40; // wood-friendly hint variant (empty tableau/foundation)
export const TAB_DELTA_Y_MOBILE_EXTRA = 15;
export const STOCK_FOUNDATION_SCALE = 0.8;
