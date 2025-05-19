/**
 * Converts a hex color to rgba format with specified opacity
 * @param hex The hex color code (e.g., #3B82F6 or 3B82F6)
 * @param opacity The opacity value (0 to 1)
 * @returns RGBA color string (e.g., rgba(59, 130, 246, 0.5))
 */
export function hexToRgba(hex: string | undefined, opacity: number): string {
  // Default to a blue color if undefined
  if (!hex) {
    return `rgba(59, 130, 246, ${opacity})`;
  }

  // Remove # if present
  if (hex.startsWith('#')) {
    hex = hex.substring(1);
  }

  // Handle shorthand hex (e.g., #fff)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return rgba value
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
