import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // ⭐ threadId를 받아서 대화를 이어갑니다.
    const { prompt, threadId } = await req.json();

    if (!prompt) return NextResponse.json({ error: "내용이 없습니다." }, { status: 400 });

    let thread;

    // 1. 기존 대화면 그 방(Thread)을 쓰고, 아니면 새로 만듦
    if (threadId) {
      console.log(`🔗 대화 이어가기 (Thread ID: ${threadId})`);
      thread = { id: threadId };
    } else {
      console.log("✨ 새 대화 시작");
      thread = await openai.beta.threads.create();
    }

    // 2. 메시지 전송
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `
      [사용자 질문]: ${prompt}

      당신은 30년 경력의 베테랑 법무사 사무장입니다. 
      질문에 대해 [해결 전략]과 [근거 법령]을 제시하세요.
      
      반드시 아래 **JSON 형식**으로만 답변하세요.
      (JSON 형식이 아닌 사담은 하지 마세요.)

      {
        "analysis": "핵심 쟁점 분석",
        "options": ["옵션 1: ...", "옵션 2: ..."],
        "risk": "리스크 및 주의사항",
        "laws": [
          { "name": "법령명", "summary": "쉬운 요약", "original": "원문" }
        ],
        "recommendation": "최종 조언"
      }
      `
    });

    // 3. 실행
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID!,
    });

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data.filter(m => m.role === 'assistant')[0];
      let responseText = "";

      if (lastMessage && lastMessage.content[0].type === 'text') {
        responseText = lastMessage.content[0].text.value;
      }

      responseText = responseText.replace(/【.*?】/g, '').replace(/```json/g, "").replace(/```/g, "").trim();

      try {
        const result = JSON.parse(responseText);
        // ⭐ 결과와 함께 threadId도 돌려줍니다 (다음에 또 쓰라고)
        return NextResponse.json({ result, threadId: thread.id });
      } catch (e) {
        // 파싱 실패 시에도 원문은 줍니다
        return NextResponse.json({ 
            result: { analysis: responseText, options: [], risk: "-", laws: [], recommendation: "-" },
            threadId: thread.id
        });
      }
    } else {
      return NextResponse.json({ error: "AI Error" }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}