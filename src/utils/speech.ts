import { Language } from '../types';

export function triggerHaptic(pattern: number | number[] = 30) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore haptic errors if not supported
    }
  }
}

/**
 * Play a clean, pleasant notification chime via Web Audio API
 * Provides instant auditory confirmation of audio activation
 */
export function playAudioChime(freq1: number = 523.25, freq2: number = 659.25) {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Second tone (higher chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq2, now + 0.08);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.26);
  } catch {
    // AudioContext blocked or not supported
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Intelligent voice selection tailored for Marathi, Hindi, and English
 */
function findBestVoice(lang: Language): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices =
    cachedVoices && cachedVoices.length > 0
      ? cachedVoices
      : window.speechSynthesis.getVoices();

  if (!voices || voices.length === 0) return null;

  if (lang === 'mr') {
    // 1st choice: Native Marathi voice
    const mrVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('mr') ||
        v.name.toLowerCase().includes('marathi') ||
        v.name.includes('मराठी')
    );
    if (mrVoice) return mrVoice;

    // 2nd choice: Indian Devanagari Hindi voice (pronounces Marathi Devanagari text accurately)
    const hiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.includes('हिन्दी')
    );
    if (hiVoice) return hiVoice;

    // 3rd choice: Any Indian English voice
    const inVoice = voices.find(
      (v) => v.lang.toLowerCase().includes('-in') || v.name.toLowerCase().includes('india')
    );
    if (inVoice) return inVoice;
  } else if (lang === 'hi') {
    // 1st choice: Hindi voice
    const hiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.includes('हिन्दी')
    );
    if (hiVoice) return hiVoice;

    // 2nd choice: Indian English voice
    const inVoice = voices.find(
      (v) => v.lang.toLowerCase().includes('-in') || v.name.toLowerCase().includes('india')
    );
    if (inVoice) return inVoice;
  } else {
    // 1st choice: Indian English or general English
    const enInVoice = voices.find((v) => v.lang.toLowerCase() === 'en-in');
    if (enInVoice) return enInVoice;

    const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (enVoice) return enVoice;
  }

  return voices[0] || null;
}

export function speakVernacular(
  text: string,
  lang: Language = 'hi',
  playChime: boolean = true
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this browser.');
    return;
  }

  try {
    if (playChime) {
      playAudioChime();
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Set appropriate locale code
    if (lang === 'mr') {
      utterance.lang = 'mr-IN';
      utterance.rate = 0.92; // Slightly measured rate for clear Devanagari enunciation
      utterance.pitch = 1.02;
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
    } else {
      utterance.lang = 'en-IN';
      utterance.rate = 0.98;
      utterance.pitch = 1.0;
    }

    const matchedVoice = findBestVoice(lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
    triggerHaptic(20);
  } catch (err) {
    console.error('Speech synthesis error:', err);
  }
}

/**
 * Standard pre-composed Marathi audio recordings / prompts
 */
export const MARATHI_AUDIO_CLIPS = {
  welcome:
    'नमस्कार! कबाडीवाला कनेक्ट मध्ये आपले स्वागत आहे. कबाडीवाला किंवा अधिकृत रिसायकलर निवडून सुरू करा.',
  instructions:
    'कृपया तुमची भूमिका निवडा: कबाडीवाला म्हणून लॉगिन करा किंवा CPCB अधिकृत रिसायकलर म्हणून लॉगिन करा.',
  kabadiwalaGuide:
    'कबाडीवाला मार्गदर्शक: कॅमेऱ्याने ई-कचरा स्कॅन करा, AI द्वारे प्रतवारी तपासा, डिजिटल वजन करा आणि थेट खात्यात पैसे मिळवा.',
  recyclerGuide:
    'अधिकृत रिसायकलर मार्गदर्शक: कबाडीवाल्यांचे डिजिटल क्यूआर टोकन स्कॅन करा, वजन प्रमाणित करा आणि शासकीय दराने खरेदी करा.',
  mandiRates:
    'आजचे थेट बाजार भाव: पीसीबी मदरबोर्ड २८० रुपये किलो, तांब्याची वायर ५४० रुपये किलो, लिथियम बॅटरी १२० रुपये किलो.',
  safetyWarning:
    'सावधान! हा धोकादायक ई-कचरा आहे. योग्य हातमोजे आणि सुरक्षिततेची खबरदारी घ्या.',
};

export function playMarathiAudio(
  clipKey: keyof typeof MARATHI_AUDIO_CLIPS,
  fallbackText?: string
) {
  const text = fallbackText || MARATHI_AUDIO_CLIPS[clipKey];
  speakVernacular(text, 'mr', true);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
