export function getGraphColor(index: number) {
  const colors = [
    "pink",
    "Blue",
    "Orange",
    "Red",
    "Cyan",
    "Green",
    "Magenta",
    "Yellow",
    "Purple",
    "Teal",
    "Coral",
    "Navy",
    "Peach",
    "Maroon",
    "Aqua",
    "Olive",
  ];
  if (index >= colors.length) {
    return colors[0];
  }
  return colors[index];
}
