/**
 * Trading Logic implementation based on the recursive matrix formula
 * found in the 'algo (DONT DELETE)' sheet of the Excel file.
 */

interface MatrixState {
    [key: string]: number;
}

export class TradingLogic {
    private memo: MatrixState = {};
    private totalTrades: number;
    private targetWins: number;
    private multiplier: number;

    constructor(totalTrades: number, targetWins: number, multiplier: number) {
        this.totalTrades = totalTrades;
        this.targetWins = targetWins;
        this.multiplier = multiplier;
    }

    /**
     * Calculates the factor for a given node in the decision tree.
     * @param tradeIndex (i) Current trade index (0-based)
     * @param winsReached (x) Number of wins achieved so far
     */
    public getFactor(tradeIndex: number, winsReached: number): number {
        const winsNeeded = this.targetWins - winsReached;
        const tradesLeft = this.totalTrades - tradeIndex;

        const key = `${tradeIndex}-${winsReached}`;
        if (this.memo[key] !== undefined) return this.memo[key];

        let result: number;

        if (winsNeeded <= 0) {
            result = 1;
        } else if (winsNeeded > tradesLeft) {
            result = 0;
        } else if (winsNeeded === tradesLeft) {
            result = Math.pow(this.multiplier, winsNeeded);
        } else {
            // Recursive calculation based on the formula: 
            // (m * valBelow * valDiagonal) / (valBelow + (m - 1) * valDiagonal)
            const valBelow = this.getFactor(tradeIndex + 1, winsReached);
            const valDiagonal = this.getFactor(tradeIndex + 1, winsReached + 1);

            if (valBelow === 0 && valDiagonal === 0) {
                result = 0;
            } else {
                result = (this.multiplier * valBelow * valDiagonal) / (valBelow + (this.multiplier - 1) * valDiagonal);
            }
        }

        this.memo[key] = result;
        return result;
    }

    /**
     * Calculates the trade amount based on the current portfolio and factor.
     * Formula: (1 - m * f(i+1, nextWin) / (f(i+1, current) + (m - 1) * f(i+1, nextWin))) * portfolio
     */
    public getTradeAmount(tradeIndex: number, winsReached: number, currentPortfolio: number): number {
        const tradesLeft = this.totalTrades - tradeIndex;
        const winsNeeded = this.targetWins - winsReached;

        if (winsNeeded <= 0 || winsNeeded > tradesLeft) return 0;

        const fBelow = this.getFactor(tradeIndex + 1, winsReached);
        const fDiagonal = this.getFactor(tradeIndex + 1, winsReached + 1);

        // If fBelow is 0, it means a loss results in failure. 
        // We must win this trade to stay on path, so we bet everything needed to reach fDiagonal.
        if (fBelow === 0) {
            return currentPortfolio;
        }

        const ratio = (this.multiplier * fDiagonal) / (fBelow + (this.multiplier - 1) * fDiagonal);
        const tradeAmount = (1 - ratio) * currentPortfolio;

        return Math.max(0.01, Math.round(tradeAmount * 100) / 100);
    }
}
