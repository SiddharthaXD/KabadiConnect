import React, { useState, useEffect, useRef } from 'react';
import { ScrapItem, Language } from '../types';
import { SCRAP_ITEMS, CAMERA_PREVIEW_IMG } from '../data/scrapData';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { TRANSLATIONS } from '../data/translations';

interface CameraScannerProps {
  onCapture: (detectedItem: ScrapItem) => void;
  language: Language;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, language }) => {
  const [selectedItem, setSelectedItem] = useState<ScrapItem>(SCRAP_ITEMS[0]);
  const [torchOn, setTorchOn] = useState<boolean>(true);
  const [isUsingWebcam, setIsUsingWebcam] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Setup Web Speech Recognition for "फोटो खींचो" / "take photo"
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let recognition: any = null;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.toLowerCase();
        if (
          transcript.includes('फोटो') ||
          transcript.includes('खींचो') ||
          transcript.includes('photo') ||
          transcript.includes('shoot') ||
          transcript.includes('capture')
        ) {
          triggerShutter();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } catch {
      // Speech recognition not permitted or supported
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [selectedItem]);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleWebcam = async () => {
    triggerHaptic(20);
    if (isUsingWebcam) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsUsingWebcam(false);
      setCameraError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsUsingWebcam(true);
        setCameraError(null);
      } catch (err) {
        console.warn('Could not access device camera:', err);
        setCameraError('कैमरा अनुमति उपलब्ध नहीं है, सिमुलेशन मोड जारी है।');
        setIsUsingWebcam(false);
      }
    }
  };

  const triggerShutter = () => {
    triggerHaptic([40, 60, 40]);
    setIsCapturing(true);
    speakVernacular(TRANSLATIONS[language].globalSpeech.photoCapturedProcessing, language);

    setTimeout(() => {
      setIsCapturing(false);
      onCapture(selectedItem);
    }, 450);
  };

  const handleAudioGuide = () => {
    triggerHaptic(20);
    speakVernacular(TRANSLATIONS[language].globalSpeech.cameraInstruction, language);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-24 pb-28 gap-3">
      {/* 1. Vernacular Context Header Prompt Bar */}
      <div className="w-full bg-[#dae2fd] rounded-xl p-3 flex items-center justify-between shadow-sm border-2 border-[#191c1e]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#006948] flex items-center justify-center text-white shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">center_focus_strong</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[17px] font-bold text-[#191c1e] truncate leading-tight">
              सामान स्कैन करें
            </span>
            <span className="text-[12px] text-[#565e74] truncate font-medium">
              Point camera directly at scrap
            </span>
          </div>
        </div>

        {/* Audio Assist Bubble */}
        <button
          id="audio-guide-btn"
          type="button"
          onClick={handleAudioGuide}
          className="h-10 px-3 rounded-full bg-[#ffdcc3] text-[#2f1500] flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform shadow-sm border border-[#8d4b00]/20"
        >
          <span className="material-symbols-outlined text-[#8d4b00] text-[18px]">volume_up</span>
          <span className="text-[13px] font-bold">सुनो</span>
        </button>
      </div>

      {cameraError && (
        <div className="p-2 bg-[#ffdcc3] text-[#8d4b00] text-[12px] rounded-lg font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>{cameraError}</span>
        </div>
      )}

      {/* 2. Realtime Scanner Viewfinder Viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#2d3133] aspect-[4/5] shadow-lg flex flex-col justify-between p-3 select-none border-3 border-[#191c1e]">
        {/* Flashlight Simulator Screen Overlay */}
        {torchOn && (
          <div className="absolute inset-0 bg-amber-50/15 pointer-events-none z-10" />
        )}

        {/* Shutter Capture White Flash Overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white z-40 animate-pulse transition-opacity duration-200" />
        )}

        {/* Camera Background Preview (Webcam or High-Def Motherboard Photo) */}
        <div className="absolute inset-0 z-0">
          {isUsingWebcam ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={selectedItem.imageUrl || CAMERA_PREVIEW_IMG}
              alt="Scrap Camera Feed"
              className="w-full h-full object-cover brightness-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2d3133]/60 via-transparent to-[#2d3133]/85" />
        </div>

        {/* Animated Scanning Laser Beam */}
        <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#85f8c4] to-transparent z-20 animate-laser-scan shadow-[0_0_12px_#85f8c4]" />

        {/* Top Live Detection Status Badge & Controls */}
        <div className="relative z-20 flex flex-col gap-1.5 w-full">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2d3133]/90 text-white backdrop-blur-md shadow-md border border-[#85f8c4]/40">
              <span className="w-2.5 h-2.5 rounded-full bg-[#85f8c4] animate-ping shrink-0" />
              <span className="text-[13px] font-bold text-[#85f8c4]">
                AI पहचान रहा है... AI Scanning
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleWebcam}
                className="px-2.5 py-1 rounded-full bg-[#2d3133]/80 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1 active:scale-95"
                title="Toggle Live Webcam / Simulation"
              >
                <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">
                  {isUsingWebcam ? 'videocam' : 'smart_display'}
                </span>
                <span>{isUsingWebcam ? 'लाइव' : 'सिमुलेशन'}</span>
              </button>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2d3133]/80 text-[#e0e3e5] backdrop-blur-md">
                <span className="material-symbols-outlined text-[16px] text-[#ffdcc3]">
                  auto_awesome
                </span>
                <span className="text-[12px] font-bold text-white font-['Space_Grotesk']">
                  60FPS
                </span>
              </div>
            </div>
          </div>

          {/* Quick Audio Helper Message floating inside camera */}
          <div
            onClick={handleAudioGuide}
            className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#b15f00]/90 text-white backdrop-blur-md shadow-sm cursor-pointer active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffdcc3]">
              volume_up
            </span>
            <span className="text-[12px] font-bold">सामने कंप्यूटर या बोर्ड रखें</span>
          </div>
        </div>

        {/* Dynamic AI Target Bounding Box Overlay */}
        <div className="relative z-20 self-center my-auto w-11/12 max-w-[280px] aspect-square flex flex-col justify-between p-2">
          {/* High Contrast Neon Target Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-lg bg-transparent border-t-4 border-l-4 border-[#85f8c4]" />
          <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg bg-transparent border-t-4 border-r-4 border-[#85f8c4]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-lg bg-transparent border-b-4 border-l-4 border-[#85f8c4]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-lg bg-transparent border-b-4 border-r-4 border-[#85f8c4]" />

          {/* Reticle Grid Accent Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <span className="material-symbols-outlined text-[#85f8c4] text-[48px]">
              filter_center_focus
            </span>
          </div>

          {/* AI Identified Tag Floating Card */}
          <div className="mt-auto self-center w-full bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-md flex items-center justify-between gap-2 border border-white/40">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedItem.isHazardous
                    ? 'bg-[#ba1a1a] text-white'
                    : 'bg-[#00855d] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {selectedItem.isHazardous ? 'warning' : 'memory'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold text-[#191c1e] truncate">
                    {selectedItem.nameHi}
                  </span>
                  <span className="text-[11px] text-[#565e74] truncate">
                    ({selectedItem.grade})
                  </span>
                </div>
                <span className="text-[12px] text-[#006948] font-bold font-['Space_Grotesk']">
                  ₹ {selectedItem.baseRate} / KG दर (Rate)
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-['Space_Grotesk'] ${
                  selectedItem.isHazardous
                    ? 'bg-[#ba1a1a] text-white'
                    : 'bg-[#85f8c4] text-[#002114]'
                }`}
              >
                {selectedItem.isHazardous ? 'खतरा Alert' : '94% सही'}
              </span>
              <span className="text-[11px] text-[#565e74] mt-0.5">High Quality</span>
            </div>
          </div>
        </div>

        {/* Voice Command Speech Hint Bubble */}
        <div className="relative z-20 self-center">
          <div className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md flex items-center gap-2 shadow-md border border-[#191c1e]/10">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isListening ? 'bg-[#b15f00] animate-pulse text-white' : 'bg-[#e0e3e5]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">mic</span>
            </div>
            <span className="text-[13px] font-bold text-[#191c1e]">
              बोलें: <span className="text-[#006948]">"फोटो खींचो"</span> (Say: Take Photo)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Physical Tactile Shutter & Camera Utilities Toolbar */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-3">
        {/* Main Controls Row */}
        <div className="flex items-center justify-between px-2">
          {/* Gallery Pick Button */}
          <label className="w-16 h-16 rounded-2xl bg-[#e6e8ea] flex flex-col items-center justify-center gap-1 text-[#191c1e] active:scale-95 transition-transform cursor-pointer border border-[#191c1e]/15 shadow-sm">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  triggerShutter();
                }
              }}
            />
            <span className="material-symbols-outlined text-[28px] text-[#565e74]">
              photo_library
            </span>
            <span className="text-[12px] text-[#3d4a42] font-bold leading-none">गैलरी</span>
          </label>

          {/* Massive Central Tactile Shutter Button */}
          <div className="relative flex items-center justify-center">
            {/* Outer Glowing Ring */}
            <div className="w-24 h-24 rounded-full bg-[#68dba9]/40 flex items-center justify-center animate-pulse">
              {/* Tactile Primary Action Trigger */}
              <button
                id="shutter-trigger"
                type="button"
                onClick={triggerShutter}
                className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center p-1.5 active:scale-90 transition-all border-2 border-[#191c1e]"
              >
                <div className="w-full h-full rounded-full bg-[#006948] flex items-center justify-center shadow-inner text-white">
                  <span className="material-symbols-outlined text-[36px]">photo_camera</span>
                </div>
              </button>
            </div>
          </div>

          {/* Flashlight / Torch Toggle Button */}
          <button
            id="flash-toggle"
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setTorchOn(!torchOn);
            }}
            className="w-16 h-16 rounded-2xl bg-[#e6e8ea] flex flex-col items-center justify-center gap-1 text-[#191c1e] active:scale-95 transition-transform border border-[#191c1e]/15 shadow-sm"
          >
            <span
              id="flash-icon"
              className={`material-symbols-outlined text-[28px] ${
                torchOn ? 'text-[#8d4b00]' : 'text-[#565e74]'
              }`}
            >
              {torchOn ? 'flashlight_on' : 'flashlight_off'}
            </span>
            <span className="text-[12px] text-[#3d4a42] font-bold leading-none">टॉर्च</span>
          </button>
        </div>

        {/* Quick Manual Select Chips for Collector Assurance */}
        <div className="relative flex items-center justify-between bg-[#f2f4f6] rounded-xl px-3 py-2 border border-[#bccac0]/40">
          <div className="flex items-center gap-1.5 text-[#3d4a42]">
            <span className="material-symbols-outlined text-[18px] text-[#006948]">verified</span>
            <span className="text-[12px] font-bold">पहचान की श्रेणी:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-[#006948] text-white text-[12px] font-bold shadow-sm">
              {selectedItem.nameHi}
            </span>
            <button
              id="btn-switch-item"
              type="button"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="px-2.5 py-1 rounded-full bg-[#e0e3e5] text-[#191c1e] text-[12px] font-bold flex items-center gap-0.5 active:scale-95 border border-[#bccac0]/50"
            >
              <span>बदलें</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>

          {/* Popover item selector */}
          {showCategoryMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-[#191c1e] z-30 p-1 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#565e74] px-2 py-1">
                सामान का प्रकार चुनें:
              </span>
              {SCRAP_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic(20);
                    setSelectedItem(item);
                    setShowCategoryMenu(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg text-left text-[13px] font-bold transition-colors ${
                    selectedItem.id === item.id
                      ? 'bg-[#85f8c4]/40 text-[#002114]'
                      : 'hover:bg-[#eceef0] text-[#191c1e]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isHazardous ? 'bg-[#ba1a1a]' : 'bg-[#006948]'
                      }`}
                    />
                    <span>{item.nameHi}</span>
                  </div>
                  <span className="text-[12px] text-[#006948]">₹{item.baseRate}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Audio Alert Feedback Toast Banner */}
      <div
        id="speech-toast"
        className="w-full bg-[#eceef0] rounded-xl p-3 flex items-center gap-2.5 border border-[#bccac0]/40 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#ffdcc3] text-[#2f1500] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px] text-[#8d4b00]">hearing</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-[#191c1e]">
            आवाज़ से संचालित (Voice Enabled)
          </span>
          <span className="text-[11px] text-[#3d4a42] truncate">
            "फोटो खींचो" बोलें या बड़ा हरा बटन दबाएं
          </span>
        </div>
      </div>
    </div>
  );
};
