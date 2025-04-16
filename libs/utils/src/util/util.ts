
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
}