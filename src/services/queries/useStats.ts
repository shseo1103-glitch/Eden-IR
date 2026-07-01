/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event, JudgeProfile, Evaluation, AIFeedback, UserType } from '../../types';
import { useUiStore } from '../../store/useUiStore';

// Define a realistic in-memory database to simulate server-side persistence
const initialEvents: Event[] = [
  {
    event_id: 'event-1',
    client_id: 'client-1',
    client_name: '경기창조경제혁신센터',
    event_type: 'IR',
    event_title: '2026 경기 파이오니어 IR 데이',
    event_date: '2026-07-15',
    event_start_time: '14:00',
    venue_address: '경기도 성남시 분당구 대왕판교로 645번길 12',
    venue_online: false,
    status: 'IN_PROGRESS',
    package_type: 'STANDARD_800',
    estimated_amount: 8000000,
    additional_options: { speaker: true, equipment: ['LAPTOP', 'PROJECTOR'], judge_count: 5 },
    assigned_staff_id: 'admin-uuid-1103',
    assigned_staff_name: '박하나로동글',
    startup_rep_ids: ['user-startup'],
    created_at: '2026-06-10T10:00:00Z',
    updated_at: '2026-06-12T14:30:00Z',
  },
  {
    event_id: 'event-2',
    client_id: 'client-2',
    client_name: '서울테크노파크',
    event_type: '성과공유회',
    event_title: '2026 서울 우수 스타트업 성과공유회',
    event_date: '2026-07-28',
    event_start_time: '13:00',
    venue_address: '서울특별시 노원구 공릉로 232',
    venue_online: false,
    status: 'CONFIRMED',
    package_type: 'PREMIUM_1200',
    estimated_amount: 12000000,
    additional_options: { speaker: true, equipment: ['LAPTOP', 'PROJECTOR', 'SOUND_SYSTEM'], judge_count: 6 },
    assigned_staff_id: 'admin-uuid-1103',
    assigned_staff_name: '박하나로동글',
    created_at: '2026-06-15T09:00:00Z',
    updated_at: '2026-06-15T11:00:00Z',
  },
  {
    event_id: 'event-3',
    client_id: 'client-3',
    client_name: '대전정보문화산업진흥원',
    event_type: '사업설명회',
    event_title: '충청권 ICT 유망기업 투자 연계 설명회',
    event_date: '2026-08-05',
    event_start_time: '15:00',
    venue_address: '대전광역시 유성구 대덕대로 512번길 30',
    venue_online: true,
    status: 'PENDING',
    package_type: 'BASIC_500',
    estimated_amount: 5000000,
    additional_options: { speaker: false, equipment: [], judge_count: 3 },
    created_at: '2026-06-25T16:00:00Z',
    updated_at: '2026-06-25T16:00:00Z',
  },
  {
    event_id: 'event-4',
    client_id: 'client-1',
    client_name: '경기창조경제혁신센터',
    event_type: 'IR',
    event_title: '경기 소셜임팩트 스타트업 투자 피칭 데이',
    event_date: '2026-06-15',
    event_start_time: '14:00',
    venue_address: '판교 스타트업 캠퍼스 2층 다목적홀',
    venue_online: false,
    status: 'COMPLETED',
    package_type: 'STANDARD_800',
    estimated_amount: 8000000,
    additional_options: { speaker: true, equipment: ['LAPTOP', 'PROJECTOR'], judge_count: 4 },
    assigned_staff_id: 'admin-uuid-1103',
    assigned_staff_name: '박하나로동글',
    startup_rep_ids: ['user-startup'],
    created_at: '2026-05-10T10:00:00Z',
    updated_at: '2026-06-15T18:00:00Z',
  },
  {
    event_id: 'event-5',
    client_id: 'client-4',
    client_name: '한국전력공사 에너지스타트업센터',
    event_type: 'IR',
    event_title: 'K-Energy Green Tech IR Meetup',
    event_date: '2026-05-22',
    event_start_time: '10:00',
    venue_address: '광주전남공동혁신도시 한전 본사 3층',
    venue_online: false,
    status: 'COMPLETED',
    package_type: 'PREMIUM_1200',
    estimated_amount: 11500000,
    additional_options: { speaker: true, equipment: ['LED_SCREEN', 'SOUND_SYSTEM'], judge_count: 6 },
    assigned_staff_id: 'admin-uuid-1103',
    assigned_staff_name: '박하나로동글',
    created_at: '2026-04-12T11:00:00Z',
    updated_at: '2026-05-22T17:00:00Z',
  }
];

