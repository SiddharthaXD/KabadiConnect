const fs = require('fs');
let content = fs.readFileSync('src/components/HomeDashboard.tsx', 'utf8');

const oldStr = `          <button
            onClick={() => {
               triggerHaptic(10);
               setTranscript('');
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#ba1a1a] active:scale-95 shadow-sm transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>
        </div>`;

const newStr = `          <button
            onClick={() => {
              triggerHaptic(10);
              if (transcript.trim()) {
                window.open(\`https://www.google.com/search?q=\${encodeURIComponent(transcript)}\`, '_blank');
              }
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#006948] active:scale-95 shadow-sm transition-transform hover:bg-[#006948]/10"
            title={language === 'en' ? 'Search Web' : language === 'mr' ? 'वेब शोधा' : 'वेब खोजें'}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button
            onClick={() => {
               triggerHaptic(10);
               setTranscript('');
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#ba1a1a] active:scale-95 shadow-sm transition-transform hover:bg-[#ba1a1a]/10"
            title={language === 'en' ? 'Clear Text' : language === 'mr' ? 'मजकूर पुसा' : 'टेक्स्ट साफ़ करें'}
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>
        </div>`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/components/HomeDashboard.tsx', content);
