import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { prompt, caseType } = await req.json();

    if (!prompt) return NextResponse.json({ error: "질문 내용이 없습니다." }, { status: 400 });

    // 1. 환경변수 확실하게 가져오기 (디버깅용 로그 추가)
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.ASSISTANT_ID;

    console.log("--- 환경 변수 체크 ---");
    console.log("API Key 존재 여부:", !!apiKey); // true가 나와야 함
    console.log("Assistant ID 값:", assistantId); // 실제 ID가 찍혀야 함

    if (!apiKey || !assistantId) {
      return NextResponse.json({ 
        error: "서버 설정 오류: API Key 또는 Assistant ID가 없습니다." 
      }, { status: 500 });
    }

    // 2. OpenAI 클라이언트 생성 (함수 내부에서 생성)
    const openai = new OpenAI({ apiKey: apiKey });

    console.log("1. 스레드 생성 중...");
    const thread = await openai.beta.threads.create();

    console.log("2. 메시지 추가 중...");
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `
      [사건 유형]: ${caseType}
      [사실관계]: ${prompt}

      위 사실관계를 바탕으로 지식 파일을 검색하여 분석하시오.
      반드시 아래 항목을 가진 **JSON 형식**으로만 답변하시오.

      {
        "prayer": "청구취지 내용...",
        "cause": "청구원인 내용 (육하원칙 및 법률적 주장)...",
        "law": "관련 법규...",
        "case": "유사 판례...",
        "strategy": "대응 전략..."
      }
      `
    });

    console.log("3. AI 비서 실행 및 대기 중... (ID 사용)");
    
    // ⭐ 수정된 부분: 위에서 검증한 변수(assistantId)를 직접 사용
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId, 
    });

    console.log("4. 실행 완료. 상태:", run.status);

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      
      const lastMessage = messages.data.filter(m => m.role === 'assistant')[0];
      let responseText = "";

      if (lastMessage && lastMessage.content[0].type === 'text') {
        responseText = lastMessage.content[0].text.value;
      }

      // 청소 작업
      responseText = responseText.replace(/【.*?】/g, '').replace(/```json/g, "").replace(/```/g, "").trim();

      try {
        const result = JSON.parse(responseText);
        return NextResponse.json({ result });
      } catch (e) {
        console.error("JSON 파싱 실패, 원본 반환");
        return NextResponse.json({ 
          result: {
            prayer: "자동 변환 실패 (내용 참조)",
            cause: responseText, 
            law: "-", case: "-", strategy: "-"
          } 
        });
      }
    } else {
      console.error("AI 실행 실패:", run.last_error);
      return NextResponse.json({ error: `AI 처리 실패: ${run.status}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("서버 에러 발생:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