const initialJudges: JudgeProfile[] = [
  {
    judge_id: 'judge-1',
    name: '이투자',
    email: 'judge1@abc.com',
    title: '대표 파트너',
    company: 'ABC 벤처캐피탈',
    career_years: 12,
    expertise_fields: ['AI', 'SaaS', 'B2B'],
    education_level: '박사',
    bio: '인공지능 소프트웨어 및 클라우드 서비스 초기 투자 10년 이상의 전문 심사역.',
    bank_name: '국민은행',
    account_number: '123-45-67890-1',
    total_evaluation_count: 52,
    total_payment_amount: 2400000,
    active_region: '서울/수도권'
  },
  {
    judge_id: 'judge-2',
    name: '김기석',
    email: 'judge2@bluepoint.com',
    title: '상무 이사',
    company: '블루포인트 파트너스',
    career_years: 8,
    expertise_fields: ['AI', '딥테크', 'Bio'],
    education_level: '석사',
    bio: '바이오 테크놀로지 및 융합 인공지능 분야 전문 투자 심사 경력.',
    bank_name: '신한은행',
    account_number: '987-65-43210-2',
    total_evaluation_count: 47,
    total_payment_amount: 1800000,
    active_region: '대전/충청'
  },
  {
    judge_id: 'judge-3',
    name: '박경수',
    email: 'judge3@kakaoventures.com',
    title: '투자 파트너',
    company: '카카오 벤처스',
    career_years: 6,
    expertise_fields: ['SaaS', 'FinTech', 'B2C'],
    education_level: '학사',
    bio: '모바일 서비스 및 차세대 핀테크 스타트업 고속성장 단계 엑셀러레이팅 역량 보유.',
    bank_name: '하나은행',
    account_number: '555-44-33333-3',
    total_evaluation_count: 31,
    total_payment_amount: 1100000,
    active_region: '서울/수도권'
  },
  {
    judge_id: 'judge-4',
    name: '정희진',
    email: 'judge4@sparklabs.com',
    title: '수석 투자심사역',
    company: '스파크랩스',
    career_years: 15,
    expertise_fields: ['AI', 'SaaS', '모빌리티'],
    education_level: '박사',
    bio: '글로벌 스타트업 엑셀러레이팅 전문가. 자율주행, 스마트 모빌리티 및 사스 분야 전문.',
    bank_name: '우리은행',
    account_number: '1002-888-9999-1',
    total_evaluation_count: 68,
    total_payment_amount: 3200000,
    active_region: '부산/경남'
  },
  {
    judge_id: 'judge-5',
    name: '조민경',
    email: 'judge5@fastventures.com',
    title: '창업 파트너',
    company: '패스트벤처스',
    career_years: 5,
    expertise_fields: ['B2B', '커머스', 'FinTech'],
    education_level: '학사',
    bio: '초기 창업가 팀 빌딩 및 비즈니스 모델 피벗 지원 전문가.',
    bank_name: '농협은행',
    account_number: '302-1103-9999-2',
    total_evaluation_count: 19,
    total_payment_amount: 800000,
    active_region: '대구/경북'
  }
];

const initialUsers: any[] = [
  {
    user_id: 'user-superadmin',
    email: 'superadmin@irplus.co.kr',
    user_type: UserType.SUPER_ADMIN,
    name: '박하나',
    phone: '010-3333-7777',
    status: 'ACTIVE',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    user_id: 'user-admin',
    email: 'admin@irplus.co.kr',
    user_type: UserType.ADMIN,
    name: '이관리',
    phone: '010-4444-8888',
    status: 'ACTIVE',
    created_at: '2026-02-15T09:00:00Z',
  },
  {
    user_id: 'user-client',
    email: 'client@agency.go.kr',
    user_type: UserType.CLIENT,
    name: '김도진',
    phone: '010-1234-5678',
    status: 'ACTIVE',
    created_at: '2026-03-15T09:00:00Z',
    client_id: 'client-1'
  },
  {
    user_id: 'user-startup',
    email: 'startup@edenbiotech.io',
    user_type: UserType.STARTUP,
    name: '홍길동',
    phone: '010-5678-1234',
    status: 'ACTIVE',
    created_at: '2026-04-15T09:00:00Z',
    startup_id: 'startup-1',
    company_name: '에덴바이오텍'
  },
  {
    user_id: 'user-judge',
    email: 'judge1@abc.com',
    user_type: UserType.JUDGE,
    name: '이투자',
    phone: '010-9999-1111',
    status: 'ACTIVE',
    created_at: '2026-05-15T09:00:00Z',
    judge_id: 'judge-1'
  },
  {
    user_id: 'user-partner',
    email: 'partner@soundtech.co.kr',
    user_type: UserType.PARTNER,
    name: '박지훈',
    phone: '010-2222-3333',
    status: 'ACTIVE',
    created_at: '2026-06-15T09:00:00Z',
  }
];

