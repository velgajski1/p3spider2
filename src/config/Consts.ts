import { GameManager } from "../managers/GameManager";

export const BACKGROUND_COLORS = [
    '#417652',
    '#367a37', '#37864f', '#226632', '#014001', '#3b403c',
    '#3d444e', '#575759', '#7b5f4a', '#4d5e72', '#616d95',
    '#42678e', '#2d5f80', '#3b7aa6', '#008080', '#2b8063',
    '#428e7f', '#5a8495', '#8a8697', '#b1aeae'
];

// Define a new constant for stat labels
export const STAT_LABELS = {
    GamesPlayed: 'Games Played',
    GamesWon: 'Games Won',
    GamesLost: 'Games Lost',
    WinPercentage: 'Win Percentage',
    CurrentWinStreak: 'Current Win Streak',
    LongestWinStreak: 'Longest Win Streak',
    AverageTime: 'Avg. Time/Game',
    TopScore: 'Top Score',
    BestTime: 'Best Time',
};

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
export const TAB_DELTA_Y_MOBILE_EXTRA = 15;
export const STOCK_FOUNDATION_SCALE = 0.8;
