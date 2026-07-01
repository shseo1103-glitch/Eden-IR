import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserType } from '../../types';
import { useCreateUserMutation, useCreateJudgeMutation } from '../../services/queries/useStats';
import { Sparkles, Shield, UserCheck, Mail, Lock, User, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { useUiStore } from '../../store/useUiStore';

export default function AuthPage() {
  const { login } = useAuthStore();
  const createUserMutation = useCreateUserMutation();
  const createJudgeMutation = useCreateJudgeMutation();
  const addLog = useUiStore((state) => state.addLog);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState<UserType>(UserType.SUPER_ADMIN);

  // Signup form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserType>(UserType.CLIENT);
  const [orgName, setOrgName] = useState(''); // for CLIENT / STARTUP / PARTNER
  const [expertise, setExpertise] = useState('AI'); // for JUDGE
  const [activeRegion, setActiveRegion] = useState('서울/수도권'); // for JUDGE

  // Preset accounts for fast login
  const presets = [
    { name: '최고 관리자', email: 'superadmin@irplus.co.kr', role: UserType.SUPER_ADMIN, desc: '플랫폼 총괄 권한', emoji: '🛠️' },
    { name: '관리자', email: 'admin@irplus.co.kr', role: UserType.ADMIN, desc: '종합 관제 권한', emoji: '🧑‍💻' },
    { name: '발주처 담당자', email: 'client@agency.go.kr', role: UserType.CLIENT, desc: '경기창조경제혁신센터', emoji: '🏛️' },
    { name: '발표기업 대표', email: 'startup@edenbiotech.io', role: UserType.STARTUP, desc: '에덴바이오텍 피칭 사', emoji: '🚀' },
    { name: '전문 심사위원', email: 'judge1@abc.com', role: UserType.JUDGE, desc: 'ABC 벤처스 파트너', emoji: '⚖️' },
    { name: '협력 파트너사', email: 'partner@soundtech.co.kr', role: UserType.PARTNER, desc: '음향 장비 기술 파트너', emoji: '🎙️' },
  ];

  const handleFastLogin = (p: typeof presets[0]) => {
    setLoading(true);
    setTimeout(() => {
      login(p.email, p.role);
      setLoading(false);
    }, 400);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      login(loginEmail, loginRole);
      setLoading(false);
    }, 500);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('이름과 이메일은 필수 입력 사항입니다.');
      return;
    }

    setLoading(true);
    setError('');

    // Generate unique profiles depending on user role
    let client_id = undefined;
    let startup_id = undefined;
    let judge_id = undefined;

    const formattedOrg = orgName || '미지정 기관';

    if (role === UserType.CLIENT) {
      client_id = `client-new-${Date.now()}`;
    } else if (role === UserType.STARTUP) {
      startup_id = `startup-new-${Date.now()}`;
    } else if (role === UserType.JUDGE) {
      judge_id = `judge-new-${Date.now()}`;
    }

    // Call user mutation
    createUserMutation.mutate({
      email,
      user_type: role,
      name,
      phone: phone || '010-0000-0000',
      status: 'ACTIVE',
      client_id,
      startup_id,
      judge_id
    }, {
      onSuccess: (createdUser) => {
        // If registering as JUDGE, also add to JudgeProfile database in memory
        if (role === UserType.JUDGE) {
          createJudgeMutation.mutate({
            name,
            email,
            title: '전문 심사역',
            company: orgName || '프리랜서 투자사',
            career_years: 5,
            expertise_fields: [expertise],
            education_level: '석사',
            bio: `${name} 전문 심사위원의 프로필이 회원가입을 통해 자동 등록되었습니다.`,
            bank_name: '신한은행',
            account_number: '110-123-456789',
            active_region: activeRegion
          });
        }

        addLog(
          'SUCCESS',
          'SECURITY',
          `신규 회원 등록 성공: [${name}]`,
          `가입 역할: ${role}, 이메일 주소: ${email}`
        );

        // Auto-login
        setTimeout(() => {
          login(email, role);
          setLoading(false);
        }, 500);
      },
      onError: (err: any) => {
        setError(err.message || '회원가입 실패');
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-5xl grid md:grid-cols-12 bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10 backdrop-blur-md">
        
        {/* Left Grid: Fast Demo Presets */}
        <div className="md:col-span-5 p-8 border-r border-slate-800/80 bg-slate-950/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Eden-IR IR+</span>
            </div>

            <h2 className="text-xl font-extrabold tracking-tight">데모 계정 빠른 로그인</h2>
            <p className="text-xs text-slate-400 mt-1.5 mb-6 leading-relaxed">
              6가지 전체 핵심 역할별로 즉시 시뮬레이션 환경에 로그인하여 역할 기반 기능(RBAC)을 테스트할 수 있습니다.
            </p>

            <div className="space-y-2.5">
              {presets.map((p) => (
                <button
                  key={p.email}
                  onClick={() => handleFastLogin(p)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl border border-slate-800/80 hover:border-indigo-500/50 bg-slate-900/60 hover:bg-indigo-950/20 transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{p.emoji}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">{p.desc}</p>
                    </div>
                  </div>
                  <div className="text-[9px] bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white px-2 py-1 rounded font-bold font-mono transition-colors uppercase">
                    PASS
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>이든 IR 통합 관리 플랫폼 - 6가지 역할 기반 보안 아키텍처 작동중</span>
          </div>
        </div>

        {/* Right Grid: Login & Register Forms */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-slate-900/20">
          
          {/* Header Tab Toggles */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 mb-8 w-fit">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              사용자 로그인
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isLogin ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              신규 회원가입
            </button>
          </div>

          {error && (
            <div className="p-3.5 mb-6 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black">역할 로그인</h3>
                <p className="text-xs text-slate-400">등록한 정보 및 원하는 접속 권한을 선택하여 로그인하십시오.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">이메일 주소</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="example@irplus.co.kr"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs pl-11 p-3 rounded-xl border border-slate-800/80 bg-slate-950/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">접속 역할 권한 선택</label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as UserType)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-800/80 bg-slate-950/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value={UserType.SUPER_ADMIN}>🛠️ 최고 관리자 (SUPER_ADMIN)</option>
                  <option value={UserType.ADMIN}>🧑‍💻 일반 관리자 (ADMIN)</option>
                  <option value={UserType.CLIENT}>🏛️ 발주처 담당자 (CLIENT)</option>
                  <option value={UserType.STARTUP}>🚀 발표기업 대표 (STARTUP)</option>
                  <option value={UserType.JUDGE}>⚖️ 전문 심사위원 (JUDGE)</option>
                  <option value={UserType.PARTNER}>🎙️ 협력 파트너사 (PARTNER)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>보안 토큰 인증 처리중...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>보안 세션 로그인 완료</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER/SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-1.5">
                <h3 className="text-lg font-black">역할별 통합 회원가입</h3>
                <p className="text-xs text-slate-400">원하시는 역할을 선택하시면, 관련 프로필 및 정산 데이터 구조가 자동 매칭 생성됩니다.</p>
              </div>

              {/* Grid 1: Name & Email */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">사용자 성명 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs pl-9 p-3 rounded-xl border border-slate-800/80 bg-slate-950/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">이메일 주소 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-9 p-3 rounded-xl border border-slate-800/80 bg-slate-950/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Phone & Role Selection */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">연락처 번호</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="010-1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-9 p-3 rounded-xl border border-slate-800/80 bg-slate-950/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">가입 역할 유형 <span className="text-rose-500">*</span></label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserType)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-800/80 bg-slate-950/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value={UserType.SUPER_ADMIN}>🛠️ 최고 관리자 (SUPER_ADMIN)</option>
                    <option value={UserType.ADMIN}>🧑‍💻 일반 관리자 (ADMIN)</option>
                    <option value={UserType.CLIENT}>🏛️ 발주처 담당자 (CLIENT)</option>
                    <option value={UserType.STARTUP}>🚀 발표기업 대표 (STARTUP)</option>
                    <option value={UserType.JUDGE}>⚖️ 전문 심사위원 (JUDGE)</option>
                    <option value={UserType.PARTNER}>🎙️ 협력 파트너사 (PARTNER)</option>
                  </select>
                </div>
              </div>

              {/* Extra context fields based on selected role */}
              {role !== UserType.SUPER_ADMIN && role !== UserType.ADMIN && (
                <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">역할 맞춤 추가 프로필 정보</h4>
                    <p className="text-[10px] text-slate-500 leading-normal">가입 시 해당 데이터베이스 구조에 자동으로 바인딩 및 생성됩니다.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">
                      {role === UserType.CLIENT && '소속 기관/공공기관 명'}
                      {role === UserType.STARTUP && '발표 기업명'}
                      {role === UserType.JUDGE && '소속 벤처캐피탈(VC)/엑셀러레이터'}
                      {role === UserType.PARTNER && '협력 파트너사 명'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        role === UserType.CLIENT ? '예: 서울창조경제혁신센터' :
                        role === UserType.STARTUP ? '예: 주식회사 에덴컴퍼니' :
                        role === UserType.JUDGE ? '예: 이든인베스트먼트' : '예: 사운드솔루션 테크'
                      }
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {role === UserType.JUDGE && (
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400">기술 전문 분야</label>
                        <select
                          value={expertise}
                          onChange={(e) => setExpertise(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-100 focus:outline-none"
                        >
                          <option value="AI">AI / 머신러닝</option>
                          <option value="SaaS">SaaS / 클라우드</option>
                          <option value="Bio">바이오 / 헬스케어</option>
                          <option value="FinTech">핀테크 / 블록체인</option>
                          <option value="딥테크">딥테크 / 하드웨어</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400">활동 가능한 거점</label>
                        <input
                          type="text"
                          placeholder="예: 서울/수도권"
                          value={activeRegion}
                          onChange={(e) => setActiveRegion(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>회원 정보 암호화 및 생성중...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>동의하고 회원가입 및 자동 로그인</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
