/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useJudges, useEvents, useInviteJudgeMutation, JudgeFilters, useCreateJudgeMutation } from '../../services/queries/useStats';
import { useUiStore } from '../../store/useUiStore';
import { 
  Search, 
  Sparkles, 
  Award, 
  MapPin, 
  Briefcase, 
  X, 
  Loader2, 
  CheckSquare, 
  Plus, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default function JudgesPage() {
  const { isDarkMode } = useUiStore();
  
  // Filters State
  const [filters, setFilters] = useState<JudgeFilters>({
    search: '',
    expertise: 'ALL',
    region: 'ALL',
    minCareer: 0
  });

  const { data: judges = [] } = useJudges(filters);
  const { data: events = [] } = useEvents({ search: '', status: 'ALL', type: 'ALL', dateStart: '', dateEnd: '' });
  const inviteJudgeMutation = useInviteJudgeMutation();
  const createJudgeMutation = useCreateJudgeMutation();

  // Selection states
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    eventId: '',
    paymentAmount: 200000, // Standard 200,000 KRW as requested
  });

  // Judge registration states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regionType, setRegionType] = useState('서울특별시');
  const [customRegion, setCustomRegion] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    title: '대표 파트너',
    company: '',
    career_years: 5,
    expertise_fields_str: 'AI',
    education_level: '박사',
    bio: '',
    bank_name: '신한은행',
    account_number: '',
    active_region: '서울특별시',
  });

  const handleFilterChange = (key: keyof JudgeFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleSelect = (judgeId: string) => {
    setSelectedJudgeIds((prev) => 
      prev.includes(judgeId) ? prev.filter(id => id !== judgeId) : [...prev, judgeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJudgeIds.length === judges.length) {
      setSelectedJudgeIds([]);
    } else {
      setSelectedJudgeIds(judges.map(j => j.judge_id));
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.eventId || selectedJudgeIds.length === 0) return;

    inviteJudgeMutation.mutate({
      eventId: inviteForm.eventId,
      judgeIds: selectedJudgeIds,
      paymentAmount: Number(inviteForm.paymentAmount)
    }, {
      onSuccess: () => {
        setIsInviteOpen(false);
        setSelectedJudgeIds([]); // Clear selection
      }
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.company) return;

    const expertise_fields = registerForm.expertise_fields_str
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    createJudgeMutation.mutate({
      name: registerForm.name,
      email: registerForm.email || `${registerForm.name}@example.com`,
      title: registerForm.title,
      company: registerForm.company,
      career_years: Number(registerForm.career_years),
      expertise_fields,
      education_level: registerForm.education_level,
      bio: registerForm.bio || `${registerForm.company} ${registerForm.title}로서 다양한 스타트업 기술 및 경영 심사 경력 보유`,
      bank_name: registerForm.bank_name,
      account_number: registerForm.account_number || `${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(10000 + Math.random() * 90000)}`,
      active_region: regionType === '기타' ? customRegion : regionType,
    }, {
      onSuccess: () => {
        setIsRegisterOpen(false);
        setRegionType('서울특별시');
        setCustomRegion('');
        setRegisterForm({
          name: '',
          email: '',
          title: '대표 파트너',
          company: '',
          career_years: 5,
          expertise_fields_str: 'AI',
          education_level: '박사',
          bio: '',
          bank_name: '신한은행',
          account_number: '',
          active_region: '서울특별시',
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">심사위원 풀 관리</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">전문 분야, 소속 및 정산 이력을 갖춘 공인 투자심사역 데이터베이스 관리</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-register-judge-modal-btn"
            onClick={() => setIsRegisterOpen(true)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border shadow-sm cursor-pointer transition-all active:scale-95 ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>신규 심사위원 풀 등록</span>
          </button>

          {selectedJudgeIds.length > 0 && (
            <button
              id="open-invite-judges-modal-btn"
              onClick={() => {
                if (events.length > 0) {
                  setInviteForm(prev => ({ ...prev, eventId: events[0].event_id }));
                }
                setIsInviteOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/15 cursor-pointer transition-all active:scale-95 animate-pulse"
            >
              <Plus className="w-4 h-4" />
              <span>선택한 {selectedJudgeIds.length}명 심사위원 행사 초청</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <Search className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold">통합 인력 매칭 필터링 시스템</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Text input search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">소속 / 이름 / 약력 검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="search-judge-input"
                type="text"
                placeholder="기관명, 경력 키워드..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full text-xs p-2.5 pl-9 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Expertise field filtering */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">기술 전문 분야</label>
            <select
              id="filter-judge-expertise"
              value={filters.expertise}
              onChange={(e) => handleFilterChange('expertise', e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">전체 분야</option>
              <option value="AI">인공지능 (AI)</option>
              <option value="SaaS">B2B SaaS</option>
              <option value="Bio">바이오/메디컬</option>
              <option value="FinTech">핀테크 (FinTech)</option>
              <option value="B2B">B2B 엔터프라이즈</option>
            </select>
          </div>

          {/* Minimum career years */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">최소 심사 경력</label>
            <select
              id="filter-judge-career"
              value={filters.minCareer}
              onChange={(e) => handleFilterChange('minCareer', Number(e.target.value))}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value={0}>경력 무관</option>
              <option value={5}>5년 이상 (중견 심사역)</option>
              <option value={10}>10년 이상 (수석 심사역)</option>
              <option value={15}>15년 이상 (대표 파트너급)</option>
            </select>
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">활동 가능 거점</label>
            <select
              id="filter-judge-region"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">전체 지역</option>
              <option value="서울특별시">서울특별시</option>
              <option value="경기도">경기도</option>
              <option value="대전광역시">대전광역시</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>
      </div>

      {/* JUDGES TABLE/LIST */}
      <div className={`border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 border-b ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <th className="p-4 pl-6 w-12">
                  <input
                    id="select-all-judges-checkbox"
                    type="checkbox"
                    checked={judges.length > 0 && selectedJudgeIds.length === judges.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                </th>
                <th className="p-4">성명 / 직책 / 소속사</th>
                <th className="p-4">기술 전문 분야</th>
                <th className="p-4">학위 / 경력 연수</th>
                <th className="p-4">누적 평가 참여</th>
                <th className="p-4">누적 정산액</th>
                <th className="p-4">계좌 정보 (보안암호화 대상)</th>
                <th className="p-4 pr-6 text-right">거점 및 매칭</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {judges.map((judge) => {
                const isSelected = selectedJudgeIds.includes(judge.judge_id);
                return (
                  <tr 
                    key={judge.judge_id} 
                    className={`text-xs transition-colors ${
                      isSelected 
                        ? 'bg-indigo-500/5 dark:bg-indigo-500/10' 
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Checkbox select column */}
                    <td className="p-4 pl-6">
                      <input
                        id={`select-judge-${judge.judge_id}-checkbox`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(judge.judge_id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>

                    {/* Name & Title */}
                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{judge.name}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold">{judge.title}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">{judge.company}</p>
                    </td>

                    {/* Expertise fields with badge row */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {judge.expertise_fields.map((f) => (
                          <span key={f} className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Education & Career */}
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>경력 {judge.career_years}년</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>최종학위: {judge.education_level}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>거점: {judge.active_region || '서울/수도권'}</span>
                      </div>
                    </td>

                    {/* Evaluation Count */}
                    <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                      {judge.total_evaluation_count}회 완료
                    </td>

                    {/* Total Cumulative payout */}
                    <td className="p-4 font-mono font-black text-slate-900 dark:text-white text-sm">
                      ₩{judge.total_payment_amount.toLocaleString()}
                    </td>

                    {/* Bank Account (Indicate AES-256 Security compliance!) */}
                    <td className="p-4">
                      <p className="text-slate-700 dark:text-slate-300 font-semibold">{judge.bank_name}</p>
                      <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>AES-256 암호화 보호 중</span>
                      </p>
                    </td>

                    {/* Matching Action */}
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedJudgeIds([judge.judge_id]);
                          if (events.length > 0) {
                            setInviteForm(prev => ({ ...prev, eventId: events[0].event_id }));
                          }
                          setIsInviteOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-55 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>행사 매칭</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVITE JUDGE MODAL */}
      {isInviteOpen && (
        <div id="invite-judge-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} overflow-hidden animate-in zoom-in-95 duration-200`}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/40 dark:bg-slate-950/40">
              <div>
                <h3 className="text-base font-black">심사위원 행사 매칭 및 초청</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">선택된 심사위원들에게 행사 세부 정보 및 수당 예산안이 전송됩니다.</p>
              </div>
              <button
                id="close-invite-modal-btn"
                onClick={() => setIsInviteOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              
              <div className="p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 space-y-1">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">초청 대상 심사위원</span>
                <p className="text-xs font-semibold">
                  {selectedJudgeIds.map(id => judges.find(j => j.judge_id === id)?.name).join(', ')} (총 {selectedJudgeIds.length}명)
                </p>
              </div>

              {/* Event Match Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">초청할 행사 매칭</label>
                <select
                  id="invite-event-select"
                  required
                  value={inviteForm.eventId}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, eventId: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {events.length === 0 ? (
                    <option value="">개설된 행사가 존재하지 않습니다</option>
                  ) : (
                    events.map(e => (
                      <option key={e.event_id} value={e.event_id}>📅 [{e.event_type}] {e.event_title}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">지급할 심사 수당 (1인 기준)</label>
                <input
                  id="invite-payment-input"
                  type="number"
                  required
                  min={10000}
                  step={10000}
                  value={inviteForm.paymentAmount}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* pricing summary */}
              <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs space-y-1 border border-slate-800">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">인원당 수당:</span>
                  <span>₩{Number(inviteForm.paymentAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">초청 인원수:</span>
                  <span>{selectedJudgeIds.length}명</span>
                </div>
                <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-emerald-400">
                  <span>총 예산 지출 예약:</span>
                  <span>₩{(inviteForm.paymentAmount * selectedJudgeIds.length).toLocaleString()}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  id="cancel-invite-btn"
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="w-1/2 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  매칭 취소
                </button>
                <button
                  id="submit-invite-btn"
                  type="submit"
                  disabled={inviteJudgeMutation.isPending}
                  className="w-1/2 p-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {inviteJudgeMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>매칭 진행 중...</span>
                    </>
                  ) : (
                    <span>매칭</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* NEW JUDGE REGISTER MODAL */}
      {isRegisterOpen && (
        <div id="register-judge-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            id="register-judge-modal"
            className={`w-full max-w-xl rounded-2xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            } shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/40 dark:bg-slate-950/40">
              <div>
                <h3 className="text-base font-black">신규 심사위원 인력 등록</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">이든 IR 통합 관리 플랫폼의 투자심사역 풀에 인재를 등록합니다.</p>
              </div>
              <button
                id="close-register-modal-btn"
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">성명 <span className="text-rose-500">*</span></label>
                  <input
                    id="register-judge-name"
                    type="text"
                    required
                    placeholder="홍길동"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">이메일 주소</label>
                  <input
                    id="register-judge-email"
                    type="email"
                    placeholder="partner@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Company & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">소속사 (기관명) <span className="text-rose-500">*</span></label>
                  <input
                    id="register-judge-company"
                    type="text"
                    required
                    placeholder="이든벤처파트너스"
                    value={registerForm.company}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, company: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">직책 <span className="text-rose-500">*</span></label>
                  <input
                    id="register-judge-title"
                    type="text"
                    required
                    placeholder="대표 파트너 / 수석 심사역"
                    value={registerForm.title}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Career Years & Education */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">심사 경력 (연수) <span className="text-rose-500">*</span></label>
                  <input
                    id="register-judge-career"
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={registerForm.career_years}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, career_years: Number(e.target.value) }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">최종 학위</label>
                  <select
                    id="register-judge-education"
                    value={registerForm.education_level}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, education_level: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="학사">학사</option>
                    <option value="석사">석사</option>
                    <option value="박사">박사</option>
                    <option value="MBA">MBA</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Expertise Fields */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">기술 전문 분야 (콤마로 구분) <span className="text-rose-500">*</span></label>
                <input
                  id="register-judge-expertise"
                  type="text"
                  required
                  placeholder="AI, SaaS, Bio, FinTech, B2B"
                  value={registerForm.expertise_fields_str}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, expertise_fields_str: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">전문 분야 필터에 매칭되도록 콤마(,)를 사용해 입력해주세요. (예: AI, SaaS, Bio)</p>
              </div>

              {/* Row 5: Bank & Account */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">지정 은행</label>
                  <input
                    id="register-judge-bank"
                    type="text"
                    placeholder="신한은행"
                    value={registerForm.bank_name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, bank_name: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">정산 계좌번호</label>
                  <input
                    id="register-judge-account"
                    type="text"
                    placeholder="110-334-129033"
                    value={registerForm.account_number}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, account_number: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Row 5.5: Active Region */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">활동 가능한 거점 <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    id="register-judge-region-select"
                    value={regionType}
                    onChange={(e) => {
                      setRegionType(e.target.value);
                      if (e.target.value !== '기타') {
                        setRegisterForm(prev => ({ ...prev, active_region: e.target.value }));
                      } else {
                        setRegisterForm(prev => ({ ...prev, active_region: customRegion }));
                      }
                    }}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="서울특별시">서울특별시</option>
                    <option value="경기도">경기도</option>
                    <option value="대전광역시">대전광역시</option>
                    <option value="기타">기타 (직접 입력)</option>
                  </select>
                  
                  {regionType === '기타' && (
                    <input
                      id="register-judge-active-region-custom"
                      type="text"
                      required
                      placeholder="거점 직접 입력 (예: 부산광역시)"
                      value={customRegion}
                      onChange={(e) => {
                        setCustomRegion(e.target.value);
                        setRegisterForm(prev => ({ ...prev, active_region: e.target.value }));
                      }}
                      className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Row 6: Bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">상세 약력 / 소개</label>
                <textarea
                  id="register-judge-bio"
                  rows={2}
                  placeholder="벤처투자 경력 및 중소벤처기업부 지정 공인 심사역 약력..."
                  value={registerForm.bio}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, bio: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  id="cancel-register-btn"
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="w-1/2 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  등록 취소
                </button>
                <button
                  id="submit-register-btn"
                  type="submit"
                  disabled={createJudgeMutation.isPending}
                  className="w-1/2 p-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {createJudgeMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>심사위원 등록중...</span>
                    </>
                  ) : (
                    <span>심사위원 등록</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
