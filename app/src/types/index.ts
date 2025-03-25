export type ProcessingStatus = 
  | 'pending' 
  | 'classifying' 
  | 'extracting_text' 
  | 'parsing_form' 
  | 'analyzing_fraud' 
  | 'validating' 
  | 'summarizing' 
  | 'completed' 
  | 'cancelled'
  | 'error';

export interface FileStatus {
  id: string;
  file: File;
  status: ProcessingStatus;
}

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    summary: string | null;
    validation: string | null;
    processing_status: Record<string, ProcessingStatus>;
    fraud_risk: {
      text_analysis: {
        fraud_risk: string;
        reasons: string[];
        verification_needed: boolean;
      };
      document_similarity: number;
      combined_risk: string;
    } | null;
  };
} 