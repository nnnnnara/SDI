import type {
  InspectionResponse,
  ProcessRunResponse,
} from '../../api/client';

export interface DashboardViewProps {
  currentProcessInspections: InspectionResponse[];
  inspections: InspectionResponse[];
  loading: boolean;
  onStartProcess: () => void;
  onStopProcess: () => void;
  processStatus: ProcessRunResponse | null;
}
