export function calculateStatsRingColor(percentageUsed: number) {
  if (percentageUsed >= 80) {
    return "red";
  } else if (percentageUsed >= 50) {
    return "orange";
  }
  return "green";
}
