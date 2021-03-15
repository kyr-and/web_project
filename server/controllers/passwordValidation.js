// Validation Helper Functions
function includesCapitalLetter(str) {
    let capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return capitalLetters.some((letter) => str.includes(letter));
}

function includesNumber(str) {
    let numbers = '0123456789'.split('');
    return numbers.some((number) => str.includes(number));
}

function includesSymbol(str) {
    let symbols = '!@#$%^&*'.split('');
    return symbols.some((symbol) => str.includes(symbol));
}

module.exports = {includesCapitalLetter, includesNumber, includesSymbol};