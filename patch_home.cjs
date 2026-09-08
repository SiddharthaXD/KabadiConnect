const fs = require('fs');

let content = fs.readFileSync('src/components/HomeDashboard.tsx', 'utf8');

// Add state
content = content.replace(
  "const [selectedScrapId, setSelectedScrapId] = useState<string>(SCRAP_ITEMS[0].id);",
  "const [selectedScrapId, setSelectedScrapId] = useState<string>(SCRAP_ITEMS[0].id);\n  const [ttsText, setTtsText] = useState<string>('');"
);

const newSection = `
      {/* 6. Text to Speech Utility */}
      <section className="w-full bg-[#dae2fd] rounded-xl p-4 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#003b8e]">
              record_voice_over
            </span>
            <span className="text-[16px] font-black text-[#191c1e]">
              {language === 'en' ? 'Text to Speech' : language === 'mr' ? 'टेक्स्ट टू स्पीच (ऑडिओ सुविधा)' : 'टेक्स्ट टू स्पीच (ऑडियो सुविधा)'}
            </span>
          </div>
        </div>
        
        <p className="text-[12px] text-[#003b8e] font-medium leading-tight">
          {language === 'en' ? 'Type anything below and the app will read it out loud in your selected language.' : language === 'mr' ? 'खाली काहीही टाईप करा आणि ॲप ते निवडलेल्या भाषेत वाचून दाखवेल.' : 'नीचे कुछ भी टाइप करें और ऐप उसे आपकी चुनी हुई भाषा में पढ़कर सुनाएगा।'}
        </p>

        <textarea
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
          placeholder={language === 'en' ? 'Type message here...' : language === 'mr' ? 'येथे संदेश टाइप करा...' : 'यहाँ संदेश टाइप करें...'}
          className="w-full bg-white border border-[#003b8e]/30 rounded-lg p-3 text-[14px] font-medium text-[#191c1e] outline-none focus:border-[#003b8e] min-h-[80px] resize-none"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic(20);
              if(ttsText.trim()) speakVernacular(ttsText, language, true);
            }}
            className="flex-1 h-11 bg-[#003b8e] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">volume_up</span>
            <span>{language === 'en' ? 'Speak Now' : language === 'mr' ? 'आता बोला' : 'अभी बोलें'}</span>
          </button>
          <button
            onClick={() => {
               triggerHaptic(10);
               setTtsText('');
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#ba1a1a] active:scale-95 shadow-sm transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>
        </div>
      </section>

      {/* 7. Offline Sync Status Bar */}`;

content = content.replace("{/* 6. Offline Sync Status Bar */}", newSection);

fs.writeFileSync('src/components/HomeDashboard.tsx', content);
