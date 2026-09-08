const fs = require('fs');

let content = fs.readFileSync('src/components/HomeDashboard.tsx', 'utf8');

// Replace state
content = content.replace(
  "const [ttsText, setTtsText] = useState<string>('');",
  `const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = React.useState<boolean>(false);
  const recognitionRef = React.useRef<any>(null);

  const handleToggleListen = () => {
    triggerHaptic(20);
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'en' ? 'Speech recognition is not supported in your browser.' : 'आपके ब्राउज़र में वॉयस टाइपिंग समर्थित नहीं है।');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };`
);

// Replace section
const oldSectionRegex = /\{\/\* 6\. Text to Speech Utility \*\/\}.*?(?=\{\/\* 7\. Offline Sync Status Bar \*\/})/s;

const newSection = `{/* 6. Speech to Text Utility */}
      <section className="w-full bg-[#dae2fd] rounded-xl p-4 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#003b8e]">
              mic
            </span>
            <span className="text-[16px] font-black text-[#191c1e]">
              {language === 'en' ? 'Speech to Text' : language === 'mr' ? 'स्पीच टू टेक्स्ट (आवाज टाईपिंग)' : 'स्पीच टू टेक्स्ट (आवाज़ टाइपिंग)'}
            </span>
          </div>
          {isListening && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold uppercase animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
              {language === 'en' ? 'Listening' : language === 'mr' ? 'ऐकत आहे' : 'सुन रहा है'}
            </span>
          )}
        </div>
        
        <p className="text-[12px] text-[#003b8e] font-medium leading-tight">
          {language === 'en' ? 'Tap the microphone and speak. The app will type your words automatically.' : language === 'mr' ? 'मायक्रोफोन दाबा आणि बोला. ॲप तुमचे शब्द आपोआप टाईप करेल.' : 'माइक्रोफोन दबाएं और बोलें। ऐप आपके शब्दों को अपने आप टाइप करेगा।'}
        </p>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={language === 'en' ? 'Your speech will appear here...' : language === 'mr' ? 'तुमचे बोलणे येथे दिसेल...' : 'आपकी आवाज़ यहाँ टाइप होगी...'}
          className="w-full bg-white border border-[#003b8e]/30 rounded-lg p-3 text-[14px] font-medium text-[#191c1e] outline-none focus:border-[#003b8e] min-h-[80px] resize-none"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleListen}
            className={\`flex-1 h-11 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-all \${isListening ? 'bg-[#ba1a1a]' : 'bg-[#003b8e]'}\`}
          >
            <span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span>
            <span>{isListening ? (language === 'en' ? 'Stop Listening' : language === 'mr' ? 'थांबवा' : 'रोकें') : (language === 'en' ? 'Start Listening' : language === 'mr' ? 'बोलायला सुरू करा' : 'बोलना शुरू करें')}</span>
          </button>
          <button
            onClick={() => {
               triggerHaptic(10);
               setTranscript('');
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#ba1a1a] active:scale-95 shadow-sm transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>
        </div>
      </section>

      `;

content = content.replace(oldSectionRegex, newSection);

fs.writeFileSync('src/components/HomeDashboard.tsx', content);
