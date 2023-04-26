export function getGraphColor(index: number) {
  const colors = ["pink", "orange", "green", "orange", "blue", "purple", "teal", "yellow"];
  if (index >= colors.length) {
    return colors[0];
  }
  return colors[index];
}
