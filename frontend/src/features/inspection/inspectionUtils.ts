import type { InspectionDefectResponse, InspectionResponse } from '../../api/client';

export function inspectionResultLabel(result?: InspectionResponse['result'] | null) {
  if (result === 'GOOD') return '정상';
  if (result === 'BAD') return '불량';
  return '-';
}

export function inspectionResultClass(result?: InspectionResponse['result'] | null) {
  if (result === 'GOOD') return 'border-brand-success/40 bg-brand-success/15 text-brand-success';
  if (result === 'BAD') return 'border-brand-danger/50 bg-brand-danger/15 text-brand-danger';
  return 'border-brand-border bg-brand-border/40 text-brand-textSub';
}

export function confidenceClass(confidence?: number | null) {
  const percent = Number(confidence ?? 0) * 100;
  if (percent < 70) return 'text-brand-danger';
  if (percent < 85) return 'text-brand-warning';
  return 'text-brand-success';
}

export function confidenceLevelLabel(confidence?: number | null) {
  const percent = Number(confidence ?? 0) * 100;
  if (percent < 70) return '낮음';
  if (percent < 85) return '주의';
  return '높음';
}

export function uniqueDefectTypes(defects: InspectionDefectResponse[] = []) {
  return Array.from(new Set(defects.map((defect) => defect.defectType).filter(Boolean)));
}

export function defectTypeSummary(defects: InspectionDefectResponse[] = []) {
  const types = uniqueDefectTypes(defects);
  if (types.length === 0) return '-';
  if (types.length <= 2) return types.join(', ');
  return `${types.slice(0, 2).join(', ')} 외 ${types.length - 2}종`;
}
