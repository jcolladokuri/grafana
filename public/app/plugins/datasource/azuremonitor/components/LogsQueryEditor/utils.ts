export function calculateTimeRange(from: number, to: number): number {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const timeRange = (to - from) / day;

  return timeRange;
}
