import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BuildingOfficeIcon, UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, MicrophoneIcon } from './icons';
import { LANDLORD_INFO } from '../constants';

interface LoginViewProps {
  onLogin: (username: string, password: string) => boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isBrowserSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const parseSpeechWithAI = async (transcript: string) => {
    setIsParsing(true);
    setSpeechError('');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Phân tích câu sau đây và trích xuất tên đăng nhập (username) và mật khẩu (password). Câu: "${transcript}". Trả về một đối tượng JSON có dạng {"username": "...", "password": "..."}. Tên đăng nhập thường không có dấu và viết liền.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        username: { type: Type.STRING },
                        password: { type: Type.STRING },
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result.username) {
            setUsername(result.username.toLowerCase().replace(/\s/g, ''));
        }
        if (result.password) {
            setPassword(result.password.replace(/\s/g, ''));
        }
        if (!result.username && !result.password) {
            setSpeechError("AI không nhận dạng được thông tin đăng nhập.");
        }
    } catch (e) {
        console.error("Lỗi phân tích giọng nói bằng AI:", e);
        setSpeechError("Đã xảy ra lỗi khi AI phân tích giọng nói.");
    } finally {
        setIsParsing(false);
    }
  };

  useEffect(() => {
    if (!isBrowserSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') setSpeechError('Không nhận được âm thanh.');
        else if (event.error !== 'aborted') setSpeechError(`Lỗi: ${event.error}`);
        setIsListening(false);
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) parseSpeechWithAI(transcript);
    };
  }, [isBrowserSupported]);
  
  const handleListen = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isParsing) return;

    if (isListening) {
        recognition.stop();
    } else {
        setSpeechError('');
        try {
            recognition.start();
        } catch (e) {
            console.error("Speech recognition error:", e);
            setSpeechError("Không thể bắt đầu ghi âm.");
        }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div className="w-full max-w-sm animate-fade-in-up group">
        <div className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 transition-transform duration-300 group-hover:scale-105">
            <div className="flex flex-col items-center text-center mb-8">
                 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                    <BuildingOfficeIcon className="h-12 w-12 text-white" />
                 </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {LANDLORD_INFO.name}
                </h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                   {LANDLORD_INFO.address}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                   SĐT: {LANDLORD_INFO.phone}
                </p>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                   Chào mừng trở lại!
                </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                     <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
                     <div className="p-0.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 focus-within:p-0.5 shadow-sm">
                         <div className="relative bg-white/80 dark:bg-slate-800/80 rounded-[7px] w-full h-full">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                 <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                             </div>
                             <input
                                 id="username"
                                 name="username"
                                 type="text"
                                 autoComplete="username"
                                 required
                                 value={username}
                                 onChange={(e) => setUsername(e.target.value)}
                                 className="block w-full rounded-md border-0 bg-transparent py-2.5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-0 sm:text-sm"
                                 placeholder="Tên đăng nhập"
                             />
                         </div>
                     </div>
                </div>
                <div>
                     <label htmlFor="password"className="sr-only">Mật khẩu</label>
                     <div className="p-0.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 focus-within:p-0.5 shadow-sm">
                         <div className="relative bg-white/80 dark:bg-slate-800/80 rounded-[7px] w-full h-full">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                 <LockClosedIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                             </div>
                             <input
                                 id="password"
                                 name="password"
                                 type={showPassword ? 'text' : 'password'}
                                 autoComplete="current-password"
                                 required
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                                 className="block w-full rounded-md border-0 bg-transparent py-2.5 pl-10 pr-10 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-0 sm:text-sm"
                                 placeholder="Mật khẩu"
                             />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                                 aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                             >
                                 {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                             </button>
                         </div>
                     </div>
                </div>

                {error && (
                    <div className="flex items-center justify-center">
                        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                    </div>
                )}
                
                {isBrowserSupported && (
                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={handleListen}
                            disabled={isParsing}
                            className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 ${
                                isListening
                                    ? 'bg-red-500 border-red-300 text-white animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-700 border-transparent text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500'
                            }`}
                            aria-label="Đăng nhập bằng giọng nói"
                        >
                            <MicrophoneIcon className="w-6 h-6" />
                        </button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 h-4">
                            {isListening ? "Đang nghe..." : isParsing ? "Đang xử lý..." : speechError || "Nhấn để nói tên đăng nhập & mật khẩu"}
                        </p>
                    </div>
                )}


                <div>
                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/50 dark:hover:shadow-indigo-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        Đăng nhập
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default LoginView;