const initialFeedbacks: AIFeedback[] = [
  {
    feedback_id: 'feedback-1',
    event_id: 'event-1',
    startup_id: 'startup-1',
    startup_name: '에덴바이오텍',
    overall_summary: '귀사는 기술력과 팀 역량에서 높은 평가를 받았으나, 글로벌 제약사들과의 파트너십 유치 전략과 세부적인 GTM(Go-To-Market) 로드맵에 대한 기술이 다소 평이합니다. 기술적 진입장벽을 명확히 하고 해외 라이센싱 아웃 구조를 정밀하게 재수립할 필요가 있습니다.',
    key_strengths: [
      { category: '기술', point: '독자적인 펩타이드 표적 합성 기술을 활용해 신약 물질 후보군 도출 성공' },
      { category: '팀', point: '글로벌 메디컬 기업 연구원 출신 박사급 핵심 개발 인력 비율 80% 이상' }
    ],
    key_improvements: [
      { category: '시장', point: 'TAM/SAM/SOM 타겟 시장 규모 산출 시 글로벌 세부 시장 카테고리 누락' },
      { category: '사업모델', point: '직접 판매 방식 외 글로벌 바이오텍과의 공동 라이센싱 모델 구체화 필요' }
    ],
    sector_insights: {
      averageScoreInSector: 7.2,
      yourScore: 8.4,
      ranking: '상위 12%'
    },
    approved_by_client: false,
    sent_to_startup: false,
    generated_at: '2026-06-28T18:00:00Z'
  },
  {
    feedback_id: 'feedback-2',
    event_id: 'event-4',
    startup_id: 'startup-2',
    startup_name: '이노클라우드',
    overall_summary: 'B2B 멀티 클라우드 비용 효율화 솔루션은 높은 성장성이 예상됩니다. 다만, 대기업 타겟의 엔터프라이즈 레퍼런스를 확보하는 데 장벽이 있어 중소/중견기업 전용 구독 플랜을 전략적으로 배치하는 것을 권장합니다.',
    key_strengths: [
      { category: '시장', point: '클라우드 마이그레이션 전환 가속화에 따른 타겟 인프라 최적화 수요 급증' },
      { category: '기술', point: '실시간 유휴 자원 분석 AI 예측 정확도 94.8% 실측 증명 완료' }
    ],
    key_improvements: [
      { category: '마케팅', point: '초기 트랙션 확보를 위한 무료 오픈소스 전환 및 프로모션 기획 미비' }
    ],
    sector_insights: {
      averageScoreInSector: 7.1,
      yourScore: 7.9,
      ranking: '상위 25%'
    },
    approved_by_client: true,
    approved_at: '2026-06-16T10:00:00Z',
    sent_to_startup: true,
    generated_at: '2026-06-15T21:00:00Z'
  }
];

// Attach persistent DB to global scope to allow visual updates to stay alive
const getDb = () => {
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (!w.__eden_ir_db) {
      w.__eden_ir_db = {
        events: initialEvents,
        judges: initialJudges,
        feedbacks: initialFeedbacks,
        users: initialUsers,
        evaluationCount: 213,
        totalRevenue: 44500000,
        monthlyRevenueData: [
          { month: '2026-02', total_events: 2, total_revenue: 13000000, avg_revenue: 6500000 },
          { month: '2026-03', total_events: 3, total_revenue: 19000000, avg_revenue: 6333333 },
          { month: '2026-04', total_events: 4, total_revenue: 28000000, avg_revenue: 7000000 },
          { month: '2026-05', total_events: 5, total_revenue: 37500000, avg_revenue: 7500000 },
          { month: '2026-06', total_events: 4, total_revenue: 31000000, avg_revenue: 7750000 },
          { month: '2026-07', total_events: 6, total_revenue: 45000000, avg_revenue: 7500000 },
        ],
        eventJudges: [
          { id: 'ej-1', event_id: 'event-1', judge_id: 'judge-1', payment_amount: 200000, payment_status: 'PENDING', attendance_confirmed: true },
          { id: 'ej-2', event_id: 'event-1', judge_id: 'judge-2', payment_amount: 200000, payment_status: 'PENDING', attendance_confirmed: true },
          { id: 'ej-3', event_id: 'event-4', judge_id: 'judge-3', payment_amount: 200000, payment_status: 'PENDING', attendance_confirmed: true },
          { id: 'ej-4', event_id: 'event-4', judge_id: 'judge-4', payment_amount: 200000, payment_status: 'PENDING', attendance_confirmed: true },
        ],
        eventStartups: [
          { id: 'es-1', event_id: 'event-1', startup_id: 'startup-1', startup_name: '에덴바이오텍', presentation_order: 1, presentation_time_minutes: 20, status: 'REGISTERED' },
          { id: 'es-3', event_id: 'event-4', startup_id: 'startup-2', startup_name: '이노클라우드', presentation_order: 1, presentation_time_minutes: 20, status: 'REGISTERED' },
        ],
        judgeOpinions: [
          { id: 'jo-1', event_id: 'event-4', judge_id: 'judge-3', startup_id: 'startup-2', opinion: '이노클라우드는 기술력과 AI 가속화 분야에서 뛰어난 성과가 예상됩니다.' },
          { id: 'jo-2', event_id: 'event-4', judge_id: 'judge-4', startup_id: 'startup-2', opinion: '타겟 시장 전략이 상세하게 보강되면 글로벌 확장에 가속이 붙을 것입니다.' },
        ]
      };
    }
    return w.__eden_ir_db;
  }
  return {
    events: initialEvents,
    judges: initialJudges,
    feedbacks: initialFeedbacks,
    users: initialUsers,
    evaluationCount: 213,
    totalRevenue: 44500000,
    monthlyRevenueData: [],
    eventJudges: [],
    eventStartups: [],
    judgeOpinions: []
  };
};

