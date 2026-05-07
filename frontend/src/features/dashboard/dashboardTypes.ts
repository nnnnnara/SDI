import type {
  ControlCommandResponse,
  EnvironmentLogResponse,
  InspectionResponse,
  ProcessRunResponse,
} from '../../api/client';

export interface DashboardViewProps {
  commands: ControlCommandResponse[];
  currentProcessInspections: InspectionResponse[];
  environmentData: EnvironmentLogResponse | null;
  inspections: InspectionResponse[];
  loading: boolean;
  onStartProcess: () => void;
  onStopProcess: () => void;
  processStatus: ProcessRunResponse | null;
}
