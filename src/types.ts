/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  STARTUP = 'STARTUP',
  JUDGE = 'JUDGE',
  PARTNER = 'PARTNER'
}

export interface User {
  user_id: string;
  email: string;
  user_type: UserType;
  name: string;
  phone?: string;
  region_code?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  last_login_at?: string;
  client_id?: string;
  judge_id?: string;
  startup_id?: string;
}

export interface JudgeProfile {
  judge_id: string;
  name: string;
  email?: string;
  title: string;
  company: string;
  career_years: number;
  expertise_fields: string[];
  education_level: string;
  bio: string;
  bank_name: string;
  account_number: string;
  total_evaluation_count: number;
  total_payment_amount: number;
  active_region?: string;
}

export interface ClientProfile {
  client_id: string;
  organization_name: string;
  organization_type: string; // 공공기관, 지자체, 협회 등
  business_number: string;
  assigned_manager_id: string;
  subscription_tier: 'BASIC' | 'PREMIUM';
}

export interface Event {
  event_id: string;
  client_id: string;
  client_name?: string;
  event_type: 'IR' | '성과공유회' | '사업설명회';
  event_title: string;
  event_date: string;
  event_start_time: string;
  venue_address: string;
  venue_online: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  package_type: 'BASIC_500' | 'STANDARD_800' | 'PREMIUM_1200';
  estimated_amount: number;
  additional_options: {
    speaker?: boolean;
    equipment?: string[];
    judge_count?: number;
    custom_option_text?: string;
    custom_option_price?: number;
  };
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  startup_rep_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface EventStartup {
  id: string;
  event_id: string;
  startup_id: string;
  startup_name: string;
  presentation_order: number;
  presentation_time_minutes: number;
  status: 'REGISTERED' | 'COMPLETED' | 'ABSENT';
}

export interface EventJudge {
  id: string;
  event_id: string;
  judge_id: string;
  judge_name: string;
  payment_amount: number;
  payment_status: 'PENDING' | 'PAID';
  attendance_confirmed: boolean;
}

export interface Evaluation {
  evaluation_id: string;
  event_id: string;
  judge_id: string;
  judge_name: string;
  startup_id: string;
  startup_name: string;
  scores: {
    technology: number;
    market: number;
    team: number;
    business_model: number;
  };
  total_score: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  follow_up_interest: boolean;
  is_validated: boolean;
  validation_issues: string[] | null;
  created_at: string;
}

export interface AIFeedback {
  feedback_id: string;
  event_id: string;
  startup_id: string;
  startup_name: string;
  overall_summary: string;
  key_strengths: { category: string; point: string }[];
  key_improvements: { category: string; point: string }[];
  sector_insights: {
    averageScoreInSector: number;
    yourScore: number;
    ranking: string;
  };
  approved_by_client: boolean;
  approved_at?: string;
  sent_to_startup: boolean;
  generated_at: string;
}

export interface Quotation {
  quotation_id: string;
  client_id: string;
  event_date: string;
  package_type: string;
  base_amount: number;
  options: {
    judges?: number;
    speaker?: boolean;
    equipment?: string[];
  };
  total_amount: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  valid_until: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  category: 'SYSTEM' | 'SECURITY' | 'WEBSOCKET' | 'API' | 'AUTH' | 'ACTION';
  message: string;
  details?: string;
}
