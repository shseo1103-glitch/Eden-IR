import React, { useState } from 'react';
import { 
  useUsers, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation 
} from '../../services/queries/useStats';
import { UserType } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  ShieldCheck, 
  UserX, 
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  Briefcase
} from 'lucide-react';

export default function MembersPage() {
  const { data: users = [], isLoading } = useUsers();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState<UserType>(UserType.CLIENT);
  const [status, setStatus] = useState<'ACTIVE' | 'PENDING' | 'BLOCKED'>('ACTIVE');

  // Filter & Search Logic
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.user_type === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompanyName('');
    setUserType(UserType.CLIENT);
    setStatus('ACTIVE');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setCompanyName(user.company_name || '');
    setUserType(user.user_type);
    setStatus(user.status || 'ACTIVE');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editingUser) {
      updateUserMutation.mutate({
        user_id: editingUser.user_id,
        name,
        email,
        phone,
        user_type: userType,
        company_name: userType === UserType.STARTUP ? companyName : undefined,
        status
      }, {
        onSuccess: () => setIsFormOpen(false)
      });
    } else {
      createUserMutation.mutate({
        name,
        email,
        phone,
        user_type: userType,
        company_name: userType === UserType.STARTUP ? companyName : undefined,
        status,
        region_code: userType === UserType.CLIENT ? 'SEOUL' : undefined
      }, {
        onSuccess: () => setIsFormOpen(false)
      });
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    if (window.confirm(`[경고] '${userName}' 회원의 계정을 플랫폼에서 영구 삭제하시겠습니까? 관련 데이터가 모두 파기됩니다.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>최고 관리자 전용 보안 관제</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">회원 계정 및 권한 관리</h1>
          <p className="text-xs text-slate-500 mt-1">이든 IR 플랫폼에 가입된 6가지 사용자 유형의 계정 활성화, 정보 수정 및 권한 통제를 수행합니다.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>신규 회원 수동 등록</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid md:grid-cols-12 gap-3.5 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="회원 이름 또는 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-medium focus:outline-none"
          >
            <option value="all">모든 역할 필터</option>
            <option value={UserType.SUPER_ADMIN}>🛠️ 최고 관리자 (SUPER_ADMIN)</option>
            <option value={UserType.ADMIN}>🧑‍💻 일반 관리자 (ADMIN)</option>
            <option value={UserType.CLIENT}>🏛️ 발주처 담당자 (CLIENT)</option>
            <option value={UserType.STARTUP}>🚀 발표기업 대표 (STARTUP)</option>
            <option value={UserType.JUDGE}>⚖️ 전문 심사위원 (JUDGE)</option>
            <option value={UserType.PARTNER}>🎙️ 협력 파트너사 (PARTNER)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-medium focus:outline-none"
          >
            <option value="all">모든 상태 필터</option>
            <option value="ACTIVE">정상 (ACTIVE)</option>
            <option value="PENDING">대기 (PENDING)</option>
            <option value="BLOCKED">차단 (BLOCKED)</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center justify-end text-[11px] font-bold text-slate-500 font-mono">
          검색결과: {filteredUsers.length}명
        </div>
      </div>

      {/* Main Members Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">회원 목록을 로드하는 중입니다...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400">
            <UserX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            검색 결과와 일치하는 회원이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">성명 / 이메일</th>
                  <th className="py-4 px-6">접속 계정 권한</th>
                  <th className="py-4 px-6">연락처 번호</th>
                  <th className="py-4 px-6">가입 일자</th>
                  <th className="py-4 px-6 text-center">계정 상태</th>
                  <th className="py-4 px-6 text-right">관리 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user: any) => (
                  <tr key={user.user_id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Name & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 border border-indigo-100/50 uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-950">{user.name}</span>
                            {user.company_name && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                                {user.company_name}
                              </span>
                            )}
                          </div>
                          <span className="block text-[11px] text-slate-400 mt-0.5">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Tag */}
                    <td className="py-4 px-6 font-medium">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        user.user_type === UserType.SUPER_ADMIN ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        user.user_type === UserType.ADMIN ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        user.user_type === UserType.CLIENT ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        user.user_type === UserType.STARTUP ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        user.user_type === UserType.JUDGE ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-slate-50 text-slate-700 border border-slate-100'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 font-mono text-slate-500">
                      {user.phone || '010-0000-0000'}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-6 text-slate-400">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${
                        user.status === 'ACTIVE' ? 'bg-emerald-500' :
                        user.status === 'PENDING' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'
                      }`} />
                      <span className="font-bold font-mono text-[10px]">
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>

                    {/* Controls */}
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer inline-flex items-center"
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id, user.name)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer inline-flex items-center"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {editingUser ? '회원 정보 수정 관제' : '신규 회원 수동 발급'}
                </h3>
                <p className="text-[10px] text-slate-500">회원의 기본 접속 정보 및 계정 활성화 상태를 제어합니다.</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">회원명 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">이메일 주소 <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="example@edenbiotech.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">연락처</label>
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">권한 역할 <span className="text-rose-500">*</span></label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none font-medium"
                  >
                    <option value={UserType.SUPER_ADMIN}>🛠️ SUPER_ADMIN</option>
                    <option value={UserType.ADMIN}>🧑‍💻 ADMIN</option>
                    <option value={UserType.CLIENT}>🏛️ CLIENT</option>
                    <option value={UserType.STARTUP}>🚀 STARTUP</option>
                    <option value={UserType.JUDGE}>⚖️ JUDGE</option>
                    <option value={UserType.PARTNER}>🎙️ PARTNER</option>
                  </select>
                </div>
              </div>

              {userType === UserType.STARTUP && (
                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                  <label className="text-[10px] uppercase font-bold text-slate-400">회사명 (스타트업) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="예: 에덴바이오텍"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">계정 상태 제어</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={status === 'ACTIVE'}
                      onChange={() => setStatus('ACTIVE')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>ACTIVE (정상 승인)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="PENDING"
                      checked={status === 'PENDING'}
                      onChange={() => setStatus('PENDING')}
                      className="text-amber-500 focus:ring-indigo-500"
                    />
                    <span>PENDING (대기중)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="BLOCKED"
                      checked={status === 'BLOCKED'}
                      onChange={() => setStatus('BLOCKED')}
                      className="text-rose-600 focus:ring-indigo-500"
                    />
                    <span>BLOCKED (이용 차단)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-100 text-slate-500 cursor-pointer transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-all flex items-center gap-1.5 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingUser ? '정보 업데이트' : '회원 생성 완료'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