// 1. Dashboard KPI stats query
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Simulate slight networking latency
      await new Promise((resolve) => setTimeout(resolve, 300));
      const db = getDb();

      // Recalculate stats based on active db
      const completedEvents = db.events.filter((e: Event) => e.status === 'COMPLETED');
      const calculatedRevenue = db.events.reduce((acc: number, e: Event) => {
        if (e.status === 'COMPLETED' || e.status === 'CONFIRMED' || e.status === 'IN_PROGRESS') {
          return acc + e.estimated_amount;
        }
        return acc;
      }, 0);

      // Judge Payments Pie chart formatted data
      const judgePaymentData = db.judges.map((j: JudgeProfile) => {
        const matches = (db.eventJudges || []).filter((ej: any) => ej.judge_id === j.judge_id);
        const totalPayment = matches.reduce((sum: number, ej: any) => sum + (Number(ej.payment_amount) || 0), 0);
        const count = matches.length;
        return {
          name: j.name,
          company: j.company,
          payment: totalPayment,
          events: count
        };
      });

      // Calculate dynamic evaluations and startup counts
      const judgeEvaluationsSum = db.judges.reduce((sum: number, j: JudgeProfile) => sum + (j.total_evaluation_count || 0), 0);
      const actualOpinionsCount = (db.judgeOpinions || []).length;
      const calculatedEvaluationCount = judgeEvaluationsSum + actualOpinionsCount;

      const startupUsersCount = db.users.filter((u: any) => u.user_type === 'STARTUP').length;
      const uniqueStartupsInEvents = new Set((db.eventStartups || []).map((es: any) => es.startup_id)).size;
      const calculatedActiveStartups = 30 + startupUsersCount + uniqueStartupsInEvents;

      return {
        totalRevenue: calculatedRevenue,
        totalEvents: db.events.length,
        evaluationCount: calculatedEvaluationCount,
        activeStartups: calculatedActiveStartups,
        averageScore: 7.82,
        monthlyRevenue: db.monthlyRevenueData,
        judgePayments: judgePaymentData,
      };
    },
    staleTime: 5000,
  });
}

// 2. Events query with robust Korean multi-filtering options
export interface EventFilters {
  search: string;
  status: string;
  type: string;
  dateStart: string;
  dateEnd: string;
}

export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const db = getDb();
      let list = [...db.events] as Event[];

      // Search filtering (Korean text support)
      if (filters.search) {
        list = list.filter((e) =>
          e.event_title.toLowerCase().includes(filters.search.toLowerCase()) ||
          e.client_name?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Status filtering
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((e) => e.status === filters.status);
      }

      // Type filtering
      if (filters.type && filters.type !== 'ALL') {
        list = list.filter((e) => e.event_type === filters.type);
      }

      // Date range filtering
      if (filters.dateStart) {
        list = list.filter((e) => e.event_date >= filters.dateStart);
      }
      if (filters.dateEnd) {
        list = list.filter((e) => e.event_date <= filters.dateEnd);
      }

      // Sort by date desc
      return list.sort((a, b) => b.event_date.localeCompare(a.event_date));
    }
  });
}

// 3. Judges query with robust Korean multi-filtering options
export interface JudgeFilters {
  search: string;
  expertise: string;
  region: string;
  minCareer: number;
}

export function useJudges(filters: JudgeFilters) {
  return useQuery({
    queryKey: ['judges', filters],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const db = getDb();
      let list = [...db.judges] as JudgeProfile[];

      // Match judge name or company
      if (filters.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(
          (j) =>
            j.company.toLowerCase().includes(query) ||
            j.title.toLowerCase().includes(query) ||
            j.bio.toLowerCase().includes(query)
        );
      }

      // Expertise filtering
      if (filters.expertise && filters.expertise !== 'ALL') {
        list = list.filter((j) => j.expertise_fields.includes(filters.expertise));
      }

      // Career filtering
      if (filters.minCareer > 0) {
        list = list.filter((j) => j.career_years >= filters.minCareer);
      }

      // Region filtering
      if (filters.region && filters.region !== 'ALL') {
        if (filters.region === '서울특별시') {
          list = list.filter((j) => (j.active_region || '').includes('서울특별시') || (j.active_region || '').includes('서울'));
        } else if (filters.region === '경기도') {
          list = list.filter((j) => (j.active_region || '').includes('경기도') || (j.active_region || '').includes('경기') || (j.active_region || '').includes('수도권'));
        } else if (filters.region === '대전광역시') {
          list = list.filter((j) => (j.active_region || '').includes('대전광역시') || (j.active_region || '').includes('대전') || (j.active_region || '').includes('충청'));
        } else if (filters.region === '기타') {
          list = list.filter((j) => {
            const r = j.active_region || '';
            return r !== '' && 
              !r.includes('서울') && 
              !r.includes('경기') && 
              !r.includes('수도권') && 
              !r.includes('대전') && 
              !r.includes('충청');
          });
        } else {
          list = list.filter((j) => (j.active_region || '').toLowerCase().includes(filters.region.toLowerCase()));
        }
      }

      // Dynamically calculate cumulative evaluation participation and cumulative settlement amount
      const calculatedList = list.map((j) => {
        const matches = (db.eventJudges || []).filter((ej: any) => ej.judge_id === j.judge_id);
        const count = matches.length;
        const totalPayment = matches.reduce((sum: number, ej: any) => sum + (Number(ej.payment_amount) || 0), 0);
        return {
          ...j,
          total_evaluation_count: count,
          total_payment_amount: totalPayment
        };
      });

      return calculatedList;
    }
  });
}

