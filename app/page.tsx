'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [greeting, setGreeting] = useState({ title: '', message: '' });
  const [bibleVerse, setBibleVerse] = useState('');

  useEffect(() => {
    // 1. 시간 설정
    const now = new Date();
    setCurrentTime(now);

    // 2. 시간대별 맞춤 멘트 (아빠를 위한 따뜻한 잔소리 & 응원)
    const hour = now.getHours();
    
    const messages = {
      morning: [ // 05시 ~ 11시
        { title: "은혜로운 아침입니다! ☀️", msg: "오늘 만나는 모든 의뢰인에게 주님의 평안이 전해지길 기도합니다. 🙏" },
        { title: "좋은 아침이에요, 법무사님!", msg: "따뜻한 물 한 잔으로 몸을 깨우고 시작해볼까요? 오늘도 승리하세요! 💪" },
        { title: "오늘도 활기차게 시작해요!", msg: "하나님이 아빠의 지혜와 건강을 지켜주실 거예요. 든든하게 아침 챙겨 드세요!" },
        { title: "새 힘을 얻는 하루 되세요 ✨", msg: "독수리 날개 쳐 올라감 같은 새 힘 넘치는 하루 되시길 응원합니다!" }
      ],
      lunch: [ // 11시 ~ 14시
        { title: "즐거운 점심 시간입니다 🍚", msg: "식사는 맛있게 하셨나요? 잠시 바깥 공기 마시며 햇볕 좀 쬐고 오세요! 🌳" },
        { title: "잠깐! 식사는 꼭 챙기세요.", msg: "바쁘셔도 한국인은 밥심! 소화 잘 되는 걸로 든든히 드셔야 오후도 힘내죠." },
        { title: "나른할 땐 커피 한 잔? ☕", msg: "식사 후 가벼운 산책이 소화에도 좋고 기분 전환에도 최고랍니다." },
        { title: "평안한 휴식 시간 보내세요.", msg: "오전 업무 하느라 고생 많으셨어요. 점심시간만큼은 머리를 비우고 푹 쉬세요." }
      ],
      afternoon: [ // 14시 ~ 18시
        { title: "스트레칭 할 시간입니다! 🙆‍♂️", msg: "아빠, 지금 딱 어깨랑 목 한번 돌려주세요! 뭉친 근육을 풀어줘야 능률도 오릅니다." },
        { title: "잠시 눈을 감고 쉬어보세요 😌", msg: "모니터만 보느라 눈 아프시죠? 1분만 먼 산 바라보며 눈의 피로를 풀어주세요." },
        { title: "출출하실 시간이죠? 🍎", msg: "견과류나 과일 같은 건강 간식 드시면서 당 충전 하세요! 힘내세요 법무사님!" },
        { title: "허리 한번 쭈~욱 펴주세요!", msg: "건강이 최고의 자산입니다. 의자에서 일어나서 가볍게 몸 좀 풀어주세요~ ❤️" }
      ],
      evening: [ // 18시 이후
        { title: "오늘 하루도 수고 많으셨어요 🌙", msg: "세상의 짐은 내려놓고, 이제 평안한 쉼을 누릴 시간입니다. 얼른 들어가세요!" },
        { title: "법무사님, 칼퇴 권장 시간! 🏠", msg: "일보다 중요한 건 아빠의 건강과 행복입니다. 무리하지 말고 마무리하세요." },
        { title: "가족들이 기다리는 집으로 🥰", msg: "오늘 힘들었던 일들은 주님께 다 맡겨버리고, 가벼운 마음으로 퇴근하세요." },
        { title: "평안한 저녁 되세요 ✨", msg: "오늘 하루도 지켜주신 은혜에 감사하며, 꿀잠 주무시길 기도할게요." }
      ]
    };

    // 3. 힘이 되는 성경 말씀 40선 (랜덤)
    const bibleVerses = [
        "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 (이사야 41:10)",
        "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라 (빌립보서 4:13)",
        "여호와는 나의 목자시니 내게 부족함이 없으리로다 (시편 23:1)",
        "사람이 마음으로 자기의 길을 계획할지라도 그의 걸음을 인도하시는 이는 여호와시니라 (잠언 16:9)",
        "너의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라 (잠언 16:3)",
        "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라 (마태복음 11:28)",
        "강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 (여호수아 1:9)",
        "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 (잠언 3:5)",
        "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 (빌립보서 4:6)",
        "여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 (이사야 40:31)",
        "네 짐을 여호와께 맡기라 그가 너를 붙드시고 의인의 요동함을 영원히 허락하지 아니하시리로다 (시편 55:22)",
        "하나님이 우리에게 주신 것은 두려워하는 마음이 아니요 오직 능력과 사랑과 절제하는 마음이니 (디모데후서 1:7)",
        "주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시편 119:105)",
        "너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라 (베드로전서 5:7)",
        "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라 (로마서 8:28)",
        "나의 힘이신 여호와여 내가 주를 사랑하나이다 (시편 18:1)",
        "여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요 (시편 27:1)",
        "평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 (요한복음 14:27)",
        "사람이 감당할 시험 밖에는 너희가 당한 것이 없나니 오직 하나님은 미쁘사 너희가 감당하지 못할 시험 당함을 허락하지 아니하시고 (고린도전서 10:13)",
        "지혜 있는 자는 궁창의 빛과 같이 빛날 것이요 많은 사람을 옳은 데로 돌아오게 한 자는 별과 같이 영원토록 빛나리라 (다니엘 12:3)",
        "구하라 그리하면 너희에게 주실 것이요 찾으라 그리하면 찾아낼 것이요 문을 두드리라 그리하면 너희에게 열릴 것이니 (마태복음 7:7)",
        "내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올까 나의 도움은 천지를 지으신 여호와에게서로다 (시편 121:1-2)",
        "너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요 (마태복음 5:14)",
        "하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라 (시편 46:1)",
        "너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라 (잠언 3:6)",
        "의인의 간구는 역사하는 힘이 큼이니라 (야고보서 5:16)",
        "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 (데살로니가전서 5:16-18)",
        "무릇 하나님께로부터 난 자마다 세상을 이기느니라 세상을 이기는 승리는 이것이니 우리의 믿음이니라 (요한일서 5:4)",
        "여호와께서 사람의 걸음을 정하시고 그의 길을 기뻐하시나니 (시편 37:23)",
        "내 영혼아 네가 어찌하여 낙심하며 어찌하여 내 속에서 불안해 하는가 너는 하나님께 소망을 두라 (시편 42:5)",
        "여호와를 경외하는 것이 지혜의 근본이요 거룩하신 자를 아는 것이 명철이니라 (잠언 9:10)",
        "너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 (야고보서 1:5)",
        "마음의 즐거움은 양약이라도 심령의 근심은 뼈를 마르게 하느니라 (잠언 17:22)",
        "볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라 (마태복음 28:20)",
        "믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니 (히브리서 11:1)",
        "너희는 마음에 근심하지 말라 하나님을 믿으니 또 나를 믿으라 (요한복음 14:1)",
        "오직 정의를 물 같이, 공의를 마르지 않는 강 같이 흐르게 할지어다 (아모스 5:24)",
        "진리를 알지니 진리가 너희를 자유롭게 하리라 (요한복음 8:32)",
        "사랑하는 자여 네 영혼이 잘됨 같이 네가 범사에 잘되고 강건하기를 내가 간구하노라 (요한삼서 1:2)",
        "눈물을 흘리며 씨를 뿌리는 자는 기쁨으로 거두리로다 (시편 126:5)"
    ];

    let selectedList = messages.morning;
    if (hour >= 11 && hour < 14) selectedList = messages.lunch;
    else if (hour >= 14 && hour < 18) selectedList = messages.afternoon;
    else if (hour >= 18 || hour < 5) selectedList = messages.evening;

    const randomMsg = selectedList[Math.floor(Math.random() * selectedList.length)];
    const randomVerse = bibleVerses[Math.floor(Math.random() * bibleVerses.length)];

    setGreeting({ title: randomMsg.title, message: randomMsg.msg });
    setBibleVerse(randomVerse);

  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  if (!currentTime) return <div className="h-screen bg-[#0f1117]" />;

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-300 font-sans overflow-hidden relative">
      
      {/* 사이드바 */}
      <aside className="w-20 bg-[#161b22] border-r border-gray-800 flex flex-col items-center py-8 gap-6 flex-shrink-0">
        <Link href="/" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-blue-900/50 hover:scale-105 transition-transform">
            L
        </Link>
        <Link href="/document" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-800 text-gray-500 group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-all">📝</div>
          <span className="text-[10px] text-gray-500 group-hover:text-blue-400">서류작성</span>
        </Link>
        <Link href="/strategy" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-800 text-gray-500 group-hover:bg-purple-600/20 group-hover:text-purple-500 transition-all">🧠</div>
          <span className="text-[10px] text-gray-500 group-hover:text-purple-400">전략수립</span>
        </Link>
      </aside>

      {/* 메인 대시보드 영역 */}
      <main className="flex-1 flex flex-col h-full relative p-6 sm:p-10 overflow-y-auto">
        
        {/* 상단: 날짜 및 환영 메시지 */}
        <div className="max-w-6xl mx-auto w-full mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-6 mb-8 gap-4">
                <div>
                    <p className="text-blue-400 font-bold mb-2 tracking-wider uppercase text-xs sm:text-sm bg-blue-900/20 inline-block px-2 py-1 rounded">LawMate AI Assistant</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">{greeting.title}</h1>
                    <p className="text-lg sm:text-xl text-gray-400 font-light leading-relaxed whitespace-pre-line">
                        {greeting.message}
                    </p>
                </div>
                <div className="text-right hidden md:block min-w-[150px]">
                    <div className="text-4xl font-mono text-white font-bold tracking-tight">{formatTime(currentTime)}</div>
                    <div className="text-gray-500 text-md mt-1">{formatDate(currentTime)}</div>
                </div>
            </div>

            {/* 메인 선택 카드 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 h-auto md:h-[450px]">
                
                {/* 1. 서류 작성 카드 */}
                <Link href="/document" className="group relative bg-[#161b22] border border-gray-800 rounded-3xl p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[300px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-600/10"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            📝
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">법률 서류 작성</h2>
                        <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                            "사건 내용만 입력하면 초안이 뚝딱!"<br/>
                            <span className="text-gray-500 text-sm mt-3 block font-light">
                                청구취지 • 청구원인 • 관련 판례 분석<br/>
                                5단계로 완벽한 초안을 만들어드립니다.
                            </span>
                        </p>
                    </div>
                    
                    <div className="relative z-10 flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform mt-4">
                        서류 작성하러 가기 <span className="ml-2 text-xl">→</span>
                    </div>
                </Link>

                {/* 2. 전략 수립 카드 */}
                <Link href="/strategy" className="group relative bg-[#161b22] border border-gray-800 rounded-3xl p-8 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[300px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-600/10"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            🧠
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">사건 전략 수립</h2>
                        <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                            "복잡한 사건, AI와 상의하세요."<br/>
                            <span className="text-gray-500 text-sm mt-3 block font-light">
                                대화형 쟁점 분석 • 유리한 법리 탐색<br/>
                                대응 시나리오를 함께 설계해드립니다.
                            </span>
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center text-purple-400 font-bold group-hover:translate-x-2 transition-transform mt-4">
                        전략 세우러 가기 <span className="ml-2 text-xl">→</span>
                    </div>
                </Link>

            </div>
            
            {/* 하단 성경 말씀 (심플하고 깔끔하게) */}
            <div className="mt-8 text-center animate-pulse-slow">
                 <div className="bg-[#161b22] border border-gray-700/50 rounded-full px-6 py-4 inline-block shadow-lg hover:border-gray-500 transition-colors">
                    <p className="text-gray-300 text-base sm:text-lg font-medium">
                        📖 {bibleVerse}
                    </p>
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
}