/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useEvents, useCreateEventMutation, EventFilters, useUpdateEventMutation, useDeleteEventMutation, useUsers } from '../../services/queries/useStats';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';
import { UserType, Event } from '../../types';
import { 
  Search, 
  Plus, 
  X, 
  MapPin, 
  Calendar, 
  Briefcase, 
  CheckCircle, 
  Loader2, 
  HelpCircle,
  Video,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function EventsPage() {
  const { isDarkMode } = useUiStore();
  const { currentRole, currentUser } = useAuthStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    status: 'ALL',
    type: 'ALL',
    dateStart: '',
    dateEnd: ''
  });

  const { data: allEvents = [], isLoading } = useEvents(filters);
  const { data: users = [] } = useUsers();
  const createEventMutation = useCreateEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const deleteEventMutation = useDeleteEventMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<Event | null>(null);

  // Filter events based on role: 발주처 담당자(CLIENT)는 자신의 행사만 볼 수 있습니다.
  const events = allEvents.filter((e) => {
    if (currentRole === UserType.CLIENT) {
      return (
        e.client_id === currentUser?.client_id || 
        e.client_id === currentUser?.user_id || 
        e.client_name === currentUser?.name
      );
    }
    return true;
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    event_id: '',
    event_title: '',
    client_id: '',
    client_name: '',
    event_type: 'IR' as Event['event_type'],
    event_date: '',
    event_start_time: '',
    venue_address: '',
    venue_online: false,
    package_type: 'STANDARD_800' as Event['package_type'],
    estimated_amount: 8000000,
    status: 'PENDING' as Event['status'],
    assigned_staff_name: '',
    startup_rep_ids: [] as string[],
    custom_option_text: '',
    custom_option_price: 0,
    has_custom_option: false,
  });

  const handleOpenEditEvent = (event: Event) => {
    setSelectedEventForEdit(event);
    setEditForm({
      event_id: event.event_id,
      event_title: event.event_title,
      client_id: event.client_id || '',
      client_name: event.client_name || '',
      event_type: event.event_type,
      event_date: event.event_date,
      event_start_time: event.event_start_time,
      venue_address: event.venue_address,
      venue_online: event.venue_online,
      package_type: event.package_type,
      estimated_amount: event.estimated_amount,
      status: event.status,
      assigned_staff_name: event.assigned_staff_name || '',
      startup_rep_ids: (event as any).startup_rep_ids || [],
      custom_option_text: event.additional_options?.custom_option_text || '',
      custom_option_price: event.additional_options?.custom_option_price || 0,
      has_custom_option: !!event.additional_options?.custom_option_text,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForEdit) return;

    let baseAmount = 8000000;
    if (editForm.package_type === 'BASIC_500') baseAmount = 5000000;
    if (editForm.package_type === 'STANDARD_800') baseAmount = 8000000;
    if (editForm.package_type === 'PREMIUM_1200') baseAmount = 12000000;

    const optPrice = Number(editForm.custom_option_price) || 0;
    const finalAmount = editForm.has_custom_option ? (baseAmount + optPrice) : baseAmount;

    updateEventMutation.mutate({
      ...selectedEventForEdit,
      event_title: editForm.event_title,
      client_name: editForm.client_name,
      event_type: editForm.event_type,
      event_date: editForm.event_date,
      event_start_time: editForm.event_start_time,
      venue_address: editForm.venue_address,
      venue_online: editForm.venue_online,
      package_type: editForm.package_type,
      estimated_amount: finalAmount,
      status: editForm.status,
      assigned_staff_name: editForm.assigned_staff_name || undefined,
      startup_rep_ids: editForm.startup_rep_ids,
      additional_options: {
        ...selectedEventForEdit.additional_options,
        custom_option_text: editForm.has_custom_option ? editForm.custom_option_text : undefined,
        custom_option_price: editForm.has_custom_option ? optPrice : undefined,
      }
    } as any, {
      onSuccess: () => {
        setIsEditOpen(false);
      }
    });
  };

  const handleDeleteEvent = () => {
    if (!selectedEventForEdit) return;
    if (window.confirm(`[경고] '${editForm.event_title}' 행사를 정말 삭제하시겠습니까?`)) {
      deleteEventMutation.mutate(selectedEventForEdit.event_id, {
        onSuccess: () => {
          setIsEditOpen(false);
        }
      });
    }
  };

  // New Event Form State
  const [newForm, setNewForm] = useState({
    event_title: '',
    client_name: currentUser?.name || '한국연구재단',
    event_type: 'IR' as Event['event_type'],
    event_date: '2026-09-15',
    event_start_time: '14:00',
    venue_address: '서울시 강남구 테헤란로 123 스타트업 타워 4층',
    venue_online: false,
    package_type: 'STANDARD_800' as Event['package_type'],
    estimated_amount: 8000000,
    custom_option_text: '',
    has_custom_option: false,
  });

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatically match package pricing as specified in Quotation response
    let amount = 8000000;
    if (newForm.package_type === 'BASIC_500') amount = 5000000;
    if (newForm.package_type === 'PREMIUM_1200') amount = 12000000;

    createEventMutation.mutate({
      client_id: currentUser?.user_id || 'client-uuid-999',
      client_name: newForm.client_name,
      event_title: newForm.event_title,
      event_type: newForm.event_type,
      event_date: newForm.event_date,
      event_start_time: newForm.event_start_time,
      venue_address: newForm.venue_address,
      venue_online: newForm.venue_online,
      package_type: newForm.package_type,
      estimated_amount: amount,
      status: 'PENDING', // default pending review
      additional_options: {
        speaker: true,
        equipment: ['LAPTOP', 'PROJECTOR'],
        custom_option_text: newForm.has_custom_option ? newForm.custom_option_text : undefined,
        custom_option_price: 0,
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        // Reset form
        setNewForm({
          event_title: '',
          client_name: currentUser?.name || '한국연구재단',
          event_type: 'IR',
          event_date: '2026-09-15',
          event_start_time: '14:00',
          venue_address: '서울시 강남구 테헤란로 123 스타트업 타워 4층',
          venue_online: false,
          package_type: 'STANDARD_800',
          estimated_amount: 8000000,
          custom_option_text: '',
          has_custom_option: false,
        });
      }
    });
  };

  // Status Style Helper
  const getStatusStyle = (status: Event['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 animate-pulse';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
    }
  };

  const isClientOrAdmin = currentRole === UserType.CLIENT || currentRole === UserType.ADMIN || currentRole === UserType.SUPER_ADMIN;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">행사 현황 모니터링</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">이든 IR 시스템에 등록된 기획, 진행, 완료 단계 행사 타임라인 관리</p>
        </div>

        {/* Dynamic Display of Reservation Button based on client authorization */}
        {isClientOrAdmin && (
          <button
            id="open-create-event-modal-btn"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/15 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>행사 예약 및 견적 요청</span>
          </button>
        )}
      </div>

      {/* MULTI FILTERING SYSTEM PANEL */}
      <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <Briefcase className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold">다중 조건 상세 검색 필터</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Keyword Search */}
          <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">검색어 (행사명/발주처)</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="search-event-input"
                type="text"
                placeholder="검색어 입력..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full text-xs p-2.5 pl-9 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">진행 상태</label>
            <select
              id="filter-event-status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">전체 보기</option>
              <option value="PENDING">대기중 (PENDING)</option>
              <option value="CONFIRMED">예약확정 (CONFIRMED)</option>
              <option value="IN_PROGRESS">행사진행 (IN_PROGRESS)</option>
              <option value="COMPLETED">정산완료 (COMPLETED)</option>
              <option value="CANCELLED">취소됨 (CANCELLED)</option>
            </select>
          </div>

          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">행사 유형</label>
            <select
              id="filter-event-type"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">전체 유형</option>
              <option value="IR">IR 투자유치 피칭</option>
              <option value="성과공유회">성과 공유회</option>
              <option value="사업설명회">사업 설명회</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">시작 일자</label>
            <input
              id="filter-event-start-date"
              type="date"
              value={filters.dateStart}
              onChange={(e) => handleFilterChange('dateStart', e.target.value)}
              className={`w-full text-xs p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">종료 일자</label>
            <input
              id="filter-event-end-date"
              type="date"
              value={filters.dateEnd}
              onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
              className={`w-full text-xs p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>
      </div>

      {/* EVENTS TABLE/LIST CARD */}
      <div className={`border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl overflow-hidden`}>
        {isLoading ? (
          <div className="p-16 text-center text-xs text-slate-400">행사 목록 조회 중...</div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-500">일치하는 행사 정보가 존재하지 않습니다.</p>
            <p className="text-xs text-slate-400">필터 설정값을 다시 확인하거나 새로운 예약을 요청해 보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 border-b ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <th className="p-4 pl-6">행사명 및 발주처</th>
                  <th className="p-4">일시</th>
                  <th className="p-4">유형</th>
                  <th className="p-4">패키지 / 견적금액</th>
                  <th className="p-4">진행상태</th>
                  <th className="p-4">담당 책임자</th>
                  <th className="p-4 pr-6 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {events.map((event) => (
                  <tr 
                    key={event.event_id} 
                    className={`text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors`}
                  >
                    {/* Title & Client */}
                    <td className="p-4 pl-6 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{event.event_title}</p>
                        {event.venue_online ? (
                          <span className="flex items-center gap-1 text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold font-mono">
                            <Video className="w-2.5 h-2.5" />
                            <span>ONLINE</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold font-mono">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>OFFLINE</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{event.client_name || '미등록 발주처'}</p>
                    </td>

                    {/* Date Time */}
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.event_date}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 pl-5">오후 {event.event_start_time}</p>
                    </td>

                    {/* Type */}
                    <td className="p-4">
                      <span className="font-semibold">{event.event_type}</span>
                    </td>

                    {/* Package Price */}
                    <td className="p-4 space-y-0.5">
                      <p className="font-mono text-slate-400 dark:text-slate-500 font-bold text-[10px]">{event.package_type}</p>
                      <p className="font-bold text-slate-900 dark:text-white">₩{event.estimated_amount.toLocaleString()}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(event.status)}`}>
                        {event.status}
                      </span>
                    </td>

                    {/* Assigned Manager */}
                    <td className="p-4">
                      {event.assigned_staff_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            <User className="w-3 h-3" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-300">{event.assigned_staff_name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">배정 대기중</span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="p-4 pr-6 text-right">
                      {currentRole === UserType.SUPER_ADMIN || currentRole === UserType.ADMIN ? (
                        <button 
                          onClick={() => handleOpenEditEvent(event)}
                          className="px-3 py-1.5 rounded-xl border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-all cursor-pointer inline-flex items-center"
                        >
                          관리
                        </button>
                      ) : (
                        <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-500">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL FOR CLIENT REQUESTS */}
      {isCreateOpen && (
        <div id="create-event-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} overflow-hidden animate-in zoom-in-95 duration-200`}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/40 dark:bg-slate-950/40">
              <div>
                <h3 className="text-base font-black">행사 예약 및 원격 견적 요청</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">선택한 요금제 패키지와 추가 옵션에 맞춰 금액이 즉시 산정됩니다.</p>
              </div>
              <button
                id="close-create-event-modal-btn"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">행사명</label>
                <input
                  id="form-event-title"
                  type="text"
                  required
                  placeholder="예: 2026 에이아이테크 스타트업 IR 데이"
                  value={newForm.event_title}
                  onChange={(e) => setNewForm(prev => ({ ...prev, event_title: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Event Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">행사 유형</label>
                  <select
                    id="form-event-type"
                    value={newForm.event_type}
                    onChange={(e) => setNewForm(prev => ({ ...prev, event_type: e.target.value as Event['event_type'] }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="IR">IR 투자 피칭</option>
                    <option value="성과공유회">성과 공유회</option>
                    <option value="사업설명회">사업 설명회</option>
                  </select>
                </div>

                {/* Package Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">요금 패키지</label>
                  <select
                    id="form-package-type"
                    value={newForm.package_type}
                    onChange={(e) => setNewForm(prev => ({ ...prev, package_type: e.target.value as Event['package_type'] }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="BASIC_500">BASIC (₩5,000,000)</option>
                    <option value="STANDARD_800">STANDARD (₩8,000,000)</option>
                    <option value="PREMIUM_1200">PREMIUM (₩12,000,000)</option>
                  </select>
                </div>
              </div>

              {/* Custom Option requested by user */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newForm.has_custom_option}
                    onChange={(e) => setNewForm(prev => ({ ...prev, has_custom_option: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>➕ 선택 추가 옵션 요청 (요구사항 직접 기입)</span>
                </label>
                {newForm.has_custom_option && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">선택 옵션 요구사항</label>
                    <textarea
                      value={newForm.custom_option_text}
                      onChange={(e) => setNewForm(prev => ({ ...prev, custom_option_text: e.target.value }))}
                      placeholder="예: 전문 영한 동시 통역사 1명 배정 필요, 실시간 유튜브 중계 장비 대여 및 송출 감독 동반 희망"
                      rows={2}
                      className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                    <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-medium">* 접수 완료 후 담당 책임자가 추가 옵션의 견적 가격을 기입하여 최종 가격을 제공합니다.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Event Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">예약 희망일</label>
                  <input
                    id="form-event-date"
                    type="date"
                    required
                    value={newForm.event_date}
                    onChange={(e) => setNewForm(prev => ({ ...prev, event_date: e.target.value }))}
                    className={`w-full text-xs p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                {/* Event Start Time */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">시작 시간</label>
                  <input
                    id="form-event-time"
                    type="time"
                    required
                    value={newForm.event_start_time}
                    onChange={(e) => setNewForm(prev => ({ ...prev, event_start_time: e.target.value }))}
                    className={`w-full text-xs p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">행사 개최 주소</label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 cursor-pointer">
                    <input
                      id="form-venue-online-checkbox"
                      type="checkbox"
                      checked={newForm.venue_online}
                      onChange={(e) => setNewForm(prev => ({ ...prev, venue_online: e.target.checked, venue_address: e.target.checked ? '원격 화상 회의실 (Zoom / Meet 링크 발송)' : '서울시 강남구 테헤란로 123 스타트업 타워 4층' }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                    />
                    <span>온라인 비대면 개최</span>
                  </label>
                </div>
                <input
                  id="form-venue-address"
                  type="text"
                  required
                  disabled={newForm.venue_online}
                  placeholder="오프라인 행사장 장소 또는 주소"
                  value={newForm.venue_address}
                  onChange={(e) => setNewForm(prev => ({ ...prev, venue_address: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  } ${newForm.venue_online ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Footer pricing estimate summary */}
              <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs space-y-1.5 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">기본 요금제:</span>
                  <span>₩{newForm.package_type === 'BASIC_500' ? '5,000,000' : newForm.package_type === 'STANDARD_800' ? '8,000,000' : '12,000,000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">선택 추가 옵션:</span>
                  <span>{newForm.has_custom_option ? '협의 후 결정 (상세 기입됨)' : '₩0 (기본 포함)'}</span>
                </div>
                <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-emerald-400">
                  <span>총 예상 견적 합계:</span>
                  <span>₩{newForm.package_type === 'BASIC_500' ? '5,000,000' : newForm.package_type === 'STANDARD_800' ? '8,000,000' : '12,000,000'}{newForm.has_custom_option ? ' + @' : ''}</span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  id="cancel-create-event-btn"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-1/2 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  작성 취소
                </button>
                <button
                  id="submit-create-event-btn"
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="w-1/2 p-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>견적 저장중...</span>
                    </>
                  ) : (
                    <span>예약 및 견적 접수</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT/MANAGE EVENT MODAL FOR ADMINS */}
      {isEditOpen && selectedEventForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} overflow-hidden animate-in zoom-in-95 duration-200`}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/40 dark:bg-slate-950/40">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">행사 정보 관리 및 통제</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">행사명, 일시, 상태 및 견적을 조율하거나 취소/파기할 수 있습니다.</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">행사명</label>
                <input
                  type="text"
                  required
                  value={editForm.event_title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, event_title: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Client Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">발주처 기관명</label>
                <input
                  type="text"
                  required
                  value={editForm.client_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, client_name: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Event Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">개최 일자</label>
                  <input
                    type="date"
                    required
                    value={editForm.event_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, event_date: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                {/* Event Time */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">시작 시간</label>
                  <input
                    type="time"
                    required
                    value={editForm.event_start_time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, event_start_time: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">진행 단계 상태</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as Event['status'] }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="PENDING">대기중 (PENDING)</option>
                    <option value="CONFIRMED">예약확정 (CONFIRMED)</option>
                    <option value="IN_PROGRESS">행사진행 (IN_PROGRESS)</option>
                    <option value="COMPLETED">정산완료 (COMPLETED)</option>
                    <option value="CANCELLED">취소됨 (CANCELLED)</option>
                  </select>
                </div>

                {/* Assigned Manager */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">배정 책임 관리자 <span className="text-rose-500">*</span></label>
                  <select
                    value={editForm.assigned_staff_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, assigned_staff_name: e.target.value }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="">배정 미선택</option>
                    {users
                      .filter((u: any) => u.user_type === UserType.SUPER_ADMIN || u.user_type === UserType.ADMIN)
                      .map((u: any) => (
                        <option key={u.user_id} value={u.name}>
                          👤 {u.name} ({u.user_type === UserType.SUPER_ADMIN ? '최고 관리자' : '일반 관리자'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Package Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">요금 패키지</label>
                  <select
                    value={editForm.package_type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, package_type: e.target.value as Event['package_type'] }))}
                    className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="BASIC_500">BASIC (₩5,000,000)</option>
                    <option value="STANDARD_800">STANDARD (₩8,000,000)</option>
                    <option value="PREMIUM_1200">PREMIUM (₩12,000,000)</option>
                  </select>
                </div>

                {/* Combined final price display */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">산정된 최종 견적 가격</label>
                  <div className={`p-2.5 rounded-xl border font-mono font-bold text-xs ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'
                  }`}>
                    ₩{((editForm.package_type === 'BASIC_500' ? 5000000 : editForm.package_type === 'STANDARD_800' ? 8000000 : 12000000) + (editForm.has_custom_option ? Number(editForm.custom_option_price) || 0 : 0)).toLocaleString()}원
                  </div>
                </div>
              </div>

              {/* Startup Representative Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">발표기업 대표 매칭 (Startup Representative)</label>
                <div className={`p-3 rounded-xl border max-h-[120px] overflow-y-auto space-y-2 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {users.filter((u: any) => u.user_type === UserType.STARTUP).length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">등록된 발표기업 대표 회원이 없습니다.</p>
                  ) : (
                    users
                      .filter((u: any) => u.user_type === UserType.STARTUP)
                      .map((user: any) => {
                        const isChecked = editForm.startup_rep_ids?.includes(user.user_id);
                        return (
                          <label key={user.user_id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const currentIds = editForm.startup_rep_ids || [];
                                const nextIds = isChecked
                                  ? currentIds.filter(id => id !== user.user_id)
                                  : [...currentIds, user.user_id];
                                setEditForm(prev => ({ ...prev, startup_rep_ids: nextIds }));
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">🚀 {user.name} ({user.company_name || '회사명 미지정'})</span>
                            <span className="text-[10px] text-slate-400">({user.email})</span>
                          </label>
                        );
                      })
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">체크된 발표기업 대표는 로그인 시 이 행사의 피드백 보고서 조회 및 승인 화면과 자동으로 연결됩니다.</p>
              </div>

              {/* Online/Offline Checkbox */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">개최 장소</label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.venue_online}
                      onChange={(e) => setEditForm(prev => ({ ...prev, venue_online: e.target.checked, venue_address: e.target.checked ? '원격 화상 회의실 (Zoom / Meet 링크 발송)' : '서울시 강남구 테헤란로 123 스타트업 타워 4층' }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                    />
                    <span>온라인 비대면 개최</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  disabled={editForm.venue_online}
                  placeholder="오프라인 행사장 장소 또는 주소"
                  value={editForm.venue_address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, venue_address: e.target.value }))}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  } ${editForm.venue_online ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Custom Options Admin pricing & text */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editForm.has_custom_option}
                    onChange={(e) => setEditForm(prev => ({ ...prev, has_custom_option: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>➕ 선택 추가 옵션 활성화 및 가격 산정</span>
                </label>
                {editForm.has_custom_option && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">선택 옵션 요구사항</label>
                      <textarea
                        value={editForm.custom_option_text}
                        onChange={(e) => setEditForm(prev => ({ ...prev, custom_option_text: e.target.value }))}
                        placeholder="예: 전문 영한 동시 통역사 1명 배정 필요, 실시간 유튜브 중계 장비 대여 및 송출 감독 동반 희망"
                        rows={2}
                        className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">선택 옵션 가격 산정 (원)</label>
                      <input
                        type="number"
                        value={editForm.custom_option_price}
                        onChange={(e) => setEditForm(prev => ({ ...prev, custom_option_price: Number(e.target.value) || 0 }))}
                        placeholder="예: 500000"
                        className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                      <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-medium">
                        * 산정 금액: ₩{(editForm.custom_option_price || 0).toLocaleString()}원 (기본 요금제 외에 합산되는 최종 금액입니다.)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="w-1/3 p-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer text-center"
                >
                  행사 영구삭제
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="w-1/3 p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-1/3 p-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  <span>수정 저장</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
