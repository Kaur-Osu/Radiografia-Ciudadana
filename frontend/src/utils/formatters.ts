export const formatParticipation = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/D';
  return `${value.toFixed(2)} %`;
};

export const formatVariation = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/D';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} pp`;
};

export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/D';
  return value.toLocaleString('es-MX');
};

export const getVariationColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'text-gray-500';
  if (value > 3) return 'text-green-600';
  if (value < -3) return 'text-red-600';
  return 'text-yellow-600';
};

export const getVariationLabel = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'Sin datos';
  if (value > 3) return 'Incremento';
  if (value < -3) return 'Descenso';
  return 'Estabilidad';
};

export const getParticipationBadge = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'bg-gray-100 text-gray-600';
  if (value >= 80) return 'bg-green-100 text-green-700';
  if (value >= 60) return 'bg-blue-100 text-blue-700';
  if (value >= 40) return 'bg-yellow-100 text-yellow-700';
  if (value >= 20) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
};