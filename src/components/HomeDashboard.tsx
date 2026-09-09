import React, { useState } from 'react';
import { ScrapItem, ScreenName, Language } from '../types';
import { SCRAP_ITEMS } from '../data/scrapData';
import { TRANSLATIONS } from '../data/translations';
import { speakVernacular, stopSpeech, triggerHaptic } from '../utils/speech';
import { LanguageBar } from './LanguageBar';

interface HomeDashboardProps {
  onNavigate: (screen: ScreenName) => void;
  onSelectItemForWeighing: (item: ScrapItem, initialWeight?: number) => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onSync: () => void;
  isSyncing: boolean;
  totalEarned: number;
  totalWeight: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  onSelectItemForWeighing,
  language,
  onLanguageChange,
  onSync,
  isSyncing,
  totalEarned,
  totalWeight,
}) => {
  const [calcWeight, setCalcWeight] = useState<number>(15.0);
  const [purchasePrice, setPurchasePrice] = useState<number>(180);
  const [selectedScrapId, setSelectedScrapId] = useState<string>(SCRAP_ITEMS[0].id);
  const [transcript, setTranscript] = useState<string>('');
  const [speechMode, setSpeechMode] = useState<'stt' | 'tts'>('stt');
  const [sttEngine, setSttEngine] = useState<'gemini' | 'browser'>('gemini');
  const [sttLang, setSttLang] = useState<'mr-IN' | 'hi-IN' | 'en-IN' | 'auto'>('auto');
  const [isListening, setIsListening] = React.useState<boolean>(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = React.useRef<any>(null);
  const finalTranscriptRef = React.useRef<string>('');
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordingTimerRef = React.useRef<any>(null);

  // Timer counter for audio recording
  React.useEffect(() => {
    if (isRecordingAudio) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecordingAudio]);

  // High-precision Gemini AI Voice Recorder
  const handleToggleGeminiRecording = async () => {
    triggerHaptic(20);

    if (isRecordingAudio) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          language === 'en'
            ? 'Microphone access is not supported on this browser.'
            : 'आपके ब्राउज़र में माइक्रोफ़ोन सपोर्ट उपलब्ध नहीं है।'
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const finalMime = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });

        if (audioBlob.size === 0) return;

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const resultStr = reader.result as string;
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;

          if (!base64Data) return;

          setIsTranscribing(true);
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: finalMime,
                language,
              }),
            });
            const data = await res.json();
            if (data.transcript) {
              setTranscript((prev) => {
                const cleaned = data.transcript.trim();
                return prev ? `${prev} ${cleaned}` : cleaned;
              });
              speakVernacular(
                language === 'mr'
                  ? 'आवाज अचूकपणे मजकुरात बदलला आहे.'
                  : language === 'hi'
                  ? 'आवाज़ को सटीकता के साथ टाइप कर दिया गया है।'
                  : 'Voice transcribed with high precision.',
                language
              );
            }
          } catch (err) {
            console.error('Audio transcription error:', err);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start(250);
      setIsRecordingAudio(true);
    } catch (err: any) {
      console.error('Mic access error:', err);
      alert(
        language === 'en'
          ? 'Microphone permission denied or unavailable.'
          : 'माइक्रोफ़ोन अनुमति स्वीकृत नहीं हुई।'
      );
    }
  };

  // Browser Speech Recognition with non-duplicating finalTranscript logic
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
      alert(
        language === 'en'
          ? 'Live browser speech recognition is not supported on this browser. Use Gemini AI Voice Recorder instead!'
          : 'आपके ब्राउज़र में लाइव वॉयस टाइपिंग समर्थित नहीं है। कृपया Gemini AI आवाज़ रेकॉर्डर का उपयोग करें!'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    const activeLang =
      sttLang === 'auto'
        ? language === 'mr'
          ? 'mr-IN'
          : language === 'hi'
          ? 'hi-IN'
          : 'en-IN'
        : sttLang;

    recognition.lang = activeLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    finalTranscriptRef.current = transcript.trim();

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const textChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += ' ' + textChunk.trim();
        } else {
          interimTranscript += ' ' + textChunk;
        }
      }

      const combined = (finalTranscriptRef.current + ' ' + interimTranscript)
        .replace(/\s+/g, ' ')
        .trim();
      setTranscript(combined);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition status/error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // AI Accuracy Refiner to clean up typos and voice errors
  const handleEnhanceTranscript = async () => {
    if (!transcript || !transcript.trim()) return;
    triggerHaptic(20);
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, language }),
      });
      const data = await res.json();
      if (data.enhancedText) {
        setTranscript(data.enhancedText);
        speakVernacular(
          language === 'mr'
            ? 'मजकूर अचूकता सुधारली आहे.'
            : language === 'hi'
            ? 'टेक्स्ट की सटीकता सुधार दी गई है।'
            : 'Transcript accuracy enhanced by AI.',
          language
        );
      }
    } catch (err) {
      console.error('Enhance transcript error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSpeakText = () => {
    triggerHaptic(20);
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = transcript.trim() || (
      language === 'mr'
        ? 'कबाडीवाला कनेक्ट मध्ये आपले स्वागत आहे. येथे थेट शासकीय दराने ई-कचरा खरेदी करा.'
        : language === 'hi'
        ? 'कबाड़ीवाला कनेक्ट में आपका स्वागत है। यहाँ सरकारी मंडी भाव से ई-कचरा बेचें।'
        : 'Welcome to Kabadiwala Connect. Discover real-time scrap rates and scan e-waste easily.'
    );

    if (!transcript.trim()) {
      setTranscript(textToSpeak);
    }

    setIsSpeaking(true);
    speakVernacular(textToSpeak, language, true, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSwitchSpeechMode = (mode: 'stt' | 'tts') => {
    triggerHaptic(15);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (isRecordingAudio && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    }
    setSpeechMode(mode);
  };
  const t = TRANSLATIONS[language];
  const kb = t.kabadiwala;
  
  const selectedScrapItem = SCRAP_ITEMS.find(item => item.id === selectedScrapId) || SCRAP_ITEMS[0];
  const ratePerKg = selectedScrapItem.baseRate;

  const estimatedCalcPrice = Math.round(calcWeight * ratePerKg);
  const estimatedProfit = Math.round(calcWeight * (ratePerKg - purchasePrice));

  const handleAdjustWeight = (delta: number) => {
    triggerHaptic(25);
    setCalcWeight((prev) => Math.max(1, parseFloat((prev + delta).toFixed(1))));
  };

  const handleAdjustPurchasePrice = (delta: number) => {
    triggerHaptic(25);
    setPurchasePrice((prev) => Math.max(0, prev + delta));
  };

  const handleSetPresetWeight = (val: number) => {
    triggerHaptic(35);
    setCalcWeight(val);
  };

  const handleVoiceBanner = () => {
    triggerHaptic(30);
    speakVernacular(kb.audioWelcomePrompt, language);
  };

  const handleHearAllRates = () => {
    triggerHaptic(30);
    speakVernacular(kb.audioRatesSpeech, language);
  };

  const getItemName = (item: ScrapItem) => {
    if (language === 'mr') return item.nameMr || item.nameHi;
    if (language === 'en') return item.nameEn;
    return item.nameHi;
  };

  const getItemCategory = (item: ScrapItem) => {
    if (language === 'mr') return item.categoryMr || item.categoryHi;
    if (language === 'en') return item.categoryEn;
    return item.categoryHi;
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-24 pb-28 gap-4">
      {/* Multilingual Selector Pill Bar */}
      {onLanguageChange && (
        <LanguageBar currentLanguage={language} onLanguageChange={onLanguageChange} />
      )}

      {/* 1. Vernacular Voice Assistance Bar */}
      <section
        id="voice-assist-banner"
        className="w-full bg-[#ffdcc3] rounded-xl p-3 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex items-center justify-between gap-2 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-full bg-[#8d4b00] text-white flex items-center justify-center animate-bounce shrink-0 shadow-sm">
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[16px] font-extrabold text-[#2f1500] leading-tight truncate">
              {kb.voiceBannerTitle}
            </span>
            <span className="text-[12px] text-[#6e3900] font-medium leading-none truncate">
              {kb.voiceBannerSubtitle}
            </span>
          </div>
        </div>

        <button
          id="btn-voice-prompt"
          type="button"
          onClick={handleVoiceBanner}
          className="h-11 px-4 rounded-xl bg-[#2f1500] text-[#ffdcc3] flex items-center gap-1.5 active:bg-[#8d4b00] active:scale-95 shadow-[0_2px_0px_#191c1e] transition-transform shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">mic</span>
          <span className="text-[14px] font-bold">{kb.speakBtn}</span>
        </button>
      </section>

      {/* 2. Massive Operational Hero CTA: Scan E-Waste Camera */}
      <section className="w-full">
        <button
          id="scan-trigger"
          type="button"
          onClick={() => {
            triggerHaptic([40, 60, 40]);
            speakVernacular(
              language === 'hi'
                ? 'कैमरा शुरू हो रहा है। ई-कचरे की फोटो खींचें।'
                : language === 'mr'
                ? 'कॅमेरा सुरू होत आहे. ई-कचऱ्याचा फोटो काढा.'
                : 'Starting camera. Snap a photo of the e-waste scrap.',
              language
            );
            onNavigate('scanner');
          }}
          className="w-full bg-[#00855d] text-white rounded-xl p-4 shadow-[0_6px_0px_#002114] border-2 border-[#002114] active:translate-y-1 active:shadow-[0_2px_0px_#002114] transition-all flex flex-col justify-between min-h-[148px] relative overflow-hidden group text-left"
        >
          {/* Subtle background decorative icon */}
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
            <span className="material-symbols-outlined text-[150px]">document_scanner</span>
          </div>

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-white text-[#006948] flex items-center justify-center shadow-[0_3px_0px_#000000] shrink-0 p-2">
                <span
                  className="material-symbols-outlined text-[34px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  photo_camera
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-black text-white tracking-tight leading-tight">
                  {kb.scanCtaTitle}
                </span>
                <span className="text-[12px] font-bold text-[#85f8c4] tracking-wider uppercase font-['Space_Grotesk']">
                  {kb.scanCtaSubtitle}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-[12px] font-bold flex items-center gap-1 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[15px]">bolt</span>
              {kb.scanCtaBadge}
            </span>
          </div>

          <div className="w-full bg-white/15 backdrop-blur-sm rounded-lg p-2.5 mt-3 flex items-center justify-between relative z-10 border border-white/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">
                center_focus_strong
              </span>
              <span className="text-[14px] text-white font-semibold">{kb.scanCtaAction}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </div>
          </div>
        </button>
      </section>

      {/* 3. Visual Earnings Summary Cards (Side by Side Grid) */}
      <section className="grid grid-cols-2 gap-3 w-full">
        {/* Card 1: Total Earned Money */}
        <div className="bg-white rounded-xl p-3.5 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col justify-between min-h-[148px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#85f8c4] text-[#002114] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                payments
              </span>
            </div>
            <button
              id="btn-speak-earnings"
              aria-label="Audio read total earned"
              onClick={() => {
                triggerHaptic(20);
                speakVernacular(
                  language === 'hi'
                    ? `आपकी कुल बिक्री की कमाई ₹${totalEarned.toLocaleString('en-IN')} है।`
                    : language === 'mr'
                    ? `तुमची एकूण विक्री कमाई ₹${totalEarned.toLocaleString('en-IN')} आहे.`
                    : `Your total verified earnings are ₹${totalEarned.toLocaleString('en-IN')}.`,
                  language
                );
              }}
              className="w-9 h-9 rounded-full bg-[#eceef0] flex items-center justify-center text-[#8d4b00] active:scale-90 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
          </div>

          <div className="flex flex-col mt-2">
            <div className="flex items-baseline">
              <span className="text-[26px] font-bold text-[#006948] font-['Space_Grotesk'] leading-none">
                ₹{totalEarned.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[15px] font-extrabold text-[#191c1e] mt-1 leading-tight">
              {kb.earningsTitle}
            </span>
            <span className="text-[11px] text-[#565e74] leading-none">{kb.earningsSubtitle}</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-[#006948] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            <span>+₹1,240</span>
          </div>
        </div>

        {/* Card 2: Waste Sold Weight */}
        <div className="bg-white rounded-xl p-3.5 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col justify-between min-h-[148px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#dae2fd] text-[#131b2e] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                scale
              </span>
            </div>
            <button
              id="btn-speak-weight"
              aria-label="Audio read total weight"
              onClick={() => {
                triggerHaptic(20);
                speakVernacular(
                  language === 'hi'
                    ? `आपने कुल ${totalWeight} किलोग्राम कबाड़ माल बेचा है।`
                    : language === 'mr'
                    ? `तुम्ही एकूण ${totalWeight} किलो ई-कचरा विकला आहे.`
                    : `You have weighed and sold ${totalWeight} kilograms of e-waste.`,
                  language
                );
              }}
              className="w-9 h-9 rounded-full bg-[#eceef0] flex items-center justify-center text-[#565e74] active:scale-90 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
          </div>

          <div className="flex flex-col mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-bold text-[#565e74] font-['Space_Grotesk'] leading-none">
                {totalWeight}
              </span>
              <span className="text-[15px] font-bold text-[#565e74]">KG</span>
            </div>
            <span className="text-[15px] font-extrabold text-[#191c1e] mt-1 leading-tight">
              {kb.weightTitle}
            </span>
            <span className="text-[11px] text-[#565e74] leading-none">{kb.weightSubtitle}</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-[#565e74] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[15px]">inventory_2</span>
            <span>
              {language === 'mr'
                ? '२४ पोती'
                : language === 'en'
                ? '24 verified bags'
                : '24 बोरियां (Sacks)'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Quick Rate Ticker (Live Scrap Rates / मंडी के भाव) */}
      <section className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#006948] animate-ping" />
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-[#191c1e]">{kb.mandiRatesTitle}</span>
              <span className="text-[11px] text-[#565e74]">{kb.mandiRatesSubtitle}</span>
            </div>
          </div>

          <button
            id="btn-speak-all-rates"
            onClick={handleHearAllRates}
            className="h-8 px-2.5 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px] text-[#8d4b00]">volume_up</span>
            <span>{language === 'mr' ? 'भाव ऐका' : language === 'en' ? 'Listen' : 'भाव सुनें'}</span>
          </button>
        </div>

        {/* Rates Stacking List */}
        <div className="flex flex-col gap-2.5 w-full">
          {SCRAP_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                triggerHaptic(25);
                onSelectItemForWeighing(item, calcWeight);
              }}
              className="w-full bg-white rounded-xl p-3 shadow-[0_3px_0px_#191c1e] border-2 border-[#191c1e] flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer hover:border-[#006948]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-[#e6e8ea] flex items-center justify-center overflow-hidden relative shrink-0 border border-[#bccac0]/40">
                  <img
                    src={item.imageUrl}
                    alt={getItemName(item)}
                    className="w-full h-full object-cover"
                  />
                  {item.isHazardous && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba1a1a] flex items-center justify-center text-white text-[10px]">
                      !
                    </span>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-bold text-[#191c1e] truncate">
                      {getItemName(item)}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${
                        item.isHazardous ? 'bg-[#b15f00]' : 'bg-[#006948]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-[#565e74] truncate">
                    {getItemCategory(item)}
                  </span>
                  <span className="text-[10px] text-[#006948] font-bold">{kb.tapToWeigh}</span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-2">
                <div
                  className={`flex items-baseline gap-0.5 px-2 py-0.5 rounded-lg ${
                    item.isHazardous
                      ? 'bg-[#ffdcc3] text-[#2f1500]'
                      : 'bg-[#85f8c4]/40 text-[#002114]'
                  }`}
                >
                  <span
                    className={`text-[22px] font-bold font-['Space_Grotesk'] leading-tight ${
                      item.isHazardous ? 'text-[#8d4b00]' : 'text-[#006948]'
                    }`}
                  >
                    ₹{item.baseRate}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      item.isHazardous ? 'text-[#8d4b00]' : 'text-[#006948]'
                    }`}
                  >
                    /KG
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold mt-0.5 ${
                    item.rateTrend === 'up'
                      ? 'text-[#006948]'
                      : item.rateTrend === 'down'
                      ? 'text-[#ba1a1a]'
                      : 'text-[#565e74]'
                  }`}
                >
                  {item.rateChange}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Weighing Shortcut Card */}
      <section className="w-full bg-[#f2f4f6] rounded-xl p-4 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[24px] text-[#006948]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calculate
            </span>
            <span className="text-[16px] font-black text-[#191c1e]">{kb.calcTitle}</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e6e8ea] text-[#565e74]">
            {kb.ratePerKgLabel}: ₹{ratePerKg}
          </span>
        </div>

        <div className="flex flex-col gap-2 bg-white p-2.5 rounded-xl border border-[#bccac0]/40 shadow-inner">
          {/* Product Select */}
          <div className="flex flex-col mb-1">
            <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider mb-1">
              {kb.calcProductLabel}
            </span>
            <select
              value={selectedScrapId}
              onChange={(e) => setSelectedScrapId(e.target.value)}
              className="w-full bg-[#f2f4f6] border border-[#bccac0]/60 rounded-lg p-2 text-[14px] font-bold text-[#191c1e] outline-none focus:border-[#006948]"
            >
              {SCRAP_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {language === 'mr' ? (item.nameMr || item.nameHi) : language === 'en' ? item.nameEn : item.nameHi}
                </option>
              ))}
            </select>
          </div>
          
          <div className="h-[1px] w-full bg-[#e6e8ea] mb-2"></div>

          {/* Weight Stepper */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="btn-calc-minus"
              type="button"
              onClick={() => handleAdjustWeight(-5)}
              className="w-12 h-12 rounded-xl bg-[#e6e8ea] text-[#191c1e] font-bold text-[26px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#191c1e] border border-[#191c1e]"
            >
              −
            </button>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">{kb.weightLabel}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[30px] font-bold text-[#191c1e] font-['Space_Grotesk'] leading-none">
                  {calcWeight.toFixed(1)}
                </span>
                <span className="text-[15px] font-black text-[#006948]">KG</span>
              </div>
            </div>

            <button
              id="btn-calc-plus"
              type="button"
              onClick={() => handleAdjustWeight(5)}
              className="w-12 h-12 rounded-xl bg-[#006948] text-white font-bold text-[26px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#002114] border border-[#002114]"
            >
              +
            </button>
          </div>

          <div className="h-[1px] w-full bg-[#e6e8ea] my-1"></div>

          {/* Cost Stepper */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="btn-cost-minus"
              type="button"
              onClick={() => handleAdjustPurchasePrice(-10)}
              className="w-10 h-10 rounded-xl bg-[#e6e8ea] text-[#191c1e] font-bold text-[22px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#191c1e] border border-[#191c1e]"
            >
              −
            </button>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">{kb.calcCostLabel}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-black text-[#006948]">₹</span>
                <span className="text-[24px] font-bold text-[#191c1e] font-['Space_Grotesk'] leading-none">
                  {purchasePrice}
                </span>
              </div>
            </div>

            <button
              id="btn-cost-plus"
              type="button"
              onClick={() => handleAdjustPurchasePrice(10)}
              className="w-10 h-10 rounded-xl bg-[#dae2fd] text-[#131b2e] font-bold text-[22px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#131b2e] border border-[#131b2e]"
            >
              +
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#e6e8ea]">
            <div className="flex flex-col">
               <span className="text-[11px] font-bold text-[#565e74] uppercase">{kb.estPayoutLabel}</span>
               <span className="text-[15px] font-bold text-[#191c1e] font-['Space_Grotesk']">
                 ₹{estimatedCalcPrice.toLocaleString('en-IN')}
               </span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[11px] font-bold text-[#006948] uppercase">{kb.calcProfitLabel}</span>
               <span className="text-[18px] font-black text-[#006948] font-['Space_Grotesk']">
                 +₹{estimatedProfit.toLocaleString('en-IN')}
               </span>
            </div>
          </div>
        </div>

        {/* Quick Weight Preset Chips */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          {[5, 10, 25, 50].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSetPresetWeight(preset)}
              className={`h-10 rounded-lg text-[14px] font-bold flex items-center justify-center active:scale-95 shadow-[0_2px_0px_#191c1e] border border-[#191c1e] transition-all font-['Space_Grotesk'] ${
                calcWeight === preset
                  ? 'bg-[#85f8c4] text-[#002114]'
                  : 'bg-white text-[#191c1e] hover:bg-[#85f8c4]/30'
              }`}
            >
              +{preset} KG
            </button>
          ))}
        </div>

        {/* Action Button: Proceed to Weighed Deal */}
        <button
          onClick={() => {
            triggerHaptic(30);
            onSelectItemForWeighing(selectedScrapItem, calcWeight);
          }}
          className="w-full h-11 bg-[#006948] text-white rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 active:scale-98 shadow-sm"
        >
          <span>{kb.weighThisNowBtn}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      
      {/* 6. Speech & Voice Utility (STT / TTS Toggle) */}
      <section className="w-full bg-[#dae2fd] rounded-xl p-4 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col gap-3">
        {/* Mode Toggle Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#003b8e]">
                {speechMode === 'stt' ? 'mic' : 'volume_up'}
              </span>
              <span className="text-[16px] font-black text-[#191c1e]">
                {speechMode === 'stt'
                  ? language === 'en'
                    ? 'AI Speech to Text (Voice Typing)'
                    : language === 'mr'
                    ? 'स्मार्ट आवाज टाईपिंग (AI Transcriber)'
                    : 'स्मार्ट आवाज़ टाइपिंग (AI Transcriber)'
                  : language === 'en'
                  ? 'Text to Speech (TTS)'
                  : language === 'mr'
                  ? 'टेक्स्ट टू स्पीच (मजकूर ऐका)'
                  : 'टेक्स्ट टू स्पीच (बोलकर सुनें)'}
              </span>
            </div>

            {/* Live active badges */}
            {speechMode === 'stt' && isRecordingAudio && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ba1a1a] text-white text-[11px] font-bold uppercase animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>
                  {language === 'en' ? 'Recording' : language === 'mr' ? 'रेकॉर्डिंग...' : 'रेकॉर्डिंग...'}{' '}
                  00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                </span>
              </span>
            )}

            {speechMode === 'stt' && isTranscribing && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#006948] text-white text-[11px] font-bold shadow-sm">
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                <span>{language === 'en' ? 'AI Transcribing...' : language === 'mr' ? 'AI ट्रान्सक्राइब...' : 'AI टाइपिंग...'}</span>
              </span>
            )}

            {speechMode === 'stt' && isListening && !isRecordingAudio && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#003b8e]/10 text-[#003b8e] text-[10px] font-bold uppercase animate-pulse border border-[#003b8e]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#003b8e]"></span>
                {language === 'en' ? 'Listening...' : language === 'mr' ? 'ऐकत आहे...' : 'सुन रहा है...'}
              </span>
            )}

            {speechMode === 'tts' && isSpeaking && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#006948]/10 text-[#006948] text-[10px] font-bold uppercase animate-pulse border border-[#006948]/30">
                <span className="material-symbols-outlined text-[12px] animate-bounce">graphic_eq</span>
                {language === 'en' ? 'Speaking...' : language === 'mr' ? 'बोलत आहे...' : 'बोल रहा है...'}
              </span>
            )}
          </div>

          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/70 rounded-xl border border-[#003b8e]/20 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchSpeechMode('stt')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                speechMode === 'stt'
                  ? 'bg-[#003b8e] text-white shadow-sm'
                  : 'text-[#003b8e] hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>{language === 'en' ? 'Speech to Text' : language === 'mr' ? 'आवाजातून टाईप' : 'आवाज़ से लिखें'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchSpeechMode('tts')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                speechMode === 'tts'
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-[#006948] hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>{language === 'en' ? 'Text to Speech' : language === 'mr' ? 'मजकूर ऐका' : 'बोलकर सुनें'}</span>
            </button>
          </div>
        </div>

        {/* STT Engine & Language Sub-bar */}
        {speechMode === 'stt' && (
          <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-white/80 border border-[#003b8e]/20 text-[11px]">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[#003b8e]">
                {language === 'en' ? 'Voice Engine:' : language === 'mr' ? 'आवाज इंजिन:' : 'आवाज़ इंजन:'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSttEngine('gemini');
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all border ${
                    sttEngine === 'gemini'
                      ? 'bg-[#006948] text-white border-[#006948]'
                      : 'bg-white text-[#565e74] border-[#bccac0]'
                  }`}
                >
                  ⚡ Gemini AI Audio (100% Exact)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSttEngine('browser');
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all border ${
                    sttEngine === 'browser'
                      ? 'bg-[#003b8e] text-white border-[#003b8e]'
                      : 'bg-white text-[#565e74] border-[#bccac0]'
                  }`}
                >
                  🎙️ Live Browser Speech
                </button>
              </div>
            </div>

            {sttEngine === 'browser' && (
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#003b8e]/10">
                <span className="font-bold text-[#003b8e]">
                  {language === 'en' ? 'Dialect:' : language === 'mr' ? 'भाषा निवडा:' : 'भाषा चुनें:'}
                </span>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'hi-IN', label: 'हिंदी' },
                    { id: 'mr-IN', label: 'मराठी' },
                    { id: 'en-IN', label: 'English' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSttLang(item.id as any)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all border ${
                        sttLang === item.id
                          ? 'bg-[#003b8e] text-white border-[#003b8e]'
                          : 'bg-white text-[#191c1e] border-[#bccac0]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guidance Prompt */}
        <p className="text-[12px] text-[#003b8e] font-medium leading-tight">
          {speechMode === 'stt'
            ? sttEngine === 'gemini'
              ? language === 'en'
                ? 'Tap "Record Voice" and speak clearly. Gemini AI will transcribe your voice into exact text.'
                : language === 'mr'
                ? '"रेकॉर्ड करा" दाबा आणि स्पष्ट बोला. जेमिनी AI तुमचे बोलणे अचूक मजकुरात बदलेल.'
                : '"रेकॉर्ड करें" दबाएं और स्पष्ट बोलें। Gemini AI आपकी आवाज़ को सटीक टेक्स्ट में बदलेगा।'
              : language === 'en'
              ? 'Tap microphone to start continuous speech typing with real-time word assembly.'
              : language === 'mr'
              ? 'थेट मायक्रोफोन द्वारे सलग आवाज टाईपिंग सुरू करण्यासाठी दाबा.'
              : 'लाइव आवाज़ से टाइप करने के लिए माइक्रोफ़ोन बटन दबाएं।'
            : language === 'en'
            ? 'Type or paste text below and tap "Read Aloud" to hear clear vernacular voice playback.'
            : language === 'mr'
            ? 'खाली मजकूर लिहा किंवा पेस्ट करा आणि आवाज ऐकण्यासाठी "वाचून दाखवा" दाबा.'
            : 'नीचे टेक्स्ट लिखें या पेस्ट करें और आवाज़ में सुनने के लिए "बोलकर सुनाएं" दबाएं।'}
        </p>

        {/* Preset chips for TTS */}
        {speechMode === 'tts' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-[11px] font-bold text-[#003b8e] shrink-0">
              {language === 'en' ? 'Sample:' : language === 'mr' ? 'उदा:' : 'उदा:'}
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setTranscript(
                  language === 'mr'
                    ? 'आजचे थेट बाजार भाव: पीसीबी मदरबोर्ड २८० रुपये किलो, तांब्याची वायर ५४० रुपये किलो.'
                    : language === 'hi'
                    ? 'आज के लाइव मंडी भाव: पीसीबी मदरबोर्ड ₹280 प्रति किलो, तांबा वायर ₹540 प्रति किलो।'
                    : 'Live Scrap Rates: PCB Motherboard ₹280 per kg, Copper Wire ₹540 per kg.'
                );
              }}
              className="px-2.5 py-1 rounded-full bg-white text-[#003b8e] border border-[#003b8e]/30 shrink-0 hover:bg-[#003b8e]/10 active:scale-95 font-semibold"
            >
              {language === 'en' ? 'Mandi Rates' : language === 'mr' ? 'बाजार भाव' : 'मंडी भाव'}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setTranscript(
                  language === 'mr'
                    ? 'सावधान! ई-कचरा हाताळताना सुरक्षिततेचे हातमोजे वापरा.'
                    : language === 'hi'
                    ? 'सावधानी! ई-कचरा संभालते समय सुरक्षा दस्ताने पहनें।'
                    : 'Safety Notice: Always wear protective safety gloves when handling e-waste.'
                );
              }}
              className="px-2.5 py-1 rounded-full bg-white text-[#003b8e] border border-[#003b8e]/30 shrink-0 hover:bg-[#003b8e]/10 active:scale-95 font-semibold"
            >
              {language === 'en' ? 'Safety Notice' : language === 'mr' ? 'सुरक्षितता' : 'सुरक्षा निर्देश'}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setTranscript(
                  language === 'mr'
                    ? 'कबाडीवाला कनेक्ट मध्ये आपले स्वागत आहे. थेट शासकीय दराने ई-कचरा विक्री करा.'
                    : language === 'hi'
                    ? 'कबाड़ीवाला कनेक्ट में आपका स्वागत है। सीधे सरकारी दरों पर ई-कचरा बेचें।'
                    : 'Welcome to Kabadiwala Connect. Sell certified e-waste directly at verified rates.'
                );
              }}
              className="px-2.5 py-1 rounded-full bg-white text-[#003b8e] border border-[#003b8e]/30 shrink-0 hover:bg-[#003b8e]/10 active:scale-95 font-semibold"
            >
              {language === 'en' ? 'Welcome' : language === 'mr' ? 'स्वागत' : 'स्वागत'}
            </button>
          </div>
        )}

        <div className="relative w-full">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              speechMode === 'stt'
                ? isTranscribing
                  ? language === 'en'
                    ? 'Gemini AI is transcribing your recorded voice...'
                    : language === 'mr'
                    ? 'जेमिनी AI तुमचा आवाज अचूक मजकुरात बदलत आहे...'
                    : 'Gemini AI आपकी आवाज़ को सटीक टेक्स्ट में बदल रहा है...'
                  : language === 'en'
                  ? 'Your exact voice transcript will appear here...'
                  : language === 'mr'
                  ? 'तुमचे अचूक बोलणे येथे टाईप दिसेल...'
                  : 'आपकी आवाज़ का सटीक टेक्स्ट यहाँ टाइप होगा...'
                : language === 'en'
                ? 'Enter text to convert into speech...'
                : language === 'mr'
                ? 'आवाजात ऐकण्यासाठी मजकूर येथे टाईप करा...'
                : 'आवाज़ में सुनने के लिए टेक्स्ट यहाँ टाइप करें...'
            }
            className="w-full bg-white border border-[#003b8e]/30 rounded-lg p-3 text-[14px] font-medium text-[#191c1e] outline-none focus:border-[#003b8e] min-h-[95px] resize-none shadow-inner pr-10"
          />

          {/* AI Accuracy Enhancer Floating Tooltip */}
          {transcript.trim().length > 3 && (
            <button
              type="button"
              onClick={handleEnhanceTranscript}
              disabled={isEnhancing}
              title={
                language === 'en'
                  ? 'AI Fix & Enhance Transcript Accuracy'
                  : language === 'mr'
                  ? 'मजकूर अचूकता सुधारा'
                  : 'AI से सटीकता सुधारें'
              }
              className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-[#006948] text-white hover:bg-[#005137] active:scale-95 shadow-sm transition-all flex items-center justify-center cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isEnhancing ? 'animate-spin' : ''
                }`}
              >
                auto_fix_high
              </span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {speechMode === 'stt' ? (
            sttEngine === 'gemini' ? (
              <button
                type="button"
                onClick={handleToggleGeminiRecording}
                disabled={isTranscribing}
                className={`flex-1 h-11 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-all cursor-pointer ${
                  isRecordingAudio
                    ? 'bg-[#ba1a1a] animate-pulse'
                    : isTranscribing
                    ? 'bg-[#006948]/80'
                    : 'bg-[#006948]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isRecordingAudio ? 'stop' : isTranscribing ? 'sync' : 'mic'}
                </span>
                <span>
                  {isRecordingAudio
                    ? language === 'en'
                      ? 'Stop & Transcribe'
                      : language === 'mr'
                      ? 'रेकॉर्डिंग थांबवा'
                      : 'रेकॉर्डिंग रोकें'
                    : isTranscribing
                    ? language === 'en'
                      ? 'AI Transcribing...'
                      : language === 'mr'
                      ? 'AI काम करत आहे...'
                      : 'AI टाइपिंग...'
                    : language === 'en'
                    ? 'Record Voice (Gemini AI)'
                    : language === 'mr'
                    ? 'आवाज रेकॉर्ड करा (AI)'
                    : 'आवाज़ रेकॉर्ड करें (AI)'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleListen}
                className={`flex-1 h-11 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-all cursor-pointer ${
                  isListening ? 'bg-[#ba1a1a]' : 'bg-[#003b8e]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isListening ? 'mic_off' : 'mic'}
                </span>
                <span>
                  {isListening
                    ? language === 'en'
                      ? 'Stop Listening'
                      : language === 'mr'
                      ? 'थांबवा'
                      : 'रोकें'
                    : language === 'en'
                    ? 'Start Live Voice Typing'
                    : language === 'mr'
                    ? 'लाईव्ह टाईपिंग सुरू करा'
                    : 'लाइव टाइपिंग शुरू करें'}
                </span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleSpeakText}
              className={`flex-1 h-11 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-all cursor-pointer ${
                isSpeaking ? 'bg-[#ba1a1a]' : 'bg-[#006948]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isSpeaking ? 'stop_circle' : 'volume_up'}
              </span>
              <span>
                {isSpeaking
                  ? language === 'en'
                    ? 'Stop Speaking'
                    : language === 'mr'
                    ? 'आवाज थांबवा'
                    : 'आवाज़ रोकें'
                  : language === 'en'
                  ? 'Read Aloud (Play Audio)'
                  : language === 'mr'
                  ? 'वाचून दाखवा (मजकूर ऐका)'
                  : 'बोलकर सुनाएं (ऑडियो)'}
              </span>
            </button>
          )}

          {speechMode === 'stt' && (
            <button
              type="button"
              onClick={handleEnhanceTranscript}
              disabled={isEnhancing || !transcript.trim()}
              className="h-11 px-3 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#006948] active:scale-95 shadow-sm transition-transform hover:bg-[#006948]/10 cursor-pointer disabled:opacity-50"
              title={
                language === 'en'
                  ? 'AI Refine Accuracy'
                  : language === 'mr'
                  ? 'अचूकता सुधारा'
                  : 'सटीकता सुधारें'
              }
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isEnhancing ? 'animate-spin' : ''
                }`}
              >
                auto_fix_high
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setTranscript('');
              if (isSpeaking) {
                stopSpeech();
                setIsSpeaking(false);
              }
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#ba1a1a] active:scale-95 shadow-sm transition-transform hover:bg-[#ba1a1a]/10 cursor-pointer"
            title={language === 'en' ? 'Clear Text' : language === 'mr' ? 'मजकूर पुसा' : 'टेक्स्ट साफ़ करें'}
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>
        </div>
      </section>

      {/* 7. Offline Sync Status Bar */}
      <section className="w-full bg-white rounded-xl p-3.5 shadow-[0_3px_0px_#191c1e] border-2 border-[#191c1e] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#006948]/10 text-[#006948] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              cloud_done
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#191c1e] truncate">
              {kb.offlineModeTitle}
            </span>
            <span className="text-[11px] text-[#006948] font-bold truncate">
              {kb.offlineModeDesc}
            </span>
          </div>
        </div>

        <button
          id="btn-sync-action"
          type="button"
          onClick={onSync}
          className="h-10 px-3 rounded-lg bg-[#eceef0] text-[#3d4a42] text-[13px] font-bold flex items-center gap-1 active:scale-95 border border-[#bccac0]/40 shrink-0"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isSyncing ? 'animate-spin text-[#006948]' : ''
            }`}
          >
            sync
          </span>
          <span>{isSyncing ? '...' : t.syncNow}</span>
        </button>
      </section>

      {/* CPCB compliance notice */}
      <div className="p-2 text-center text-[11px] text-[#565e74]">
        <span>{kb.cpcbNotice}</span>
      </div>
    </div>
  );
};
