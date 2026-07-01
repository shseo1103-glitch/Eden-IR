/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  useAiFeedbacks, 
  useApproveFeedbackMutation, 
  useEvents, 
  useEventJudges, 
  useEventStartups, 
  useJudgeOpinions, 
  useSaveJudgeOpinionMutation, 
  useGenerateAiFeedbackMutation, 
  useJudges 
} from '../../services/queries/useStats';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';
import { UserType } from '../../types';
import { 
  Sparkles, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  BarChart4, 
  TrendingUp, 
  FileCheck2,
  Users2,
  ChevronDown,
  UserCheck,
  Loader2,
  FileText,
  Save,
  Check
} from 'lucide-react';

export default function FeedbacksPage() {
  const { isDarkMode } = useUiStore();
  const { currentRole, currentUser } = useAuthStore();
  
  // Queries
  const { data: feedbacks = [], isLoading: isFeedbacksLoading } = useAiFeedbacks();
  const { data: allEvents = [], isLoading: isEventsLoading } = useEvents({ search: '', status: 'ALL', type: 'ALL', dateStart: '', dateEnd: '' });
  const { data: allEventJudges = [] } = useEventJudges();
  const { data: allJudges = [] } = useJudges({ search: '', expertise: 'ALL', region: 'ALL', minCareer: 0 });
  const { data: allEventStartups = [] } = useEventStartups();
  const { data: allJudgeOpinions = [] } = useJudgeOpinions();

  // Mutations
  const approveFeedbackMutation = useApproveFeedbackMutation();
  const saveJudgeOpinionMutation = useSaveJudgeOpinionMutation();
  const generateAiFeedbackMutation = useGenerateAiFeedbackMutation();

  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Admin opinion input form states
  const [opinionJudgeId, setOpinionJudgeId] = useState<string>('');
  const [opinionStartupId, setOpinionStartupId] = useState<string>('');
  const [opinionText, setOpinionText] = useState<string>('');

  // Filter events: Client should only see their own events. Startups should only see their matched events.
  const clientEvents = allEvents.filter((e) => {
    if (currentRole === UserType.CLIENT) {
      return (
        e.client_id === currentUser?.client_id || 
        e.client_id === currentUser?.user_id || 
        e.client_name === currentUser?.name
      );
    }
    if (currentRole === UserType.STARTUP) {
      const startupRepIds = (e as any).startup_rep_ids || [];
      return startupRepIds.includes(currentUser?.user_id);
    }
    return true;
  });

  // Pre-select the first event
  useEffect(() => {
    if (clientEvents.length > 0 && !selectedEventId) {
      const defaultEvent = clientEvents.find(e => e.status === 'COMPLETED' || e.status === 'IN_PROGRESS') || clientEvents[0];
      setSelectedEventId(defaultEvent.event_id);
    }
  }, [clientEvents, selectedEventId]);

  const selectedEvent = allEvents.find(e => e.event_id === selectedEventId);
  const isEventEnded = selectedEvent 
    ? (selectedEvent.event_date < '2026-07-01' || selectedEvent.status === 'COMPLETED' || selectedEvent.status === 'CANCELLED')
    : false;

  // Real matched judges
  const matchedJudges = allEventJudges
    .filter(ej => ej.event_id === selectedEventId)
    .map(ej => {
      const judge = allJudges.find(j => j.judge_id === ej.judge_id);
      return {
        judge_id: ej.judge_id,
        name: judge ? judge.name : '알수없음',
        company: judge ? judge.company : '심사위원 풀',
        title: judge ? judge.title : '전문 심사역',
        expertise: judge ? judge.expertise_fields.join(', ') : 'AI',
        region: judge ? judge.active_region : '서울특별시',
        status: isEventEnded ? '자동 매칭 해제' : (ej.attendance_confirmed ? '출석완료' : '매칭 완료')
      };
    });

  // Startups in the selected event
  const currentEventStartups = allEventStartups.filter(s => s.event_id === selectedEventId);

  // Synchronize opinion text based on judge & startup selection
  useEffect(() => {
    if (selectedEventId && opinionJudgeId && opinionStartupId) {
      const saved = allJudgeOpinions.find(
        o => o.event_id === selectedEventId && o.judge_id === opinionJudgeId && o.startup_id === opinionStartupId
      );
      setOpinionText(saved ? saved.opinion : '');
    } else {
      setOpinionText('');
    }
  }, [selectedEventId, opinionJudgeId, opinionStartupId, allJudgeOpinions]);

  // Set initial dropdown values when selection changes
  useEffect(() => {
    if (matchedJudges.length > 0) {
      setOpinionJudgeId(matchedJudges[0].judge_id);
    } else {
      setOpinionJudgeId('');
    }
  }, [selectedEventId, allEventJudges]);

  useEffect(() => {
    if (currentEventStartups.length > 0) {
      setOpinionStartupId(currentEventStartups[0].startup_id);
    } else {
      setOpinionStartupId('');
    }
  }, [selectedEventId, allEventStartups]);

  // Check if all matched judges have submitted at least one evaluation opinion
  const isOpinionsComplete = matchedJudges.length > 0 && matchedJudges.every(j => {
    return allJudgeOpinions.some(o => o.event_id === selectedEventId && o.judge_id === j.judge_id && o.opinion.trim().length > 0);
  });

  const handleApprove = (feedbackId: string) => {
    approveFeedbackMutation.mutate({ feedbackId });
  };

  const handleSaveOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !opinionJudgeId || !opinionStartupId || !opinionText.trim()) return;

    saveJudgeOpinionMutation.mutate({
      eventId: selectedEventId,
      judgeId: opinionJudgeId,
      startupId: opinionStartupId,
      opinion: opinionText
    });
  };

  const handleGenerateAiFeedback = () => {
    if (!selectedEventId || !isOpinionsComplete) return;
    generateAiFeedbackMutation.mutate({ eventId: selectedEventId });
  };

  const isClientOrAdmin = currentRole === UserType.CLIENT || currentRole === UserType.ADMIN || currentRole === UserType.SUPER_ADMIN;
  const isSuperOrAdmin = currentRole === UserType.SUPER_ADMIN || currentRole === UserType.ADMIN;

  // Filter feedbacks belonging to selected event
  const filteredFeedbacks = feedbacks.filter(fb => fb.event_id === selectedEventId);

  const isLoading = isFeedbacksLoading || isEventsLoading;

  if (isLoading) {
    return <div className="p-16 text-center text-xs text-slate-400">AI 피드백 목록 산출 중...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black tracking-tight">AI 심사평가 피드백 승인</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">심사위원 원본 평가를 AI 모델(Gemini 1.5 Flash)로 가공한 결과물 검토 및 발주처 승인 프로세스</p>
      </div>

      {/* Event Selection & Matched Judges Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Event Selector Card */}
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'} lg:col-span-2 space-y-4`}>
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">대상 행사 선택 (Event Selection)</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">조회 및 승인할 귀사 행사</label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className={`w-full text-xs p-3.5 pr-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none cursor-pointer ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {clientEvents.length === 0 ? (
                  <option value="">참여한 행사가 존재하지 않습니다.</option>
                ) : (
                  clientEvents.map(e => (
                    <option key={e.event_id} value={e.event_id}>
                      📅 {e.event_title} ({e.event_date})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-3.5 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Matched Judges Card */}
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <Users2 className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">행사 매칭 전문 심사위원단</span>
          </div>

          <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
            {matchedJudges.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-4 text-center">이 행사에 매칭된 심사위원이 없습니다.</p>
            ) : (
              matchedJudges.map((j, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">{j.name}</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-medium">{j.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{j.company}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isEventEnded 
                        ? 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                        : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10'
                    }`}>
                      <UserCheck className="w-3 h-3" />
                      <span>{j.status}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* SUPER ADMIN & ADMIN PANEL: Judge Opinion Input Console */}
      {isSuperOrAdmin && selectedEventId && (
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'} space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-indigo-500" />
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">최고관리자/관리자 전용: 심사위원 평가의견 등록 통제</span>
                <p className="text-[10px] text-slate-400">배정된 심사위원이 각 발표기업에 대해 평가한 원본 서술 의견을 기입하십시오.</p>
              </div>
            </div>

            {/* AI EVALUATION REPORT GENERATION BUTTON */}
            <div>
              <button
                id="generate-ai-feedback-btn"
                onClick={handleGenerateAiFeedback}
                disabled={!isOpinionsComplete || generateAiFeedbackMutation.isPending}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isOpinionsComplete && !generateAiFeedbackMutation.isPending
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white cursor-pointer shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200/50'
                }`}
              >
                {generateAiFeedbackMutation.isPending ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Gemini 가공 레포트 발행 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>AI 심사평가 보고서 발행</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!isOpinionsComplete && (
            <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>발행 불가 안내:</strong> 현재 행사에 배정된 <strong>모든 심사위원({matchedJudges.length}명)</strong>이 최소 1개 기업 이상의 심사평가를 입력해야 <strong>AI 심사평가 보고서 발행</strong>이 가능합니다. 아래 입력 폼에서 의견을 저장해 주십시오.
              </p>
            </div>
          )}

          {/* Form and Opinion Audit Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form */}
            <form onSubmit={handleSaveOpinion} className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Select Judge */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">심사위원 선택</label>
                  <select
                    value={opinionJudgeId}
                    onChange={(e) => setOpinionJudgeId(e.target.value)}
                    className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {matchedJudges.map(j => (
                      <option key={j.judge_id} value={j.judge_id}>👤 {j.name} ({j.company.substring(0, 8)}...)</option>
                    ))}
                  </select>
                </div>

                {/* Select Startup */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">발표기업 선택</label>
                  <select
                    value={opinionStartupId}
                    onChange={(e) => setOpinionStartupId(e.target.value)}
                    className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {currentEventStartups.map(s => (
                      <option key={s.startup_id} value={s.startup_id}>🚀 {s.startup_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Opinion Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">심사위원 원본 평가 의견</label>
                <textarea
                  required
                  rows={4}
                  placeholder="예: 독자적인 융합 알고리즘 설계 능력은 업계 최고 수준으로 평가되나, B2B 스케일업 파이프라인의 핵심 타겟 고객 군 설정이 다소 투박합니다. 마케팅 비용 효율화를 정밀하게 보완해야 합니다."
                  value={opinionText}
                  onChange={(e) => setOpinionText(e.target.value)}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                id="save-opinion-btn"
                type="submit"
                disabled={saveJudgeOpinionMutation.isPending}
                className="w-full p-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                {saveJudgeOpinionMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>심사의견 기록저장 (Save)</span>
              </button>
            </form>

            {/* Opinion Audit Table */}
            <div className="lg:col-span-7 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">행사 평가의견 매트릭스 (Opinions Matrix)</span>
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className={`bg-slate-50 dark:bg-slate-950 font-bold text-slate-400 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <th className="p-2.5 pl-3">심사위원</th>
                      <th className="p-2.5">발표기업</th>
                      <th className="p-2.5">심사의견 기록</th>
                      <th className="p-2.5 text-right pr-3">기록 여부</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedJudges.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 italic">배정된 심사위원이 없습니다.</td>
                      </tr>
                    ) : (
                      matchedJudges.map(j => {
                        return currentEventStartups.map(s => {
                          const opinion = allJudgeOpinions.find(o => o.event_id === selectedEventId && o.judge_id === j.judge_id && o.startup_id === s.startup_id);
                          return (
                            <tr key={`${j.judge_id}-${s.startup_id}`} className="border-t border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                              <td className="p-2.5 pl-3 font-semibold">{j.name}</td>
                              <td className="p-2.5 text-slate-500">{s.startup_name}</td>
                              <td className="p-2.5 text-slate-400 italic max-w-[140px] truncate">
                                {opinion ? `"${opinion.opinion}"` : '미입력'}
                              </td>
                              <td className="p-2.5 text-right pr-3">
                                {opinion ? (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>저장됨</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10">
                                    <span>기입 대기</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Security Info Card */}
      <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-700 dark:text-slate-300">
          <p className="font-bold">보안 및 정책 준수 안내 (Evaluation Security Control)</p>
          <p className="leading-relaxed">
            평가 원본 데이터는 발주처(CLIENT) 및 시스템 관리자만 확인 가능하며, 발표 스타트업에게는 익명화 및 종합 요약된 <strong>AI 가공 분석 레포트</strong>만 전달됩니다. 스타트업 전송을 위해서는 발주처의 최종 발송 승인이 필요합니다.
          </p>
        </div>
      </div>

      {/* Feedback List Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredFeedbacks.length === 0 ? (
          <div className={`p-16 text-center rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
            <p className="text-xs font-semibold">선택된 행사의 AI 가공 피드백 레포트가 아직 생성되지 않았습니다.</p>
            <p className="text-[10px] text-slate-400 mt-1">심사위원이 평가를 제출 완료하면 AI 엔진이 즉시 종합 보고서를 가공합니다.</p>
          </div>
        ) : (
          filteredFeedbacks.map((fb) => (
            <div 
              id={`feedback-card-${fb.feedback_id}`}
              key={fb.feedback_id} 
              className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'
              } space-y-6 transition-all duration-300 shadow-xl shadow-slate-100/5`}
            >
              {/* Header of Feedback block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">🚀 {fb.startup_name} 종합 AI 피드백 레포트</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">생성 시점: {new Date(fb.generated_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Status and Action controls */}
                <div className="flex items-center gap-2">
                  {fb.approved_by_client ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>발주처 승인완료 & 발송됨</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>검토 대기중</span>
                      </span>
                      {isClientOrAdmin && (
                        <button
                          id={`approve-feedback-${fb.feedback_id}-btn`}
                          onClick={() => handleApprove(fb.feedback_id)}
                          disabled={approveFeedbackMutation.isPending}
                          className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/15 rounded-xl transition-all cursor-pointer active:scale-95"
                        >
                          <Send className="w-3 h-3" />
                          <span>피드백 전송 승인</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Summary Statement */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">전체 요약 (Executive Summary)</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {fb.overall_summary}
                </div>
              </div>

              {/* Strengths & Weaknesses Split Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Core Strengths */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    <span>핵심 강점 (Key Strengths)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {fb.key_strengths.map((str, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-500 text-[10px] uppercase font-mono">[{str.category}]</span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-1">{str.point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Improvements */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>개선 필요 사항 (Key Improvements)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {fb.key_improvements.map((imp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-bold text-amber-600 dark:text-amber-500 text-[10px] uppercase font-mono">[{imp.category}]</span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-1">{imp.point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )))}
      </div>

    </div>
  );
}
