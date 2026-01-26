const AdmZip = require("adm-zip");
const fs = require("fs");

// 우리가 아까 합친 파일 이름들
const files = [
    "판결문_요약.zip",
    "법령_질의응답.zip",
    "판결문_질의응답.zip"
];

console.log("🔥 강제 압축 해제 시작합니다...");

files.forEach((file) => {
    if (fs.existsSync(file)) {
        try {
            console.log(`📂 푸는 중: ${file}`);
            const zip = new AdmZip(file);
            // 파일명으로 된 폴더를 만들어서 거기에 풉니다.
            const outputFolder = file.replace(".zip", ""); 
            zip.extractAllTo(outputFolder, true);
            console.log(`✅ 성공! -> [${outputFolder}] 폴더 확인해보세요.`);
        } catch (e) {
            console.log(`❌ 실패 (${file}):`, e.message);
        }
    } else {
        console.log(`⚠️ 파일 없음: ${file} (아까 합치기 하셨나요?)`);
    }
});