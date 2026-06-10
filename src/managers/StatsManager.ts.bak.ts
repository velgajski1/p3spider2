class StatsManager {
    private static instance: StatsManager;
    private _gamesPlayed: number;
    private _gamesWon: number;
    private _winsInARow: number;
    private _topScore: number;
    private _bestTime: number; // Stored in seconds
    private _currentWinStreak: number;
    private _longestWinStreak: number;
    private _isGameActive: boolean;
    private _currentScore: number;
    private _currentTimePlayed: number; // Stored in seconds

    private constructor() {
        this._gamesPlayed = this._getStatFromLocalStorage('gamesPlayed', 0);
        this._gamesWon = this._getStatFromLocalStorage('gamesWon', 0);
        this._winsInARow = this._getStatFromLocalStorage('winsInARow', 0);
        this._topScore = this._getStatFromLocalStorage('topScore', 0);
        this._bestTime = this._getStatFromLocalStorage('bestTime', 0); // Stored in seconds
        this._currentWinStreak = this._getStatFromLocalStorage('currentWinStreak', 0);
        this._longestWinStreak = this._getStatFromLocalStorage('longestWinStreak', 0);
        this._isGameActive = this._getStatFromLocalStorage('isGameActive', false);
        this._currentScore = this._getStatFromLocalStorage('currentScore', 0);
        this._currentTimePlayed = this._getStatFromLocalStorage('currentTimePlayed', 0);

        if (this._isGameActive) {
            // If a game was active, mark it as a loss due to refresh
            this.updateStatsAfterGame(false, this._currentScore, this._currentTimePlayed);
        }
    }

    public static getInstance(): StatsManager {
        if (!StatsManager.instance) {
            StatsManager.instance = new StatsManager();
        }
        return StatsManager.instance;
    }

    // Getter and Setter for games played
    get gamesPlayed(): number {
        return this._gamesPlayed;
    }

    set gamesPlayed(value: number) {
        this._gamesPlayed = value;
        this._saveStatToLocalStorage('gamesPlayed', value);
    }

    // Getter and Setter for games won
    get gamesWon(): number {
        return this._gamesWon;
    }

    set gamesWon(value: number) {
        this._gamesWon = value;
        this._saveStatToLocalStorage('gamesWon', value);
    }

    // Getter and Setter for wins in a row
    get winsInARow(): number {
        return this._winsInARow;
    }

    set winsInARow(value: number) {
        this._winsInARow = value;
        this._saveStatToLocalStorage('winsInARow', value);
    }

    // Getter and Setter for top score
    get topScore(): number {
        return this._topScore;
    }

    set topScore(value: number) {
        this._topScore = value;
        this._saveStatToLocalStorage('topScore', value);
    }

    // Getter and Setter for best time in seconds
    get bestTime(): number {
        return this._bestTime;
    }

    set bestTime(value: number) {
        const timeInSeconds = value;
        this._bestTime = timeInSeconds;
        this._saveStatToLocalStorage('bestTime', timeInSeconds);
    }

    // Getter for current win streak
    get currentWinStreak(): number {
        return this._currentWinStreak;
    }

    set currentWinStreak(value: number) {
        this._currentWinStreak = value;
        this._saveStatToLocalStorage('currentWinStreak', value);
    }

    // Getter for longest win streak
    get longestWinStreak(): number {
        return this._longestWinStreak;
    }

    // Derived statistics
    get winPercentage(): number {
        return this._gamesPlayed > 0 ? parseFloat(((this._gamesWon / this._gamesPlayed) * 100).toFixed(1)) : 0;
    }

    // Utility methods
    private _getStatFromLocalStorage<T>(key: string, defaultValue: T): T {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    }

    private _saveStatToLocalStorage(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    private _isValidTimeFormat(time: string): boolean {
        return /^(\d{2}):(\d{2}):(\d{2})$/.test(time);
    }

    public _formatTime(seconds: number): string {
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    public _parseTime(time: string): number {
        if (!this._isValidTimeFormat(time)) {
            throw new Error("Invalid time format. Use 'hh:mm:ss'.");
        }
        const [h, m, s] = time.split(':').map(Number);
        return h * 3600 + m * 60 + s;
    }

    // Methods to update statistics based on game outcomes
    public updateStatsAfterGame(isWin: boolean, score: number, time: number): void {
        this.gamesPlayed += 1;

        if (isWin) {
            this.gamesWon += 1;
            this.currentWinStreak += 1;

            if (this._currentWinStreak > this._longestWinStreak) {
                this._longestWinStreak = this._currentWinStreak;
                this._saveStatToLocalStorage('longestWinStreak', this._longestWinStreak);
            }

            const timeInSeconds = time;
            if (timeInSeconds < this._bestTime || this._bestTime === 0) {
                this.bestTime = timeInSeconds;
            }
        } else {
            this.currentWinStreak = 0;
        }

        if (score > this._topScore) {
            this.topScore = score;
        }

        // Reset active game state
        this._isGameActive = false;
        this._currentScore = 0;
        this._currentTimePlayed = 0;
        this._saveStatToLocalStorage('isGameActive', this._isGameActive);
        this._saveStatToLocalStorage('currentScore', this._currentScore);
        this._saveStatToLocalStorage('currentTimePlayed', this._currentTimePlayed);
    }

    // Method to reset all stats
    public resetStats(): void {
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.winsInARow = 0;
        this.topScore = 0;
        this.bestTime = 0; // Reset in seconds
        this.currentWinStreak = 0;
        this._longestWinStreak = 0;
        this._isGameActive = false;
        this._currentScore = 0;
        this._currentTimePlayed = 0;

        // Clear local storage
        localStorage.removeItem('gamesPlayed');
        localStorage.removeItem('gamesWon');
        localStorage.removeItem('winsInARow');
        localStorage.removeItem('topScore');
        localStorage.removeItem('bestTime');
        localStorage.removeItem('currentWinStreak');
        localStorage.removeItem('longestWinStreak');
        localStorage.removeItem('isGameActive');
        localStorage.removeItem('currentScore');
        localStorage.removeItem('currentTimePlayed');
    }

    // Method to start a game
    public startGame(): void {
        this._isGameActive = true;
        this._currentScore = 0;
        this._currentTimePlayed = 0;
        this._saveStatToLocalStorage('isGameActive', this._isGameActive);
        this._saveStatToLocalStorage('currentScore', this._currentScore);
        this._saveStatToLocalStorage('currentTimePlayed', this._currentTimePlayed);
    }

    // Method to update the current game score and time played
    public updateCurrentGame(score: number, timePlayed: number): void {
        if (this._isGameActive) {
            this._currentScore = score;
            this._currentTimePlayed = timePlayed;
            this._saveStatToLocalStorage('currentScore', this._currentScore);
            this._saveStatToLocalStorage('currentTimePlayed', this._currentTimePlayed);
        }
    }

    // Method to log all stats to the console
    public logAllStats(): void {
        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // 
        // 
    }
}

// Export a singleton instance
const statsManager = StatsManager.getInstance();
export default statsManager;
