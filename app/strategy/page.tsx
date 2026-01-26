'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLawStore } from '../../store/useLawStore'; // 👈 [변경] 스토어 임포트

// 데이터 타입 정의 (기존 유지)
interface LawItem { name: string; summary: string; original: string; }
interface StrategyResult { analysis: string; options: string[]; risk: string; laws: LawItem[]; recommendation: string; }

// 메시지 타입 (스토어 데이터와 호환되도록 조정)
type Message = 
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: StrategyResult | string }; // string 타입 호환성 추가

export default function StrategyPage() {
  // ⭐ [핵심] Zustand 스토어 사용 (로컬 useState 대체)
  const { 
    strategyMessages, 
    addMessage, 
    strategyThreadId, 
    setThreadId, 
    resetStrategy 
  } = useLawStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false); // Hydration 체크용
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ⭐ [핵심] 페이지 로드 시 스토어 데이터 동기화
  useEffect(() => {
    useLawStore.persist.rehydrate();
    setHasMounted(true);
  }, []);

  // 메시지가 추가되거나 로딩 상태일 때 스크롤 하단 이동
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [strategyMessages, loading, hasMounted]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    
    // ⭐ 스토어 액션 사용 (자동 저장됨)
    addMessage({ role: 'user', content: userMsg });
    setLoading(true);

    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, threadId: strategyThreadId }), // 스토어의 threadId 사용
      });
      const data = await res.json();
      
      if (data.result) {
        // ⭐ 스토어 액션 사용 (자동 저장됨)
        addMessage({ role: 'assistant', content: data.result });
        
        if (data.threadId) {
          setThreadId(data.threadId);
        }
      }
    } catch (e) {
      alert("오류 발생: 서버 응답을 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 대화 초기화
  const handleReset = () => {
      if(confirm("대화 내용을 모두 지우고 새로 시작하시겠습니까?")) {
          resetStrategy(); // 스토어 초기화 함수 호출
          // localStorage 삭제는 Zustand가 알아서 처리함
      }
  }

  // ⭐ Hydration 이슈 방지
  if (!hasMounted) return <div className="h-screen bg-[#0f1117]" />;

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-300 font-sans overflow-hidden relative">
      
      {/* 사이드바 시작 */}
      <aside className="w-20 bg-[#161b22] border-r border-gray-800 flex flex-col items-center py-8 gap-6 flex-shrink-0">
        
        {/* 1. 홈 로고 -> 찐 메인(/)으로 이동 */}
        <Link 
          href="/" 
          className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xl mb-4 hover:bg-purple-600 hover:text-white transition-colors"
        >
          L
        </Link>

        {/* 2. 서류작성 -> /document 로 이동 */}
        <Link href="/document" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-800 text-gray-500 group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-all">
            📝
          </div>
          <span className="text-[10px] text-gray-500 group-hover:text-blue-400">서류작성</span>
        </Link>

        {/* 3. 전략수립 (현재 페이지 Active 상태) */}
        <Link href="/strategy" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-purple-600 text-white shadow-lg shadow-purple-900/50">
            🧠
          </div>
          <span className="text-[10px] text-purple-400 font-bold">전략수립</span>
        </Link>

      </aside>
      {/* 사이드바 끝 */}

      {/* 메인 영역 (채팅 UI) */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[#0f1117]">
        {/* 헤더 */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0f1117]/80 backdrop-blur-md z-10">
          <h1 className="text-lg font-semibold text-white tracking-wide">
            전략 수립 <span className="text-xs text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded ml-2 border border-purple-500/20">CHAT</span>
          </h1>
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-gray-700 px-3 py-1.5 rounded-lg">
             🗑️ 새 대화 시작
          </button>
        </header>

        {/* 채팅 내용 영역 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-hide">
          {strategyMessages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                <span className="text-6xl mb-6">💬</span>
                <p className="text-lg">사건 내용을 말씀해주시면 해결 전략을 제시합니다.</p>
                <p className="text-sm mt-2">"세입자가 연락이 안 되는데 어떡하죠?" 처럼 물어보세요.</p>
             </div>
          ) : (
            strategyMessages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.role === 'user' ? (
                   <div className="bg-purple-600/20 border border-purple-500/30 text-white px-6 py-4 rounded-2xl rounded-tr-none max-w-2xl text-lg shadow-lg">
                     {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                   </div>
                 ) : (
                   <div className="w-full max-w-4xl space-y-6">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">AI</div>
                        <span className="text-gray-400 text-sm">법무사 AI의 분석</span>
                     </div>
                     {/* content가 문자열일 경우(에러 메시지 등)와 객체일 경우 분기 처리 */}
                     {typeof msg.content === 'string' ? (
                        <div className="bg-[#21262d] p-4 rounded-xl text-gray-300">{msg.content}</div>
                     ) : (
                        <StrategyResultView result={msg.content as StrategyResult} />
                     )}
                   </div>
                 )}
               </div>
             ))
          )}
          
          {loading && (
             <div className="flex justify-start w-full max-w-4xl">
                <div className="flex items-center gap-3 bg-[#161b22] px-6 py-4 rounded-2xl rounded-tl-none border border-gray-800">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    <span className="text-sm text-gray-500 ml-2">전략을 수립하고 있습니다...</span>
                </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 입력창 영역 */}
        <div className="border-t border-gray-800 bg-[#161b22] p-6">
           <div className="max-w-4xl mx-auto relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="궁금한 점을 입력하세요... (Enter로 전송)"
                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl pl-6 pr-16 py-4 text-base focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none h-[60px] max-h-[150px]"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-3 top-3 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                🚀
              </button>
           </div>
           <p className="text-center text-xs text-gray-600 mt-2">AI도 실수할 수 있으니 법령 원문을 꼭 확인하세요.</p>
        </div>

      </main>
    </div>
  );
}

function StrategyResultView({ result }: { result: StrategyResult }) {
    if (!result) return null;
    
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
             <div className="bg-[#0d1117] border-l-4 border-purple-500 rounded-r-xl p-6 shadow-lg">
                <h3 className="font-bold text-purple-400 mb-2">🧐 핵심 쟁점</h3>
                <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">{result.analysis}</div>
             </div>
             <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-3">🛤️ 대응 시나리오</h3>
                <ul className="space-y-2">
                    {result.options?.map((opt, i) => (
                        <li key={i} className="bg-[#161b22] p-3 rounded border border-gray-700 text-sm text-gray-300">{opt}</li>
                    ))}
                </ul>
             </div>
             <div className="flex flex-col gap-3">
                 {result.laws?.map((law, i) => (
                     <div key={i} className="bg-[#0d1117] border border-gray-800 rounded-xl p-4">
                        <div className="font-bold text-green-400 text-sm mb-1">{law.name}</div>
                        <div className="text-gray-300 mb-2">{law.summary}</div>
                        <details className="text-xs text-gray-500 cursor-pointer">
                            <summary>📜 원문 보기</summary>
                            <p className="mt-2 p-2 bg-gray-900 rounded font-serif text-gray-400 whitespace-pre-wrap">{law.original}</p>
                        </details>
                     </div>
                 ))}
             </div>
             <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-6">
                <h3 className="font-bold text-blue-400 mb-2">🌟 최종 조언</h3>
                <div className="text-gray-300 font-bold whitespace-pre-wrap">{result.recommendation}</div>
             </div>
        </div>
    );
}