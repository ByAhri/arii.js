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
        const matches = extract(target, candidates, { scorer: ratio });

        if (!matches.length || matches[0][1] < threshold) {
            return null; // No sufficiently similar match found
        }

        return { match: matches[0][0], score: matches[0][1] }; // Return the best match and its score
    }
}