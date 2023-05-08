export function getGraphColor(index: number) {
  const colors = [
    "pink",
    "orange",
    "blue",
    "red",
    "cyan",
    "green",
    "magenta",
    "yellow",
    "purple",
    "teal",
    "coral",
    "navy",
    "peach",
    "maroon",
    "aqua",
    "olive",
  ];
  if (index >= colors.length) {
    return colors[0];
  }
  return colors[index];
}
