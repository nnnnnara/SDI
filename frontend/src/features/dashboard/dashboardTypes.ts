import type {
  ControlCommandResponse,
  InspectionResponse,
  ProcessRunResponse,
} from '../../api/client';

export interface DashboardViewProps {
  commands: ControlCommandResponse[];
  currentProcessInspections: InspectionResponse[];
  inspections: InspectionResponse[];
  loading: boolean;
  onStartProcess: () => void;
  onStopProcess: () => void;
  processStatus: ProcessRunResponse | null;
}
