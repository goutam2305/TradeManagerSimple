class TradingLogic {
    constructor(totalTrades, targetWins, multiplier) {
        this.memo = {};
        this.totalTrades = totalTrades;
        this.targetWins = targetWins;
        this.multiplier = multiplier;
    }

    getFactor(tradeIndex, winsReached) {
        const winsNeeded = this.targetWins - winsReached;
        const tradesLeft = this.totalTrades - tradeIndex;

        const key = `${tradeIndex}-${winsReached}`;
        if (this.memo[key] !== undefined) return this.memo[key];

        let result;

        if (winsNeeded <= 0) {
            result = 1;
        } else if (winsNeeded > tradesLeft) {
            result = 0;
        } else if (winsNeeded === tradesLeft) {
            result = Math.pow(this.multiplier, winsNeeded);
        } else {
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

    getTradeAmount(tradeIndex, winsReached, currentPortfolio) {
        const tradesLeft = this.totalTrades - tradeIndex;
        const winsNeeded = this.targetWins - winsReached;

        if (winsNeeded <= 0 || winsNeeded > tradesLeft) return 0;

        const fBelow = this.getFactor(tradeIndex + 1, winsReached);
        const fDiagonal = this.getFactor(tradeIndex + 1, winsReached + 1);

        const ratio = (this.multiplier * fDiagonal) / (fBelow + (this.multiplier - 1) * fDiagonal);
        const tradeAmount = (1 - ratio) * currentPortfolio;

        return Math.max(0, tradeAmount);
    }
}

const logic = new TradingLogic(10, 4, 1.8);
console.log("Algo Node (1, 0) [N3 in Excel]:", logic.getFactor(1, 0));
console.log("Algo Node (1, 1) [O3 in Excel]:", logic.getFactor(1, 1));
console.log("Trade Amount (0, 0) [C3 in Excel]:", logic.getTradeAmount(0, 0, 100));
