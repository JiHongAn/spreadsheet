export function charToIndex(text) {
    let sum = 0;
    for (let i = 0; i < text.length; i++) {
        sum = sum * 26 + (text.charCodeAt(i) - 64);
    }
    return sum - 1;
}