import React, { useState, useEffect, useRef } from 'react';
import { ScrapItem, Language } from '../types';
import { SCRAP_ITEMS, CAMERA_PREVIEW_IMG } from '../data/scrapData';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { TRANSLATIONS } from '../data/translations';

interface CameraScannerProps {
  onCapture: (detectedItem: ScrapItem) => void;
  language: Language;
  onCancel?: () => void;
}

type CameraStatus = 'starting' | 'active' | 'denied' | 'error' | 'unsupported';

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCapture,
  language,
  onCancel,
}) => {
  const [selectedItem, setSelectedItem] = useState<ScrapItem>(SCRAP_ITEMS[0]);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('starting');
  const [isUsingWebcam, setIsUsingWebcam] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop current active camera stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
    setMediaStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsUsingWebcam(false);
  };

  // Synchronize stream with always-mounted video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (mediaStream) {
      video.srcObject = mediaStream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsUsingWebcam(true);
            setCameraStatus('active');
          })
          .catch((err) => {
            console.warn('Video auto-play interrupted:', err);
          });
      }
    } else {
      video.srcObject = null;
      setIsUsingWebcam(false);
    }
  }, [mediaStream]);

  // Start mobile camera (rear prioritized) or laptop/PC webcam with multi-tier fallback
  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraStatus('starting');
    setErrorMessage(null);

    // Verify browser support for getUserMedia
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      setErrorMessage(
        language === 'mr'
          ? 'तुमच्या ब्राउझरमध्ये थेट कॅमेरा स्ट्रीम समर्थित नाही. खालील बटणाने थेट फोन कॅमेरा वापरा.'
          : language === 'en'
          ? 'Live camera stream is not supported in this browser. Please tap below to open phone camera.'
          : 'आपके ब्राउज़र में सीधा कैमरा स्ट्रीम समर्थित नहीं है। नीचे दिए बटन से फ़ोन कैमरा उपयोग करें।'
      );
      return;
    }

    // Constraint ladder for resilient mobile and desktop camera access:
    // 1: Phone rear camera with ideal facingMode (no rigid resolution to prevent overconstrained errors)
    // 2: String facingMode
    // 3: Ideal facingMode with 1280x720 preferred
    // 4: Universal video: true
    const candidateConstraints: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: mode },
        },
        audio: false,
      },
      {
        video: {
          facingMode: mode,
        },
        audio: false,
      },
      {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      {
        video: true,
        audio: false,
      },
    ];

    let stream: MediaStream | null = null;
    let lastError: unknown = null;

    for (const constraints of candidateConstraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream && stream.getVideoTracks().length > 0) {
          break;
        }
      } catch (err: unknown) {
        lastError = err;
        console.warn('Camera constraint attempt failed:', constraints, err);
        // If permission was explicitly denied, do not keep prompting the user
        const errObj = err as { name?: string };
        if (
          errObj?.name === 'NotAllowedError' ||
          errObj?.name === 'PermissionDeniedError' ||
          errObj?.name === 'SecurityError'
        ) {
          break;
        }
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      setMediaStream(stream);

      // Also attach to video element directly if already ready
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current
          .play()
          .then(() => {
            setIsUsingWebcam(true);
            setCameraStatus('active');
          })
          .catch((playErr) => {
            console.warn('Initial video play error:', playErr);
          });
      }

      setErrorMessage(null);

      // Check if device has multiple cameras (e.g. front & back on mobile phones)
      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        } catch {
          // ignore
        }
      }
    } else {
      setIsUsingWebcam(false);
      setMediaStream(null);

      const errorObj = lastError as { name?: string; message?: string } | null;
      if (
        errorObj?.name === 'NotAllowedError' ||
        errorObj?.name === 'PermissionDeniedError' ||
        errorObj?.name === 'SecurityError'
      ) {
        setCameraStatus('denied');
        setErrorMessage(
          language === 'mr'
            ? 'कॅमेरा परवानगी नाकारली गेली. कृपया खालील बटणाने थेट फोन कॅमेरा उघडा.'
            : language === 'en'
            ? 'Camera access denied. Tap below to use your phone camera or allow browser permissions.'
            : 'कैमरा अनुमति अस्वीकृत है। कृपया नीचे दिए बटन से फ़ोन कैमरा उपयोग करें।'
        );
      } else {
        setCameraStatus('error');
        setErrorMessage(
          language === 'mr'
            ? 'थेट कॅमेरा सुरू करता आला नाही. काळजी करू नका, खालील बटणाने थेट फोनचा कॅमेरा उघडा.'
            : language === 'en'
            ? 'Could not start live stream. Tap below to open your phone camera directly.'
            : 'सीधा कैमरा नहीं खुल सका। नीचे दिए गए बटन से सीधे फ़ोन का कैमरा खोलें।'
        );
      }
    }
  };

  // Automatically start device camera on component mount & when facingMode changes
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Setup Web Speech Recognition for voice trigger "फोटो खींचो" / "take photo"
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
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'en' ? 'en-IN' : 'hi-IN';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.toLowerCase();
        if (
          transcript.includes('फोटो') ||
          transcript.includes('खींचो') ||
          transcript.includes('काढा') ||
          transcript.includes('photo') ||
          transcript.includes('shoot') ||
          transcript.includes('capture') ||
          transcript.includes('scan')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, language, isUsingWebcam]);

  // Flip between rear and front camera (phone environment / laptop user)
  const toggleFacingMode = () => {
    triggerHaptic(25);
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle hardware torch if supported, or simulated illumination overlay
  const toggleTorch = async () => {
    triggerHaptic(20);
    const nextState = !torchOn;
    setTorchOn(nextState);

    if (mediaStreamRef.current) {
      try {
        const track = mediaStreamRef.current.getVideoTracks()[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const capabilities = (track as any)?.getCapabilities?.();
        if (capabilities?.torch) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (track as any).applyConstraints({
            advanced: [{ torch: nextState }],
          });
        }
      } catch (err) {
        console.warn('Torch constraint error:', err);
      }
    }
  };

  // Capture photo from live camera frame or fallback to native phone camera
  const triggerShutter = () => {
    // If live webcam/stream is not streaming frames, directly open native phone camera
    if (!isUsingWebcam) {
      triggerHaptic(30);
      fileInputRef.current?.click();
      return;
    }

    triggerHaptic([40, 60, 40]);
    setIsCapturing(true);
    speakVernacular(TRANSLATIONS[language].globalSpeech.photoCapturedProcessing, language);

    let capturedUrl = selectedItem.imageUrl || CAMERA_PREVIEW_IMG;

    // Grab actual live frame from the video stream
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // If front camera/user webcam, mirror the captured frame to match the preview
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          capturedUrl = canvas.toDataURL('image/jpeg', 0.88);
        }
      } catch (err) {
        console.warn('Canvas frame capture error:', err);
      }
    }

    setTimeout(() => {
      setIsCapturing(false);
      onCapture({
        ...selectedItem,
        imageUrl: capturedUrl,
      });
    }, 450);
  };

  // Handle direct file input or native phone camera snap
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic([30, 40]);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setIsCapturing(true);
        speakVernacular(TRANSLATIONS[language].globalSpeech.photoCapturedProcessing, language);
        setTimeout(() => {
          setIsCapturing(false);
          onCapture({
            ...selectedItem,
            imageUrl: dataUrl || selectedItem.imageUrl,
          });
        }, 400);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioGuide = () => {
    triggerHaptic(20);
    speakVernacular(TRANSLATIONS[language].globalSpeech.cameraInstruction, language);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-32 pb-28 gap-3">
      {/* 1. Header Bar with Audio Guide & Close/Back Button */}
      <div className="w-full bg-[#dae2fd] dark:bg-[#1a2942] rounded-2xl p-3 flex items-center justify-between shadow-sm border-2 border-[#191c1e] dark:border-[#38bdf8]/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#006948] flex items-center justify-center text-white shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">center_focus_strong</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[17px] font-black text-[#191c1e] dark:text-[#f1f5f9] truncate leading-tight">
              {language === 'mr'
                ? 'ई-कचरा कॅमेरा'
                : language === 'en'
                ? 'Scan E-Waste'
                : 'ई-कचरा स्कैन कैमरा'}
            </span>
            <span className="text-[12px] text-[#565e74] dark:text-[#94a3b8] truncate font-medium">
              {language === 'mr'
                ? 'कॅमेऱ्यासमोर सामान धरा'
                : language === 'en'
                ? 'Point camera or webcam at scrap'
                : 'कैमरे के सामने सामान रखें'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Audio Assist Button */}
          <button
            id="audio-guide-btn"
            type="button"
            onClick={handleAudioGuide}
            className="h-9 px-2.5 rounded-full bg-[#ffdcc3] dark:bg-[#3d2306] text-[#2f1500] dark:text-[#ffedd5] flex items-center gap-1 shrink-0 active:scale-95 transition-transform shadow-sm border border-[#8d4b00]/20 cursor-pointer"
            title={language === 'mr' ? 'ऐका' : language === 'en' ? 'Listen Instructions' : 'सुनो'}
          >
            <span className="material-symbols-outlined text-[#8d4b00] dark:text-[#fbbf24] text-[18px]">volume_up</span>
            <span className="text-[12px] font-bold">
              {language === 'mr' ? 'ऐका' : language === 'en' ? 'Listen' : 'सुनो'}
            </span>
          </button>

          {/* Close/Cancel Navigation Button */}
          {onCancel && (
            <button
              id="btn-close-scanner"
              type="button"
              onClick={() => {
                triggerHaptic(20);
                stopCamera();
                onCancel();
              }}
              className="w-9 h-9 rounded-full bg-white/70 dark:bg-[#223348] text-[#191c1e] dark:text-white flex items-center justify-center active:scale-95 transition-transform border border-[#191c1e]/20 cursor-pointer"
              title={language === 'mr' ? 'बंद करा' : language === 'en' ? 'Close' : 'बंद करें'}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Realtime Scanner Viewfinder Viewport */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#1a1f24] aspect-[4/5] shadow-xl flex flex-col justify-between p-3 select-none border-3 border-[#191c1e] dark:border-[#33485c]">
        {/* Flashlight Simulator Overlay */}
        {torchOn && (
          <div className="absolute inset-0 bg-amber-50/20 pointer-events-none z-10" />
        )}

        {/* Shutter Capture White Flash Overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white z-40 animate-pulse transition-opacity duration-200" />
        )}

        {/* Camera Feed Background: Video Element ALWAYS MOUNTED in DOM to prevent mobile black screen */}
        <div className="absolute inset-0 z-0 bg-[#0d1217] flex items-center justify-center overflow-hidden">
          {/* Always-mounted video tag for streaming */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              videoRef.current?.play().catch(() => {});
            }}
            onCanPlay={() => {
              setIsUsingWebcam(true);
              setCameraStatus('active');
            }}
            onPlaying={() => {
              setIsUsingWebcam(true);
              setCameraStatus('active');
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isUsingWebcam ? 'opacity-100 z-1' : 'opacity-0 pointer-events-none'
            } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />

          {/* When Camera is Connecting / Starting */}
          {!isUsingWebcam && cameraStatus === 'starting' && (
            <div className="relative z-10 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <div className="w-14 h-14 rounded-full border-4 border-[#85f8c4] border-t-transparent animate-spin" />
              <div className="flex flex-col gap-1">
                <span className="text-[15px] font-bold text-[#85f8c4]">
                  {language === 'mr'
                    ? 'फोन कॅमेरा सुरू होत आहे...'
                    : language === 'en'
                    ? 'Opening Phone Camera...'
                    : 'फ़ोन कैमरा शुरू हो रहा है...'}
                </span>
                <span className="text-[12px] text-white/70 max-w-[240px]">
                  {language === 'mr'
                    ? 'कृपया कॅमेरा परवानगी द्या किंवा खालील बटण दाबा'
                    : language === 'en'
                    ? 'Please allow camera or tap below to open phone camera'
                    : 'कृपया कैमरा अनुमति दें या नीचे बटन से फ़ोटो खींचें'}
                </span>
              </div>

              {/* Instant Native Phone Camera Option */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(25);
                  fileInputRef.current?.click();
                }}
                className="mt-2 px-4 py-2 rounded-full bg-[#85f8c4] hover:bg-[#6ee7b7] text-[#002114] text-[13px] font-black flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>
                  {language === 'mr'
                    ? 'थेट फोन कॅमेरा उघडा'
                    : language === 'en'
                    ? 'Open Phone Camera'
                    : 'सीधे फ़ोन कैमरा खोलें'}
                </span>
              </button>
            </div>
          )}

          {/* When Camera is Inactive, Blocked, Denied, or Error */}
          {!isUsingWebcam && cameraStatus !== 'starting' && (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <img
                src={selectedItem.imageUrl || CAMERA_PREVIEW_IMG}
                alt="Scrap Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
              <div className="relative z-20 flex flex-col items-center max-w-[280px]">
                <div className="w-14 h-14 rounded-2xl bg-[#006948] text-[#85f8c4] flex items-center justify-center mb-3 shadow-xl border border-[#85f8c4]/30">
                  <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                </div>
                <span className="text-[15px] font-black text-white mb-1.5">
                  {cameraStatus === 'denied'
                    ? language === 'mr'
                      ? 'कॅमेरा परवानगी आवश्यक'
                      : language === 'en'
                      ? 'Camera Permission Required'
                      : 'कैमरा अनुमति आवश्यक'
                    : language === 'mr'
                    ? 'थेट फोन कॅमेऱ्याने फोटो काढा'
                    : language === 'en'
                    ? 'Use Phone Camera'
                    : 'फ़ोन कैमरे से फ़ोटो लें'}
                </span>
                <p className="text-[12px] text-white/80 mb-4 leading-relaxed">
                  {errorMessage ||
                    (language === 'mr'
                      ? 'खालील हिरवे बटण दाबून तुमच्या फोनचा मुख्य कॅमेरा उघडा.'
                      : language === 'en'
                      ? 'Tap the button below to take a photo using your phone camera.'
                      : 'नीचे दिया बटन दबाकर अपने फ़ोन का कैमरा खोलें।')}
                </p>

                <div className="flex flex-col w-full gap-2">
                  {/* High Priority 100% Reliable Native Phone Camera Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(30);
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#85f8c4] hover:bg-[#6ee7b7] text-[#002114] text-[13px] font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    <span>
                      {language === 'mr'
                        ? '📸 फोनचा कॅमेरा उघडा'
                        : language === 'en'
                        ? '📸 Open Phone Camera'
                        : '📸 फ़ोन का कैमरा खोलें'}
                    </span>
                  </button>

                  {/* Retry Live Stream */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(20);
                      startCamera(facingMode);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 backdrop-blur-md border border-white/20 active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>
                      {language === 'mr'
                        ? 'थेट स्ट्रीम पुन्हा सुरू करा'
                        : language === 'en'
                        ? 'Retry Live Stream'
                        : 'सीधा स्ट्रीम पुनः प्रयास करें'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vignette Shadow Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f24]/70 via-transparent to-[#1a1f24]/90 pointer-events-none z-5" />
        </div>

        {/* Animated Scanning Laser Beam */}
        {isUsingWebcam && (
          <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#85f8c4] to-transparent z-20 animate-laser-scan shadow-[0_0_14px_#85f8c4]" />
        )}

        {/* Top Viewfinder Status & Quick Hardware Bar */}
        <div className="relative z-20 flex items-center justify-between w-full">
          {/* Live Indicator Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 text-white backdrop-blur-md shadow-md border border-[#85f8c4]/40">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isUsingWebcam ? 'bg-[#85f8c4] animate-ping' : 'bg-[#ffdcc3]'
              } shrink-0`}
            />
            <span className="text-[12px] font-bold text-[#85f8c4]">
              {isUsingWebcam
                ? language === 'mr'
                  ? 'थेट कॅमेरा • 60 FPS'
                  : language === 'en'
                  ? 'Live Camera • 60 FPS'
                  : 'लाइव कैमरा • 60 FPS'
                : language === 'mr'
                ? 'सिमुलेशन मोड'
                : language === 'en'
                ? 'Simulation Mode'
                : 'सिमुलेशन मोड'}
            </span>
          </div>

          {/* Quick Hardware Controls (Camera Flip & Retry) */}
          <div className="flex items-center gap-1.5">
            {/* Flip Camera Button (Front / Rear / Webcam) */}
            <button
              id="btn-flip-camera"
              type="button"
              onClick={toggleFacingMode}
              className="px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              title={
                language === 'mr'
                  ? 'कॅमेरा बदला (समोरील/मागील)'
                  : language === 'en'
                  ? 'Flip Camera (Rear/Front/Webcam)'
                  : 'कैमरा बदलें (आगे/पीछे/वेबकैम)'
              }
            >
              <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">
                flip_camera_ios
              </span>
              <span>
                {facingMode === 'environment'
                  ? language === 'en'
                    ? 'Rear'
                    : 'बैक'
                  : language === 'en'
                  ? 'Front'
                  : 'फ्रंट'}
              </span>
            </button>

            {/* Toggle Camera Reconnect / Re-trigger */}
            {!isUsingWebcam && (
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-2.5 py-1 rounded-full bg-[#006948] text-white text-[11px] font-bold backdrop-blur-md border border-[#85f8c4]/40 flex items-center gap-1 active:scale-95 cursor-pointer"
                title="Start Camera"
              >
                <span className="material-symbols-outlined text-[15px]">videocam</span>
                <span>{language === 'en' ? 'Connect' : 'शुरू करें'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Neon AI Target Reticle Box */}
        <div className="relative z-20 self-center my-auto w-11/12 max-w-[280px] aspect-square flex flex-col justify-between p-2">
          {/* High Contrast Neon Target Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-lg bg-transparent border-t-4 border-l-4 border-[#85f8c4]" />
          <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg bg-transparent border-t-4 border-r-4 border-[#85f8c4]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-lg bg-transparent border-b-4 border-l-4 border-[#85f8c4]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-lg bg-transparent border-b-4 border-r-4 border-[#85f8c4]" />

          {/* Reticle Grid Accent Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <span className="material-symbols-outlined text-[#85f8c4] text-[52px]">
              filter_center_focus
            </span>
          </div>

          {/* AI Identified Item Floating Card */}
          <div className="mt-auto self-center w-full bg-white/95 dark:bg-[#131c24]/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg flex items-center justify-between gap-2 border border-white/40 dark:border-[#33485c]">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
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
                  <span className="text-[14px] font-black text-[#191c1e] dark:text-white truncate">
                    {language === 'mr'
                      ? selectedItem.nameMr || selectedItem.nameHi
                      : language === 'en'
                      ? selectedItem.nameEn
                      : selectedItem.nameHi}
                  </span>
                  <span className="text-[11px] font-bold text-[#565e74] dark:text-[#94a3b8] truncate">
                    ({selectedItem.grade})
                  </span>
                </div>
                <span className="text-[12px] text-[#006948] dark:text-[#34d399] font-black font-['Space_Grotesk']">
                  ₹{selectedItem.baseRate} / KG {language === 'en' ? 'Rate' : 'सरकारी दर'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold font-['Space_Grotesk'] ${
                  selectedItem.isHazardous
                    ? 'bg-[#ba1a1a] text-white'
                    : 'bg-[#85f8c4] text-[#002114]'
                }`}
              >
                {selectedItem.isHazardous ? '⚠️ अलर्ट' : '96% Match'}
              </span>
              <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8] font-medium mt-0.5">
                {selectedItem.isHazardous ? 'Hazardous' : 'High Grade'}
              </span>
            </div>
          </div>
        </div>

        {/* Voice Command Speech Hint Bubble */}
        <div className="relative z-20 self-center">
          <div className="px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md flex items-center gap-2 shadow-md border border-white/20">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isListening ? 'bg-[#00855d] animate-pulse text-white' : 'bg-white/30 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">mic</span>
            </div>
            <span className="text-[12px] font-bold text-white">
              {language === 'mr' ? (
                <>
                  बोला: <span className="text-[#85f8c4]">"फोटो काढा"</span>
                </>
              ) : language === 'en' ? (
                <>
                  Say: <span className="text-[#85f8c4]">"Take Photo"</span>
                </>
              ) : (
                <>
                  बोलें: <span className="text-[#85f8c4]">"फोटो खींचो"</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Physical Tactile Shutter & Camera Utilities Toolbar */}
      <div className="w-full bg-white dark:bg-[#131c24] rounded-2xl p-4 shadow-sm border-2 border-[#191c1e] dark:border-[#33485c] flex flex-col gap-3">
        {/* Main Controls Row */}
        <div className="flex items-center justify-between px-2">
          {/* Gallery / Native Phone Camera Button */}
          <label
            id="btn-upload-scrap-photo"
            className="w-16 h-16 rounded-2xl bg-[#f2f4f6] dark:bg-[#1b2733] flex flex-col items-center justify-center gap-1 text-[#191c1e] dark:text-white active:scale-95 transition-transform cursor-pointer border border-[#bccac0]/40 dark:border-[#33485c] shadow-sm hover:bg-[#e4e7e9]"
            title={
              language === 'mr'
                ? 'गॅलरी किंवा फोन कॅमेरा'
                : language === 'en'
                ? 'Gallery or Phone Camera'
                : 'गैलरी या फोन कैमरा'
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="material-symbols-outlined text-[26px] text-[#006948] dark:text-[#34d399]">
              photo_camera_back
            </span>
            <span className="text-[11px] font-bold leading-none">
              {language === 'mr' ? 'गॅलरी' : language === 'en' ? 'Gallery' : 'गैलरी'}
            </span>
          </label>

          {/* Central Tactile Shutter Trigger Button */}
          <div className="relative flex items-center justify-center">
            {/* Glowing Ring */}
            <div className="w-24 h-24 rounded-full bg-[#85f8c4]/30 dark:bg-[#006948]/30 flex items-center justify-center animate-pulse">
              <button
                id="shutter-trigger"
                type="button"
                onClick={triggerShutter}
                className="w-20 h-20 rounded-full bg-white dark:bg-[#191c1e] shadow-xl flex items-center justify-center p-1.5 active:scale-90 transition-all border-2 border-[#191c1e] dark:border-[#85f8c4] cursor-pointer"
                title={
                  language === 'mr'
                    ? 'फोटो काढा'
                    : language === 'en'
                    ? 'Take Photo'
                    : 'फोटो खींचें'
                }
              >
                <div className="w-full h-full rounded-full bg-[#006948] hover:bg-[#00855d] flex items-center justify-center shadow-inner text-white transition-colors">
                  <span className="material-symbols-outlined text-[36px]">photo_camera</span>
                </div>
              </button>
            </div>
          </div>

          {/* Flashlight / Torch Toggle Button */}
          <button
            id="flash-toggle"
            type="button"
            onClick={toggleTorch}
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform border shadow-sm cursor-pointer ${
              torchOn
                ? 'bg-[#ffdcc3] dark:bg-[#3d2306] text-[#8d4b00] dark:text-[#fbbf24] border-[#8d4b00]/40'
                : 'bg-[#f2f4f6] dark:bg-[#1b2733] text-[#565e74] dark:text-[#94a3b8] border-[#bccac0]/40 dark:border-[#33485c]'
            }`}
            title={language === 'mr' ? 'टॉर्च' : language === 'en' ? 'Torch' : 'टॉर्च'}
          >
            <span
              id="flash-icon"
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: torchOn ? "'FILL' 1" : "'FILL' 0" }}
            >
              {torchOn ? 'flashlight_on' : 'flashlight_off'}
            </span>
            <span className="text-[11px] font-bold leading-none">
              {language === 'mr' ? 'टॉर्च' : language === 'en' ? 'Torch' : 'टॉर्च'}
            </span>
          </button>
        </div>

        {/* Manual Scrap Category Picker for Instant Verification */}
        <div className="relative flex items-center justify-between bg-[#f2f4f6] dark:bg-[#182430] rounded-xl px-3 py-2.5 border border-[#bccac0]/40 dark:border-[#2a3c4e]">
          <div className="flex items-center gap-1.5 text-[#191c1e] dark:text-[#e2e8f0]">
            <span className="material-symbols-outlined text-[18px] text-[#006948] dark:text-[#34d399]">
              verified
            </span>
            <span className="text-[12px] font-bold">
              {language === 'mr'
                ? 'निवडलेली श्रेणी:'
                : language === 'en'
                ? 'Detected Item:'
                : 'पहचान की श्रेणी:'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-[#006948] text-white text-[12px] font-bold shadow-sm truncate max-w-[120px]">
              {language === 'mr'
                ? selectedItem.nameMr || selectedItem.nameHi
                : language === 'en'
                ? selectedItem.nameEn
                : selectedItem.nameHi}
            </span>
            <button
              id="btn-switch-item"
              type="button"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="px-2 py-1 rounded-full bg-[#e0e3e5] dark:bg-[#253648] text-[#191c1e] dark:text-white text-[12px] font-bold flex items-center gap-0.5 active:scale-95 border border-[#bccac0]/50 dark:border-[#3a4d62] cursor-pointer"
            >
              <span>{language === 'mr' ? 'बदला' : language === 'en' ? 'Change' : 'बदलें'}</span>
              <span className="material-symbols-outlined text-[15px]">expand_more</span>
            </button>
          </div>

          {/* Popover item selector */}
          {showCategoryMenu && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#131c24] rounded-2xl shadow-2xl border-2 border-[#191c1e] dark:border-[#33485c] z-30 p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto">
              <span className="text-[11px] font-bold text-[#565e74] dark:text-[#94a3b8] px-2 py-1">
                {language === 'mr'
                  ? 'ई-कचरा निवडा:'
                  : language === 'en'
                  ? 'Select E-Waste Item:'
                  : 'ई-कचरा प्रकार चुनें:'}
              </span>
              {SCRAP_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic(20);
                    setSelectedItem(item);
                    setShowCategoryMenu(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl text-left text-[13px] font-bold transition-colors cursor-pointer ${
                    selectedItem.id === item.id
                      ? 'bg-[#85f8c4]/40 text-[#002114] dark:text-[#85f8c4]'
                      : 'hover:bg-[#eceef0] dark:hover:bg-[#1e2d3d] text-[#191c1e] dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        item.isHazardous ? 'bg-[#ba1a1a]' : 'bg-[#006948]'
                      }`}
                    />
                    <span className="truncate">
                      {language === 'mr'
                        ? item.nameMr || item.nameHi
                        : language === 'en'
                        ? item.nameEn
                        : item.nameHi}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#006948] dark:text-[#34d399] shrink-0 font-['Space_Grotesk']">
                    ₹{item.baseRate}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Audio Alert Feedback Toast Banner */}
      <div
        id="speech-toast"
        className="w-full bg-[#eceef0] dark:bg-[#182430] rounded-xl p-3 flex items-center gap-2.5 border border-[#bccac0]/40 dark:border-[#2a3c4e]"
      >
        <div className="w-8 h-8 rounded-full bg-[#ffdcc3] dark:bg-[#3d2306] text-[#2f1500] dark:text-[#ffedd5] flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-[#8d4b00] dark:text-[#fbbf24]">
            hearing
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-[#191c1e] dark:text-white">
            {language === 'mr'
              ? 'आवाजाने नियंत्रित (Voice Enabled)'
              : language === 'en'
              ? 'Voice Controlled Shutter'
              : 'आवाज़ से संचालित (Voice Enabled)'}
          </span>
          <span className="text-[11px] text-[#3d4a42] dark:text-[#94a3b8] truncate">
            {language === 'mr'
              ? '"फोटो काढा" बोला किंवा हिरवे बटण दाबा'
              : language === 'en'
              ? 'Say "Take Photo" or press the green shutter'
              : '"फोटो खींचो" बोलें या बड़ा हरा बटन दबाएं'}
          </span>
        </div>
      </div>
    </div>
  );
};
