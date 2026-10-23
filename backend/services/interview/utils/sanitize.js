import crypto from "crypto";

/**
 * Generates a random per-request token for dynamic delimiters.
 */
export function generateToken() {
    return crypto.randomBytes(4).toString("hex");
}

/**
 * Strips delimiter tags from untrusted user text.
 * Loosened regex matches tags with whitespace, attributes, or variations,
 * e.g. "</candidate_answer >", "< /question>", "<resume_data foo='bar'>"
 */
export function stripDelimiters(text) {
    if (!text || typeof text !== "string") return "";
    return text.replace(/<\s*\/?\s*(candidate_answer|question|resume_data)[^>]*>/gi, "");
}
