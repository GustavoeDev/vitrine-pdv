export const DEFAULT_MAP_REGION = {
  latitude: -5.79448,
  longitude: -35.211,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const COORDINATE_DECIMAL_PLACES = 6;

export function roundCoordinate(value: number): number {
  const factor = 10 ** COORDINATE_DECIMAL_PLACES;
  return Math.round(value * factor) / factor;
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
}

export function formatDistanceLabel(distanceKm: number | null | undefined): string {
  if (distanceKm == null) {
    return 'Distância indisponível';
  }

  return `${formatDistanceKm(distanceKm)} de você`;
}