// 4. Client AI feedback query
export function useAiFeedbacks() {
  return useQuery({
    queryKey: ['aiFeedbacks'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const db = getDb();
      return db.feedbacks as AIFeedback[];
    }
  });
}

// 5. Create Event mutation
export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (newEvent: Omit<Event, 'event_id' | 'created_at' | 'updated_at'>) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const db = getDb();
      const created: Event = {
        ...newEvent,
        event_id: `event-uuid-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      db.events.unshift(created);
      
      // Update Monthly Stats
      const m = created.event_date.substring(0, 7); // e.g. 2026-07
      const existingMonth = db.monthlyRevenueData.find((x: any) => x.month === m);
      if (existingMonth) {
        existingMonth.total_events += 1;
        existingMonth.total_revenue += created.estimated_amount;
      } else {
        db.monthlyRevenueData.push({
          month: m,
          total_events: 1,
          total_revenue: created.estimated_amount,
          avg_revenue: created.estimated_amount
        });
        db.monthlyRevenueData.sort((a: any, b: any) => a.month.localeCompare(b.month));
      }

      return created;
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `신규 행사 생성 완료: ${data.event_title}`,
        `발주처: ${data.client_name}, 계약액: ₩${data.estimated_amount.toLocaleString()}`
      );
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
      addLog('ERROR', 'SYSTEM', '신규 행사 생성 중 오류 발생', error.message);
    }
  });
}

// 6. Invite Judge mutation
export function useInviteJudgeMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (payload: { eventId: string; judgeIds: string[]; paymentAmount: number }) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const db = getDb();

      // Find event
      const targetEvent = db.events.find((e: Event) => e.event_id === payload.eventId);
      
      if (!db.eventJudges) db.eventJudges = [];
      
      // Mutate payment for each judge and increase evaluation count
      payload.judgeIds.forEach((id) => {
        const judge = db.judges.find((j: JudgeProfile) => j.judge_id === id);
        if (judge) {
          judge.total_payment_amount += payload.paymentAmount;
          judge.total_evaluation_count += 1;
          
          // Append to eventJudges relation
          const alreadyMatched = db.eventJudges.some((ej: any) => ej.event_id === payload.eventId && ej.judge_id === id);
          if (!alreadyMatched) {
            db.eventJudges.push({
              id: `ej-${Date.now()}-${id}`,
              event_id: payload.eventId,
              judge_id: id,
              payment_amount: payload.paymentAmount,
              payment_status: 'PENDING',
              attendance_confirmed: true
            });
          }

          addLog(
            'SUCCESS',
            'ACTION',
            `심사위원 [${judge.name}] 행사 매칭 성공 및 심사비 지급 예약`,
            `행사 ID: ${payload.eventId}, 심사비: ₩${payload.paymentAmount.toLocaleString()}`
          );
        }
      });

      db.evaluationCount = (db.evaluationCount || 0) + payload.judgeIds.length;

      return { success: true, targetEvent, invitedCount: payload.judgeIds.length };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh chart data
      queryClient.invalidateQueries({ queryKey: ['judges'] });
      queryClient.invalidateQueries({ queryKey: ['eventJudges'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      
      // Simulate socket alert triggered
      useUiStore.getState().addLog(
        'SUCCESS',
        'WEBSOCKET',
        `[WebSocket STOMP] ${data.invitedCount}명의 심사위원에게 행사 매칭 완료 및 지급 안내가 실시간으로 전송되었습니다.`
      );
    }
  });
}

// 6.1 Event Judges and Startup Matching Queries
export function useEventJudges() {
  return useQuery({
    queryKey: ['eventJudges'],
    queryFn: async () => {
      const db = getDb();
      if (!db.eventJudges) db.eventJudges = [];
      return db.eventJudges as any[];
    }
  });
}

export function useEventStartups() {
  return useQuery({
    queryKey: ['eventStartups'],
    queryFn: async () => {
      const db = getDb();
      if (!db.eventStartups) db.eventStartups = [];
      return db.eventStartups as any[];
    }
  });
}

export function useJudgeOpinions() {
  return useQuery({
    queryKey: ['judgeOpinions'],
    queryFn: async () => {
      const db = getDb();
      if (!db.judgeOpinions) db.judgeOpinions = [];
      return db.judgeOpinions as any[];
    }
  });
}

// Mutation to save a judge opinion
export function useSaveJudgeOpinionMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (payload: { eventId: string; judgeId: string; startupId: string; opinion: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const db = getDb();
      if (!db.judgeOpinions) db.judgeOpinions = [];

      const existingIdx = db.judgeOpinions.findIndex(
        (o: any) => o.event_id === payload.eventId && o.judge_id === payload.judgeId && o.startup_id === payload.startupId
      );

      const item = {
        id: existingIdx !== -1 ? db.judgeOpinions[existingIdx].id : `jo-${Date.now()}-${payload.judgeId}`,
        event_id: payload.eventId,
        judge_id: payload.judgeId,
        startup_id: payload.startupId,
        opinion: payload.opinion,
        created_at: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        db.judgeOpinions[existingIdx] = item;
      } else {
        db.judgeOpinions.push(item);
      }

      const judge = db.judges.find((j: any) => j.judge_id === payload.judgeId);
      const startup = db.eventStartups.find((s: any) => s.startup_id === payload.startupId);
      const judgeName = judge ? judge.name : payload.judgeId;
      const startupName = startup ? startup.startup_name : payload.startupId;

      return { item, judgeName, startupName };
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `심사의견 기록 완료: [${data.judgeName} 심사위원]`,
        `대상 기업: [${data.startupName}], 의견: "${data.item.opinion.substring(0, 30)}..."`
      );
      queryClient.invalidateQueries({ queryKey: ['judgeOpinions'] });
    }
  });
}

// Mutation to generate AI report from opinions
export function useGenerateAiFeedbackMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (payload: { eventId: string }) => {
      const db = getDb();
      
      const eventId = payload.eventId;
      const event = db.events.find((e: any) => e.event_id === eventId);
      const eventTitle = event ? event.event_title : '선택된 행사';

      const startups = db.eventStartups.filter((s: any) => s.event_id === eventId);
      if (startups.length === 0) {
        throw new Error('이 행사에 등록된 발표기업이 없습니다.');
      }

      const generatedFeedbacks: any[] = [];
      
      // We process startups asynchronously calling the server-side API proxy
      for (const startup of startups) {
        const opinions = (db.judgeOpinions || []).filter(
          (o: any) => o.event_id === eventId && o.startup_id === startup.startup_id
        );

        const combinedOpinionsText = opinions.map((o: any) => {
          const judge = db.judges.find((j: any) => j.judge_id === o.judge_id);
          const name = judge ? `${judge.company} ${judge.name}` : '심사위원';
          return `- [${name} 의견]: ${o.opinion}`;
        }).join('\n');

        let overall_summary = '';
        let key_strengths = [];
        let key_improvements = [];

        try {
          const response = await fetch("/api/gemini/generate-report", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              opinionsText: combinedOpinionsText || "해당 기업에 대한 심사위원 서술의견이 아직 작성되지 않았습니다."
            })
          });

          if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
          }

          const resData = await response.json();
          overall_summary = resData.overall_summary;
          key_strengths = resData.key_strengths;
          key_improvements = resData.key_improvements;
        } catch (error) {
          console.error("Failed calling server-side Gemini API, using fallback generator:", error);
          // Fallback UI generator with high-quality mock matching the system-wide VC guidelines
          overall_summary = `### 1. 개요 및 심사의견 요약\n* 심사의견 분석 API 호출 중 문제(API 키 미지정 등)가 발생하여 시뮬레이션된 VC 보고서를 제공합니다. 본 기업은 기술적 원천 경쟁력은 준수하나 마케팅 효율성 검증 장치 및 단일 매출처 80% 편중 리스크가 보완 사항으로 진단되었습니다.\n\n### 2. 핵심 문제점 (Risks Identified)\n* **[매출 편중 리스크]**\n  * 세부 내용: 단일 고객에 대한 매출 점유율이 80%를 초과하여 외부 변수에 따른 매출 급락 리스크 노출이 큽니다.\n* **[재무 거버넌스 미흡]**\n  * 세부 내용: 내부 통제 및 전문 자금 계획 수립을 전담할 최고재무책임자(CFO)가 부재하며 예산 집행 타당성 시뮬레이션이 미흡합니다.\n\n### 3. 전략적 개선사항 (Strategic Improvements)\n* **[매출 고객군 다변화]**\n  * 세부 내용: 다각적인 유통 파이프라인 개발 및 신규 타겟 마케팅으로 단일 거래처 리스크를 희석해야 합니다.\n* **[재무 모니터링 체계 도입]**\n  * 세부 내용: 마케팅 성과 지표(ROAS, CAC/LTV) 관리 고도화 및 자금 정밀 운용 체제를 구축해야 합니다.\n\n### 4. 보완 실행내용 (Action Items & Conditions)\n* **[선결 조건 (Condition Precedent)]** - 투자 집행 전 완료 필요 사항\n  * 액션 1: 2026년도 마케팅 예산 타당성 검토 리포트 및 월별 런웨이 보장 방안 검증 완료.\n* **[투자 후 관리 및 계약 조건 (Post-Investment & Covenants)]** - 투자 후 이행 사항\n  * 액션 2: 투자 실행 후 2개 분기 이내 7년 이상 투자 유치/회계 경력의 전문 CFO 영입 필수.\n  * 액션 3: 분기별 마케팅 효율성 및 주요 ROAS 데이터를 포함하는 결산 리포트 상시 제출.`;
          key_strengths = [
            { category: '핵심 기술성', point: '자체 특허 기술 및 검증된 개발 전담 인력 구성 보유' }
          ];
          key_improvements = [
            { category: '시장 진입', point: '단일 대기업 편중 완화를 위한 점진적 GTM 전략 다각화 필요' }
          ];
        }

        if (!db.feedbacks) db.feedbacks = [];
        const existingIdx = db.feedbacks.findIndex(
          (f: any) => f.event_id === eventId && f.startup_id === startup.startup_id
        );

        const newFeedback = {
          feedback_id: existingIdx !== -1 ? db.feedbacks[existingIdx].feedback_id : `feedback-${Date.now()}-${startup.startup_id}`,
          event_id: eventId,
          startup_id: startup.startup_id,
          startup_name: startup.startup_name,
          overall_summary,
          key_strengths,
          key_improvements,
          sector_insights: {
            averageScoreInSector: 7.2,
            yourScore: 8.3,
            ranking: '상위 13%'
          },
          approved_by_client: false,
          sent_to_startup: false,
          generated_at: new Date().toISOString()
        };

        if (existingIdx !== -1) {
          db.feedbacks[existingIdx] = newFeedback;
        } else {
          db.feedbacks.unshift(newFeedback);
        }
        generatedFeedbacks.push(newFeedback);
      }

      return { eventTitle, count: generatedFeedbacks.length };
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `[Gemini AI 종합 보고서 발행 완료] 행사명: ${data.eventTitle}`,
        `기입된 심사위원 평가의견을 종합 분석하여 총 ${data.count}개 발표기업의 종합 AI 피드백 레포트를 무결하게 발행하였습니다.`
      );
      queryClient.invalidateQueries({ queryKey: ['aiFeedbacks'] });
    }
  });
}

