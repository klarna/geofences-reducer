export function reduce(
  geofences: {
    latitude: number,
    longitude: number,
    radius: number
  }[],
  config?: {
    precision?: number
  }
): string[]
