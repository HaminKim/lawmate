'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 데이터 타입 정의
interface LawItem {
  name: string;     // 법령명 (예: 민법 제3조)
  summary: string;  // 쉬운 요약
  original: string; // 법조문 원본
}

interface GuideResult {
  strategy: string; // 해결 전략
  laws: LawItem[];  // 관련 법령 리스트
}

export default function GuidePage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<GuideResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // 로딩 멘트
  useEffect(() => {
    if (!loading) return;
    const texts = [
      "🔍 의뢰인의 상황을 분석하고 있습니다...",
      "📚 관련 법령 원문을 대조하는 중입니다...",
      "💡 법조항을 알기 쉽게 번역하고 있습니다...",
      "📝 최적의 해결 로드맵을 작성 중입니다..."
    ];
    let index = 0;
    setLoadingText(texts[0]);
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      if (data.result) setResult(data.result);
    } catch (e) {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-300 font-sans overflow-hidden relative">
      
      {/* 사이드바 */}
      <aside className="w-20 bg-[#161b22] border-r border-gray-800 flex flex-col items-center py-8 gap-6 flex-shrink-0">
        <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xl mb-4">L</div>
        
        {/* 메뉴 1: 서류 작성 */}
        <Link href="/" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-800 text-gray-500 group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-all">📝</div>
          <span className="text-[10px] text-gray-500">서류작성</span>
        </Link>

        {/* 메뉴 2: 전략 수립 */}
        <Link href="/strategy" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-800 text-gray-500 group-hover:bg-purple-600/20 group-hover:text-purple-500 transition-all">🧠</div>
          <span className="text-[10px] text-gray-500">전략수립</span>
        </Link>

        {/* 메뉴 3: 법령 가이드 (현재) - 활성화 */}
        <Link href="/guide" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-green-600 text-white shadow-lg shadow-green-900/50">🧭</div>
          <span className="text-[10px] text-green-400 font-bold">법령가이드</span>
        </Link>
      </aside>

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0f1117]/80 backdrop-blur-md z-10">
          <h1 className="text-lg font-semibold text-white tracking-wide">
            이 사건은 이렇게! <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded ml-2 border border-green-500/20">GUIDE</span>
          </h1>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          
          {/* [왼쪽] 입력창 */}
          <div className="border-r border-gray-800 bg-[#0f1117] overflow-y-auto">
            <div className="p-8 flex flex-col gap-6 min-h-full">
              <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl text-sm text-green-200 mb-2">
                📢 <strong>사용법:</strong> "아는 동생이 돈 빌려가서 잠수탔는데 법적으로 뭘 근거로 털어야 해?" 처럼 편하게 물어보세요.
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full min-h-[400px] bg-[#161b22] border border-gray-800 rounded-xl p-6 text-base leading-relaxed text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/50 resize-y placeholder-gray-600"
                placeholder="궁금한 사건 내용이나 법률 문제를 입력하세요..."
              />
              
              <button
                onClick={handleGenerate}
                disabled={loading || !input}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg mb-8
                  ${loading 
                    ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/30'
                  }`}
              >
                {loading ? loadingText : '🔍 맞춤형 법령 & 해결책 찾기'}
              </button>
            </div>
          </div>

          {/* [오른쪽] 결과창 */}
          <div className="bg-[#1c2128] overflow-y-auto h-full relative p-8">
            {result ? (
              <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-10">
                
                {/* 1. 해결 가이드 (전략) */}
                <div className="bg-[#0d1117] border-l-4 border-green-500 rounded-r-xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    🚀 이 사건 해결 솔루션
                  </h2>
                  <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-lg">
                    {result.strategy}
                  </div>
                </div>

                {/* 2. 관련 법령 카드 리스트 */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    ⚖️ 근거 법령 (요약 & 원본)
                  </h2>
                  
                  {result.laws.map((law, idx) => (
                    <LawCard key={idx} law={law} />
                  ))}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                <span className="text-6xl mb-6">📖</span>
                <p className="text-lg">사건을 입력하면 관련 법령과 해결책을 짚어드립니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ⭐ [별도 컴포넌트] 법령 카드 (요약/원본 토글 기능)
function LawCard({ law }: { law: LawItem }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden shadow-md transition-all hover:border-gray-600">
      {/* 헤더: 법령명 */}
      <div className="bg-[#161b22] px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-bold text-green-400 text-lg">{law.name}</h3>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            showOriginal 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-transparent text-gray-400 border-gray-700 hover:text-white'
          }`}
        >
          {showOriginal ? '요약본 보기' : '📜 원본 법령 보기'}
        </button>
      </div>

      {/* 내용 영역 */}
      <div className="p-6">
        {showOriginal ? (
          // 원본 보기 모드
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-500 mb-2 font-bold">[법령 원본]</p>
            <p className="text-gray-300 whitespace-pre-wrap font-serif leading-relaxed text-sm">
              {law.original}
            </p>
          </div>
        ) : (
          // 요약 보기 모드 (기본)
          <div>
            <p className="text-xs text-green-500 mb-2 font-bold">[쉬운 요약]</p>
            <p className="text-white text-lg font-medium leading-relaxed">
              {law.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}