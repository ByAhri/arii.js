import { extract, ratio } from "fuzzball";

export class Utils {
    // Static property (class-level data)
    private static version = "1.0.3";

    static get getVersion() {
        return Utils.version;
    };

    shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Finds the most similar string from an array of strings
     * @param target The target string to compare.
     * @param candidates An array of candidate strings to search.
     * @param threshold Minimum similarity score to consider a match (default: 50).
     * @returns The most similar string and its score, or null if no match is found.
     */
    static findMostSimilar(target: string, candidates: string[], threshold: number = 50): { match: string, score: number } | null {
        const normalize = (value: string) => value
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, " ")
            .trim();

        const targetNormalized = normalize(target);
        const targetTokens = targetNormalized.split(/\s+/).filter(Boolean);

        if (!targetNormalized) return null;

        let bestMatch: { match: string, score: number } | null = null;

        for (const candidate of candidates) {
            const candidateNormalized = normalize(candidate);
            if (!candidateNormalized) continue;

            const candidateTokens = candidateNormalized.split(/\s+/).filter(Boolean);
            let score = ratio(targetNormalized, candidateNormalized);

            if (targetNormalized === candidateNormalized) {
                score = 100;
            } else {
                const includesBonus = targetNormalized.includes(candidateNormalized) || candidateNormalized.includes(targetNormalized)
                    ? 18
                    : 0;

                const sharedTokens = targetTokens.filter(token => candidateTokens.includes(token));
                const tokenOverlap = targetTokens.length && candidateTokens.length
                    ? (sharedTokens.length / Math.max(targetTokens.length, candidateTokens.length)) * 30
                    : 0;
                const wordBonus = sharedTokens.length * 12;
                const prefixBonus = targetTokens[0] && candidateTokens[0] && targetTokens[0] === candidateTokens[0]
                    ? 8
                    : 0;

                score = Math.min(100, score * 0.65 + includesBonus + tokenOverlap + wordBonus + prefixBonus);
            }

            if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { match: candidate, score };
            }
        }

        return bestMatch;
    }
}