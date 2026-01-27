import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, caseType } = await req.json();

    if (!prompt) return NextResponse.json({ error: "질문 내용이 없습니다." }, { status: 400 });

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

    console.log("3. AI 비서 실행 및 대기 중... (createAndPoll)");
    // ⭐ 여기가 핵심: 공식 함수가 알아서 완료될 때까지 기다려줍니다.
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: process.env.ASSISTANT_ID!,
      // response_format: { type: "json_object" } // 혹시 에러나면 이 줄은 주석 처리 유지
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
      // 실패 시 (run.last_error 등을 확인 가능)
      console.error("AI 실행 실패:", run.last_error);
      return NextResponse.json({ error: `AI 처리 실패: ${run.status}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("서버 에러 발생:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
