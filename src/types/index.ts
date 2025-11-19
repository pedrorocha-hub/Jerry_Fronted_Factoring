export interface ProcessingLog {
  id: string;
  pdf_filename: string;
  status: 'uploading' | 'processing_auto' | 'pending_manual' | 'validating' | 'completed' | 'error';
  processed_at: string;
  data_extracted?: any;
  error_message?: string;
  job_id?: string;
  requires_manual_download?: boolean;
  manual_download_type?: 'sentinel' | 'apfac' | 'deuda_coactiva' | 'otros';
  validation_status?: 'pending' | 'validated' | 'discrepancy';
  rip_generated?: boolean;
  webhook_response?: any;
}

export interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing_auto' | 'pending_manual' | 'validating' | 'completed' | 'error';
  progress: number;
  documentType?: string;
  requiresManualDownload?: boolean;
  manualDownloadType?: string;
}

export interface DashboardStats {
  totalFichasRuc: number;
  pdfsThisMonth: number;
  pendingReview: number;
  pendingManualDownload: number;
  recentActivity: ProcessingLog[];
}

export interface ExportFilter {
  dateRange: {
    from: string;
    to: string;
  };
  fichasRuc: string[];
  dataTypes: string[];
  format: 'excel' | 'csv' | 'pdf';
}

export interface NotificationSettings {
  email: boolean;
  processing: boolean;
  errors: boolean;
  manualDownloadRequired: boolean;
  dailyReport: boolean;
}