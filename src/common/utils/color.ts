/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string) {
  // Convert hex to RGB first
  const [r, g, b] = hexToRgb(hex);

  // Normalize RGB values
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  // Find the maximum and minimum values of R, G, B
  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);

  // Calculate the lightness
  const lightness = (max + min) / 2;

  // If the maximum and minimum are equal, there is no saturation
  if (max === min) {
    return `${0} ${0}% ${lightness * 100}%`;
  }

  // Calculate the saturation
  let saturation = 0;

  if (lightness < 0.5) {
    saturation = (max - min) / (max + min);
  } else {
    saturation = (max - min) / (2 - max - min);
  }

  // Calculate the hue
  let hue;

  if (max === normalizedR) {
    hue = (normalizedG - normalizedB) / (max - min);
  } else if (max === normalizedG) {
    hue = 2 + (normalizedB - normalizedR) / (max - min);
  } else {
    hue = 4 + (normalizedR - normalizedG) / (max - min);
  }

  hue *= 60;
  if (hue < 0) hue += 360;

  return `${hue.toFixed(2)} ${(saturation * 100).toFixed(2)}% ${(lightness * 100).toFixed(2)}%`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): number[] {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;

  if (hex.length === 4 || hex.length === 5) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7 || hex.length === 9) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    throw new Error("Invalid hex color format");
  }

  return [r, g, b];
}
