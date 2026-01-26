const fs = require("fs");

// 1. 유진님이 만든 그 120MB 파일 이름
const filename = "law_data_v3.txt"; 

console.log(`📂 [${filename}] 파일을 스캔해서 보유한 법령을 확인합니다...`);

try {
    const content = fs.readFileSync(filename, "utf-8");
    
    // 2. "법령명:" 으로 시작하는 줄만 찾아서 뽑아냄
    const lines = content.split("\n");
    const lawSet = new Set(); // 중복 제거용 주머니

    lines.forEach(line => {
        if (line.startsWith("법령명:")) {
            const lawName = line.replace("법령명:", "").trim();
            lawSet.add(lawName);
        }
    });

    // 3. 결과 출력
    console.log("\n========================================");
    console.log(`✅ 현재 보유 중인 법령 목록 (총 ${lawSet.size}개)`);
    console.log("========================================");
    
    const sortedLaws = Array.from(lawSet).sort(); // 가나다순 정렬
    sortedLaws.forEach((law, index) => {
        console.log(`${index + 1}. ${law}`);
    });

    console.log("========================================");
    console.log("👉 위 리스트에 없는 법만 다운로드(PDF) 받으시면 됩니다!");

} catch (e) {
    console.error("❌ 파일을 찾을 수 없습니다! 파일명이 정확한지 확인해주세요.");
}