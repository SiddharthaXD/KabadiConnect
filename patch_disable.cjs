const fs = require('fs');
let content = fs.readFileSync('src/components/HomeDashboard.tsx', 'utf8');

const oldStr = `          <button
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
          </button>`;

const newStr = `          <button
            disabled
            onClick={() => {
              // Disabled for now
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#006948] shadow-sm transition-transform opacity-50 cursor-not-allowed"
            title={language === 'en' ? 'Search Web (Coming Soon)' : language === 'mr' ? 'वेब शोधा (लवकरच येत आहे)' : 'वेब खोजें (जल्द आ रहा है)'}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/components/HomeDashboard.tsx', content);
