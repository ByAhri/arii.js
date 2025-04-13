import { Snowflake as SN } from "@sapphire/snowflake";
import crypto from "crypto";

export class Format {

    /**
     * formats a number from normal (77777) to formatted (77.7k)
     * @param number number to format
     * @returns formatted number
     */
    static formatNumber(number: number): string {
        const res = number.toLocaleString("en-US", { notation: "compact", compactDisplay: "short", });
        return res;
    };

    /**
     * replaces uppercases with spaces and lowercases them
     * @param textOrTexts string or array of strings to convert
     * @example upperCaseToSpace("helloWorld") // hello world
     * @example upperCaseToSpace(["helloWorld", "helloWorld2"]) // ["hello world", "hello world2"]
     * @returns converted string or array of strings
     */
    static upperCaseToSpace(textOrTexts: string | string[]): string | string[] {
        if (typeof textOrTexts === "string") {
            return textOrTexts.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        }
        if (!Array.isArray(textOrTexts)) {
            throw new TypeError("expected a string or an array of strings");
        }
        if (!textOrTexts?.length) return [];
        return textOrTexts.map(k => k.replace(/([A-Z])/g, ' $1').trim().toLowerCase());
    };

    /**
     * converts seconds to HH:MM:SS
     * @param d seconds
     */
    static secondsToHms(d: number | string): string {
        if (typeof d === "string") d = parseInt(d);
        if (isNaN(d)) return "00:00:00"; // Handle NaN case
        let h = Math.floor(d / 3600);
        let m = Math.floor(d % 3600 / 60);
        let s = Math.floor(d % 3600 % 60);

        let hDisplay = h > 0 ? h + ":" : "";
        let mDisplay = m > 0 ? (m < 10 && h > 0 ? "0" : "") + m + ":" : "00:";
        let sDisplay = s > 0 ? (s < 10 ? "0" : "") + s : "00";
        return hDisplay + mDisplay + sDisplay;
    };

    /**
     * convert a number (1) to ordinal string (1st)
     * @param n number to convert
     * @returns ordinal string
     * @example numberToOrdinal(1) // 1st
     */
    static numberToOrdinal(n: number): string {
        let s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    /**
     * @param t time in milliseconds
     * @param includeSeconds whether to include seconds in the output (default false)
     * @returns formatted time string
     */
    static simpleTimeFormat(t: number, includeSeconds: boolean = false) {
        const s = Math.floor(t / 1000);
        if (s <= 59 /*secs*/) {
            return `${s} sec`;
        } else if (s > 59 && s < 60 * 60 /*mins*/) {
            const mins = Math.floor(s / 60);
            const secs = s % 60;
            return includeSeconds ? `${mins} min ${secs} sec` : `${mins} min`;
        } else {
            const hrs = Math.floor(s / 3600);
            const mins = Math.floor((s % 3600) / 60);
            const secs = s % 60;
            return includeSeconds ? `${hrs} hr ${mins} min ${secs} sec` : `${hrs} hr ${mins} min`;
        };
    };

};