// Define an interface for the options
export interface UtilsOptions {
    id: string;
    name: string;
    extraFeature?: string; // Optional property for flexibility
}

export type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "utf-16le" | "ucs2" | "ucs-2" | "base64" | "base64url" | "latin1" | "binary" | "hex"

export enum BufferEncodingType {
    ascii = "ascii",
    utf8 = "utf8",
    "utf-8" = "utf-8",
    "utf16le" = "utf16le",
    "utf-16le" = "utf-16le",
    ucs2 = "ucs2",
    "ucs-2" = "ucs-2",
    base64 = "base64",
    base64url = "base64url",
    latin1 = "latin1",
    binary = "binary",
    hex = "hex"
}