// 7. Approve AI Feedback mutation
export function useApproveFeedbackMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (payload: { feedbackId: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const db = getDb();
      const fb = db.feedbacks.find((f: AIFeedback) => f.feedback_id === payload.feedbackId);
      if (fb) {
        fb.approved_by_client = true;
        fb.sent_to_startup = true;
        fb.approved_at = new Date().toISOString();
        return fb;
      }
      throw new Error('Feedback not found');
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `[발주처 승인완료] AI 스타트업 피드백 발송 승인`,
        `대상 스타트업: [${data.startup_name}] - 피드백 레포트 전달 성공`
      );
      queryClient.invalidateQueries({ queryKey: ['aiFeedbacks'] });
    }
  });
}

// 8. Create Judge mutation
export function useCreateJudgeMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (newJudge: Omit<JudgeProfile, 'judge_id' | 'total_evaluation_count' | 'total_payment_amount'>) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const db = getDb();
      const created: JudgeProfile = {
        ...newJudge,
        judge_id: `judge-uuid-${Date.now()}`,
        total_evaluation_count: 0,
        total_payment_amount: 0
      };
      db.judges.unshift(created);
      return created;
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `신규 심사위원 풀 등록 완료: [${data.name}]`,
        `소속: ${data.company} (${data.title}), 전문분야: ${data.expertise_fields.join(', ')}`
      );
      queryClient.invalidateQueries({ queryKey: ['judges'] });
    }
  });
}

