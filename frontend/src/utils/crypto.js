/**
 * Samvaad End-to-End Encryption Utility
 * Uses Web Crypto API for ECDH Key Exchange and AES-GCM Message Encryption
 */

const KEY_ALGO = { name: "ECDH", namedCurve: "P-256" };
const ENC_ALGO = { name: "AES-GCM", length: 256 };

/**
 * Generates a persistent ECDH Key Pair for the user
 * Stores private key in IndexedDB for security
 */
export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        KEY_ALGO,
        true, // extractable
        ["deriveKey"]
    );

    const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

    // Store in localStorage for now (MVP), but IndexedDB is better for production
    localStorage.setItem("sv_pub_key", JSON.stringify(publicKeyJwk));
    localStorage.setItem("sv_priv_key", JSON.stringify(privateKeyJwk));

    return publicKeyJwk;
};

/**
 * Retrieves the stored public key
 */
export const getMyPublicKey = () => {
    const key = localStorage.getItem("sv_pub_key");
    return key ? JSON.parse(key) : null;
};

/**
 * Derives a shared secret key from your private key and their public key
 */
export const deriveSharedSecret = async (otherPubKeyJwk) => {
    const privKeyJwk = JSON.parse(localStorage.getItem("sv_priv_key"));
    if (!privKeyJwk || !otherPubKeyJwk) return null;

    const privateKey = await window.crypto.subtle.importKey("jwk", privKeyJwk, KEY_ALGO, false, ["deriveKey"]);
    const otherPublicKey = await window.crypto.subtle.importKey("jwk", otherPubKeyJwk, KEY_ALGO, true, []);

    return await window.crypto.subtle.deriveKey(
        { name: "ECDH", public: otherPublicKey },
        privateKey,
        ENC_ALGO,
        false,
        ["encrypt", "decrypt"]
    );
};

/**
 * Encrypts a message string using a shared secret
 */
export const encryptMessage = async (text, sharedKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        sharedKey,
        encoded
    );

    return {
        iv: btoa(String.fromCharCode(...iv)),
        content: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    };
};

/**
 * Decrypts a message blob using a shared secret
 */
export const decryptMessage = async (encryptedData, sharedKey) => {
    try {
        const iv = new Uint8Array(atob(encryptedData.iv).split("").map(c => c.charCodeAt(0)));
        const ciphertext = new Uint8Array(atob(encryptedData.content).split("").map(c => c.charCodeAt(0)));

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            sharedKey,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (err) {
        console.error("Decryption failed:", err);
        return "[Unable to decrypt message]";
    }
};
