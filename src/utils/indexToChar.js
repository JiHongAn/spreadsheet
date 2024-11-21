export function indexToChar(index) {
    let columnName = '';

    while (index >= 0) {
        columnName = String.fromCharCode(65 + (index % 26)) + columnName;
        index = Math.floor(index / 26) - 1;
    }

    return columnName;
}