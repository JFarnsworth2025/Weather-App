function setColor(input) {
    const lightness = getLightnessFromHex(input.value);
    document.body.setAttribute('style', `
        --base-color: ${input.value}; 
        --text-color: ${lightness > 60 ? 'black' : 'white'};
        `);
}
function getLightnessFromHex(hex) {
    // Remove the '#' character if it's there
    hex = hex.replace(/^#/, '');

    // Parse the r, g, b values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    //Luminance formula (Perceived Brightness)
    const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return +(brightness * 100).toFixed(2);
}