// 9. Members Queries and Mutations
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const db = getDb();
      return (db.users || []) as any[];
    }
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (newUser: any) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const db = getDb();
      const userId = `user-uuid-${Date.now()}`;
      
      let startup_id = undefined;
      let judge_id = undefined;
      
      if (newUser.user_type === UserType.STARTUP) {
        startup_id = `startup-uuid-${Date.now()}`;
      } else if (newUser.user_type === UserType.JUDGE) {
        judge_id = `judge-uuid-${Date.now()}`;
      }

      const created = {
        ...newUser,
        user_id: userId,
        startup_id,
        judge_id,
        created_at: new Date().toISOString()
      };
      
      if (!db.users) db.users = [];
      db.users.push(created);

      // Automatically seed a matching judge profile to db.judges
      if (created.user_type === UserType.JUDGE) {
        if (!db.judges) db.judges = [];
        db.judges.push({
          judge_id: created.judge_id,
          name: created.name,
          email: created.email,
          title: '전문 심사위원',
          company: created.company_name || '벤처캐피탈',
          career_years: 5,
          expertise_fields: ['AI', 'SaaS'],
          education_level: '석사',
          bio: `${created.name} 전문 투자 심사역`,
          bank_name: '신한은행',
          account_number: '110-333-5555',
          total_evaluation_count: 0,
          total_payment_amount: 0,
          active_region: '서울특별시'
        });
      }

      return created;
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `신규 회원 등록 완료: ${data.name} (${data.user_type})`,
        `이메일: ${data.email}, 상태: ${data.status}`
      );
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['judges'] });
    }
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (updated: any) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const db = getDb();
      if (!db.users) db.users = [];
      const idx = db.users.findIndex((u: any) => u.user_id === updated.user_id);
      if (idx !== -1) {
        const oldUser = db.users[idx];
        const merged = { ...oldUser, ...updated };
        db.users[idx] = merged;

        // SYSTEM-WIDE PROPAGATION/DATA INTEGRITY SYNC:

        // 1. If STARTUP: Propagate name & company_name (회사명) to eventStartups and feedbacks
        if (merged.user_type === UserType.STARTUP) {
          const sId = merged.startup_id || merged.user_id;
          
          if (db.eventStartups) {
            db.eventStartups.forEach((es: any) => {
              if (es.startup_id === sId || es.startup_id === merged.user_id) {
                es.startup_name = merged.company_name || merged.name;
              }
            });
          }
          if (db.feedbacks) {
            db.feedbacks.forEach((f: any) => {
              if (f.startup_id === sId || f.startup_id === merged.user_id) {
                f.startup_name = merged.company_name || merged.name;
              }
            });
          }
        }

        // 2. If JUDGE: Propagate name, email, and company_name to db.judges profile
        if (merged.user_type === UserType.JUDGE) {
          const jId = merged.judge_id;
          const judgeProfile = db.judges.find((j: any) => j.judge_id === jId || j.email === oldUser.email || j.name === oldUser.name);
          if (judgeProfile) {
            judgeProfile.name = merged.name;
            judgeProfile.email = merged.email;
            if (merged.company_name) {
              judgeProfile.company = merged.company_name;
            }
          }
        }

        // 3. If CLIENT: Propagate name to client_name in db.events
        if (merged.user_type === UserType.CLIENT) {
          const cId = merged.client_id || merged.user_id;
          if (db.events) {
            db.events.forEach((e: any) => {
              if (e.client_id === cId || e.client_id === merged.user_id || e.client_name === oldUser.name) {
                e.client_name = merged.name;
              }
            });
          }
        }

        return db.users[idx];
      }
      throw new Error('User not found');
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `회원 정보 수정 완료: ${data.name} (${data.user_type})`,
        `이메일: ${data.email}, 상태: ${data.status}`
      );
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['judges'] });
      queryClient.invalidateQueries({ queryKey: ['aiFeedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['eventStartups'] });
    }
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (userId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const db = getDb();
      if (!db.users) db.users = [];
      const idx = db.users.findIndex((u: any) => u.user_id === userId);
      if (idx !== -1) {
        const deleted = db.users[idx];
        db.users.splice(idx, 1);
        return deleted;
      }
      throw new Error('User not found');
    },
    onSuccess: (data) => {
      addLog(
        'WARN',
        'ACTION',
        `회원 정보 삭제 완료: ${data.name} (${data.user_type})`,
        `이메일: ${data.email} 계정이 영구 삭제되었습니다.`
      );
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

// 10. Update & Delete Event Mutations
export function useUpdateEventMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (updated: Event) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const db = getDb();
      const idx = db.events.findIndex((e: Event) => e.event_id === updated.event_id);
      if (idx !== -1) {
        db.events[idx] = { ...db.events[idx], ...updated, updated_at: new Date().toISOString() };

        // Synchronize eventStartups based on startup_rep_ids
        if (!db.eventStartups) db.eventStartups = [];
        const repIds = (updated as any).startup_rep_ids || [];
        
        // Get all startup users matching the selected IDs
        const startupUsers = (db.users || []).filter((u: any) => u.user_type === UserType.STARTUP && repIds.includes(u.user_id));
        
        // 1. Filter out eventStartups for this event that are no longer selected
        const allowedStartupIds = startupUsers.map((u: any) => u.startup_id || u.user_id);
        db.eventStartups = db.eventStartups.filter((es: any) => {
          if (es.event_id !== updated.event_id) return true;
          return allowedStartupIds.includes(es.startup_id);
        });

        // 2. Add or update selected startups
        startupUsers.forEach((user: any, index: number) => {
          const sId = user.startup_id || user.user_id;
          const exists = db.eventStartups.some((es: any) => es.event_id === updated.event_id && es.startup_id === sId);
          if (!exists) {
            db.eventStartups.push({
              id: `es-uuid-${Date.now()}-${sId}`,
              event_id: updated.event_id,
              startup_id: sId,
              startup_name: user.company_name || user.name,
              presentation_order: index + 1,
              presentation_time_minutes: 20,
              status: 'REGISTERED'
            });
          } else {
            // Update startup name in case it changed
            const es = db.eventStartups.find((e: any) => e.event_id === updated.event_id && e.startup_id === sId);
            if (es) {
              es.startup_name = user.company_name || user.name;
            }
          }
        });

        return db.events[idx];
      }
      throw new Error('Event not found');
    },
    onSuccess: (data) => {
      addLog(
        'SUCCESS',
        'ACTION',
        `행사 정보 수정 완료: ${data.event_title}`,
        `상태: ${data.status}, 장소: ${data.venue_address}`
      );
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['eventStartups'] });
    }
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (eventId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const db = getDb();
      const idx = db.events.findIndex((e: Event) => e.event_id === eventId);
      if (idx !== -1) {
        const deleted = db.events[idx];
        db.events.splice(idx, 1);
        return deleted;
      }
      throw new Error('Event not found');
    },
    onSuccess: (data) => {
      addLog(
        'WARN',
        'ACTION',
        `행사 삭제 완료: ${data.event_title}`,
        `발주처: ${data.client_name} 관련 행사 데이터가 파기되었습니다.`
      );
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });
}

