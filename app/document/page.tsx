'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLawStore } from '../../store/useLawStore'; // 👈 [변경] Zustand 스토어 임포트

// 결과 데이터 타입 (스토어와 동일하게 유지)
interface LegalResult {
  prayer: string;
  cause: string;
  law: string;
  case: string;
  strategy: string;
}

export default function Home() {
  // ⭐ [핵심 변경] 로컬 useState 대신 전역 스토어 사용
  const { mainInput, setMainInput, mainResult, setMainResult } = useLawStore();
  
  // UI 관련 로컬 상태는 그대로 유지
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(''); 
  const [caseType, setCaseType] = useState('general'); // caseType은 현재 로컬 상태 (필요 시 스토어로 이동 가능)
  const [modalContent, setModalContent] = useState<{title: string, content: string} | null>(null);
  
  // ⭐ [핵심 추가] Hydration Error 방지용 플래그
  const [hasMounted, setHasMounted] = useState(false);

  const caseTypes = [
    { id: 'general', name: '📂 일반 민사', desc: '손해배상, 계약위반 등' },
    { id: 'money', name: '💰 대여금/추심', desc: '빌려준 돈, 미수금' },
    { id: 'estate', name: '🏠 부동산/명도', desc: '월세 미납, 보증금' },
    { id: 'fast', name: '⚡ 지급명령', desc: '간이 절차, 독촉' },
  ];

  // ⭐ [핵심] 컴포넌트 마운트 후 스토어 데이터 동기화
  useEffect(() => {
    useLawStore.persist.rehydrate();
    setHasMounted(true);
  }, []);

  // 로딩 멘트 타이머 (기존 로직 유지)
  useEffect(() => {
    if (!loading) return;
    const texts = [
      "🔍 9,000장의 판례 데이터를 스캔하고 있습니다...",
      "🔍 민법 1조부터 1118조 까지 훑어보는 중...",
      "⚖️ 관련 판례와 법령을 대조 분석 중입니다...",
      "🧠 최적의 청구취지와 전략을 수립 중입니다...",
      "📝 법률 서면 초안을 작성하고 있습니다...",
      "✨ 거의 다 되었습니다! 마무리 정리 중..."
    ];
    let index = 0;
    setLoadingText(texts[0]); 
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 2500); 
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!mainInput) return; // input -> mainInput
    setLoading(true);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: mainInput, caseType: caseType }), // input -> mainInput
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "서버 오류");
      
      if (data.result) {
        setMainResult(data.result); // setResult -> setMainResult (자동 저장됨)
      }
    } catch (e: any) {
      alert(`오류가 발생했습니다: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다! 📋');
  };

  // ⭐ Hydration 이슈 방지: 마운트 전에는 아무것도 렌더링하지 않거나 로딩화면 표시
  if (!hasMounted) return <div className="h-screen bg-[#0f1117]" />;

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-300 font-sans overflow-hidden relative">
      
      {/* ⭐ [CSS] 다크 모드 스크롤바 스타일 */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>

      {/* 사이드바 시작 */}
      <aside className="w-20 bg-[#161b22] border-r border-gray-800 flex flex-col items-center py-8 gap-6 flex-shrink-0">
        
        {/* 1. 홈 로고 -> 찐 메인(/)으로 이동 */}
        <Link 
          href="/" 
          className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xl mb-4 hover:bg-blue-600 hover:text-white transition-colors"
        >
          L
        </Link>
        
        {/* 2. 서류작성 (현재 페이지 Active 상태) */}
        <Link href="/document" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-blue-600 text-white shadow-lg shadow-blue-900/50">
            📝
          </div>
          <span className="text-[10px] text-blue-400 font-bold">서류작성</span>
        </Link>

        {/* 3. 전략수립 -> /strategy 로 이동 */}
        <Link href="/strategy" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-800 text-gray-500 group-hover:bg-purple-600/20 group-hover:text-purple-500 transition-all">
            🧠
          </div>
          <span className="text-[10px] text-gray-500 group-hover:text-purple-400">전략수립</span>
        </Link>

      </aside>
      {/* 사이드바 끝 */}

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0f1117]/80 backdrop-blur-md z-10 flex-shrink-0">
          <h1 className="text-lg font-semibold text-white tracking-wide">
            법무사 AI 어시스턴트 <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded ml-2 border border-blue-500/20">PRO</span>
          </h1>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          
          {/* [왼쪽] 입력창 */}
          <div className="border-r border-gray-800 bg-[#0f1117] overflow-y-auto h-full">
            <div className="p-8 flex flex-col gap-6 min-h-full">
              
              <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl text-sm text-blue-200 shadow-sm">
                  💡 <strong>작성 가이드:</strong> 사건 유형을 선택하고 내용을 입력하면, <strong>[청구취지]</strong>부터 <strong>[소장 초안]</strong>까지 완벽하게 작성해드립니다.
              </div>

              <div className="grid grid-cols-2 gap-3">
                {caseTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCaseType(type.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      caseType === type.id 
                        ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50' 
                        : 'bg-[#161b22] border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className={`font-bold text-sm mb-1 ${caseType === type.id ? 'text-blue-400' : 'text-gray-300'}`}>
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-500">{type.desc}</div>
                  </button>
                ))}

                <button 
                    onClick={() => setCaseType('unified')}
                    className={`col-span-2 p-3 rounded-xl border text-center transition-all group ${
                      caseType === 'unified' 
                        ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50' 
                        : 'bg-[#161b22] border-gray-800 hover:border-gray-600'
                    }`}
                >
                    <div className={`font-bold text-sm mb-1 group-hover:text-blue-400 ${caseType === 'unified' ? 'text-blue-400' : 'text-gray-300'}`}>
                        🔍 통합 사건 분석 (모든 유형)
                    </div>
                    <div className="text-xs text-gray-500">
                        복합적인 사건이나 유형을 잘 모를 때 선택하세요
                    </div>
                </button>
              </div>

              <textarea
                value={mainInput} // input -> mainInput
                onChange={(e) => setMainInput(e.target.value)} // setInput -> setMainInput
                className="w-full min-h-[400px] bg-[#161b22] border border-gray-800 rounded-xl p-6 text-base leading-relaxed text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-transparent resize-y placeholder-gray-600 font-mono shadow-inner"
                placeholder="// 사건 내용을 입력하세요...&#13;&#10;예) 2024.01.01 대여금 3천만원, 이자 1%, 안 갚음"
              />
              
              <button
                onClick={handleGenerate}
                disabled={loading || !mainInput} // input -> mainInput
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg mb-8 relative overflow-hidden
                  ${loading 
                    ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
                  }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center animate-pulse py-1">
                    <span className="text-sm font-normal text-blue-300 mb-1">AI가 작업 중입니다</span>
                    <span className="text-xs opacity-80">{loadingText}</span>
                  </div>
                ) : (
                  '5단계 분석 실행'
                )}
              </button>
            </div>
          </div>

          {/* [오른쪽] 결과창 */}
          <div className="bg-[#1c2128] overflow-y-auto h-full relative p-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-6">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <p className="text-lg animate-pulse font-medium text-blue-400 mb-2">{loadingText}</p>
                    <p className="text-sm text-gray-600">방대한 법률 데이터를 분석하느라 시간이 조금 걸립니다.</p>
                </div>
              </div>
            ) : mainResult ? ( // result -> mainResult
              <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-10">
                
                {/* 1. 청구취지 (Blue) */}
                <div className="bg-[#0d1117] border-l-4 border-blue-500 rounded-r-xl p-6 shadow-lg hover:bg-[#161b22] transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-blue-400">1. 청구취지</h2>
                    <button onClick={() => copyToClipboard(mainResult.prayer)} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-gray-300">복사</button>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-200 font-medium max-h-[200px] overflow-y-auto pr-2">{mainResult.prayer}</div>
                </div>

                {/* 2. 청구원인 (Indigo) */}
                <div className="bg-[#0d1117] border-l-4 border-indigo-500 rounded-r-xl p-6 shadow-lg hover:bg-[#161b22] transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-indigo-400">2. 청구원인</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setModalContent({title: '청구원인 전문', content: mainResult.cause})}
                            className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/50 px-2 py-1 rounded hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            🔍 크게 보기
                        </button>
                        <button onClick={() => copyToClipboard(mainResult.cause)} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-gray-300">복사</button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-300 leading-relaxed max-h-[400px] overflow-y-auto pr-2">{mainResult.cause}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 3. 관련 법규 */}
                  <div className="bg-[#0d1117] border-l-4 border-emerald-500 rounded-r-xl p-6 shadow-lg hover:bg-[#161b22] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-emerald-400">3. 관련 법규</h2>
                        <button onClick={() => copyToClipboard(mainResult.law)} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-gray-300">복사</button>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-400 text-sm max-h-[300px] overflow-y-auto pr-2">{mainResult.law}</div>
                  </div>

                  {/* 4. 유사 사례 */}
                  <div className="bg-[#0d1117] border-l-4 border-violet-500 rounded-r-xl p-6 shadow-lg hover:bg-[#161b22] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-violet-400">4. 유사 사례</h2>
                        <button onClick={() => copyToClipboard(mainResult.case)} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-gray-300">복사</button>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-400 text-sm max-h-[300px] overflow-y-auto pr-2">{mainResult.case}</div>
                  </div>
                </div>

                {/* 5. 대응 전략 */}
                <div className="bg-[#0d1117] border-l-4 border-rose-500 rounded-r-xl p-6 shadow-lg hover:bg-[#161b22] transition-colors">
                  <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-rose-400">5. 상대방 대응 전략 & 반박</h2>
                      <button onClick={() => copyToClipboard(mainResult.strategy)} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 text-gray-300">복사</button>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-300">{mainResult.strategy}</div>
                </div>

              </div>
            ) : (
              // 대기 화면
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                <span className="text-6xl mb-6">🏛️</span>
                <p className="text-lg">사건을 입력하면 5단계 분석 결과가 출력됩니다.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* 모달 창 */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-10">
          <div className="bg-[#1c2128] w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-gray-700 animation-fade-in">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#161b22] rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                📝 {modalContent.title}
              </h3>
              <button onClick={() => setModalContent(null)} className="text-gray-400 hover:text-white text-3xl font-light transition-colors">✕</button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 whitespace-pre-wrap text-gray-200 text-lg leading-relaxed font-serif bg-[#0d1117]">
              {modalContent.content}
            </div>
            <div className="p-5 border-t border-gray-700 flex justify-end bg-[#161b22] rounded-b-2xl gap-3">
              <button onClick={() => setModalContent(null)} className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all">닫기</button>
              <button onClick={() => copyToClipboard(modalContent.content)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2">📋 전체 복사하기</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}