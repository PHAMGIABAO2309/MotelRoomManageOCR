import React, { useState, useEffect, useRef, useMemo } from 'react';
import Modal from './Modal';
import { Room, UsageRecord } from '../types';
import { MicrophoneIcon, CameraIcon, DocumentMagnifyingGlassIcon } from './icons';
import { GoogleGenAI, Type } from "@google/genai";
import { ELECTRIC_RATE, WATER_RATE } from '../constants';

interface RecordUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { electricReading: number, waterReading: number, startDate: string, endDate: string, recordId?: string, billAmount?: number, isPaid?: boolean, baseRent?: number }) => void;
  room: Room;
  recordToEdit?: UsageRecord | null;
  mode?: 'record' | 'checkout';
}

const RecordUsageModal: React.FC<RecordUsageModalProps> = ({ isOpen, onClose, onSave, room, recordToEdit, mode = 'record' }) => {
  const isEditMode = !!recordToEdit;
  const isCheckoutMode = mode === 'checkout';

  const [electricReading, setElectricReading] = useState('');
  const [waterReading, setWaterReading] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsingSpeech, setIsParsingSpeech] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [calculatedBill, setCalculatedBill] = useState(0);
  const [calculationError, setCalculationError] = useState('');
  const [calculatedElectricUsage, setCalculatedElectricUsage] = useState(0);
  const [calculatedWaterUsage, setCalculatedWaterUsage] = useState(0);
  const [finalRent, setFinalRent] = useState('');

  // OCR State
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrError, setOcrError] = useState('');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isBrowserSupported = !!SpeechRecognition;

  const { prevElectricReading, prevWaterReading } = useMemo(() => {
    if (isEditMode && recordToEdit) {
      const recordIndex = room.usageHistory.findIndex(r => r.id === recordToEdit.id);
      const prevRecord = recordIndex > 0 ? room.usageHistory[recordIndex - 1] : null;
      return {
        prevElectricReading: prevRecord ? prevRecord.electricReading : 0,
        prevWaterReading: prevRecord ? prevRecord.waterReading : 0,
      };
    } else { // Add mode or Checkout mode
      const lastRecord = room.usageHistory.length > 0 ? room.usageHistory[room.usageHistory.length - 1] : null;
      return {
        prevElectricReading: lastRecord ? lastRecord.electricReading : 0,
        prevWaterReading: lastRecord ? lastRecord.waterReading : 0,
      };
    }
  }, [room.usageHistory, isEditMode, recordToEdit]);

  const parseSpeechWithAI = async (transcript: string) => {
    setIsParsingSpeech(true);
    setSpeechError('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Phân tích câu sau đây và trích xuất chỉ số điện (electric) và nước (water). Câu: "${transcript}". Trả về một đối tượng JSON có dạng {"electric": number | null, "water": number | null}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              electric: { type: Type.NUMBER },
              water: { type: Type.NUMBER },
            },
          },
        },
      });
      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText);
      let found = false;
      if (result.electric !== null && !isNaN(result.electric)) {
        setElectricReading(result.electric.toString());
        found = true;
      }
      if (result.water !== null && !isNaN(result.water)) {
        setWaterReading(result.water.toString());
        found = true;
      }
      if (!found) {
        setSpeechError("AI không nhận dạng được số điện hoặc nước trong câu nói.");
      }
    } catch (e) {
      console.error("Lỗi phân tích giọng nói bằng AI:", e);
      setSpeechError("Đã xảy ra lỗi khi AI phân tích giọng nói.");
    } finally {
      setIsParsingSpeech(false);
    }
  };

  useEffect(() => {
    if (!isBrowserSupported) {
      setSpeechError("Trình duyệt không hỗ trợ nhận dạng giọng nói.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') setSpeechError('Không nhận được âm thanh. Vui lòng thử lại.');
      else if (event.error === 'not-allowed') setSpeechError('Quyền truy cập micro đã bị từ chối.');
      else setSpeechError(`Lỗi nhận dạng: ${event.error}`);
      setIsListening(false);
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) parseSpeechWithAI(transcript);
    };
  }, [isBrowserSupported]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSpeechError('');
      setCalculationError('');
      setIsParsingSpeech(false);
      if (recognitionRef.current && isListening) recognitionRef.current.abort();
      setIsListening(false);

       // Reset OCR state
      setOcrFile(null);
      setOcrPreview('');
      setIsScanning(false);
      setOcrError('');

      if (isEditMode && recordToEdit) {
        setElectricReading(String(recordToEdit.electricReading));
        setWaterReading(String(recordToEdit.waterReading));
        setStartDate(recordToEdit.startDate.split('T')[0]);
        setEndDate(recordToEdit.endDate.split('T')[0]);
        setBillAmount(String(recordToEdit.billAmount));
        setIsPaid(recordToEdit.isPaid);
      } else {
        const lastRecord = room.usageHistory.length > 0 ? room.usageHistory[room.usageHistory.length - 1] : null;
        setElectricReading('');
        setWaterReading('');
        setBillAmount('');
        setIsPaid(false);
        setEndDate(new Date().toISOString().split('T')[0]);
        if (lastRecord) {
          setStartDate(lastRecord.endDate.split('T')[0]);
        } else if (room.tenant) {
          setStartDate(room.tenant.moveInDate.split('T')[0]);
        } else {
          setStartDate('');
        }
        setCalculatedBill(room.baseRent);
        setCalculatedElectricUsage(0);
        setCalculatedWaterUsage(0);
      }
      if(isCheckoutMode) {
        setFinalRent(String(room.baseRent));
      }
    }
  }, [isOpen, room, recordToEdit, isEditMode, isCheckoutMode]);

  useEffect(() => {
    const electric = Number(electricReading);
    const water = Number(waterReading);

    const electricUsage = (electricReading !== '' && !isNaN(electric)) ? electric - prevElectricReading : 0;
    const waterUsage = (waterReading !== '' && !isNaN(water)) ? water - prevWaterReading : 0;

    setCalculatedElectricUsage(electricUsage);
    setCalculatedWaterUsage(waterUsage);

    // Perform validation.
    let errorMsg = '';
    if (electricReading !== '' && (isNaN(electric) || electric < 0)) {
      errorMsg = 'Chỉ số điện không hợp lệ.';
    } else if (waterReading !== '' && (isNaN(water) || water < 0)) {
      errorMsg = 'Chỉ số nước không hợp lệ.';
    } else if (electricUsage < 0 || waterUsage < 0) {
      errorMsg = 'Chỉ số mới không thể thấp hơn chỉ số cũ.';
    }
    setCalculationError(errorMsg);

    const rent = isCheckoutMode ? (Number(finalRent) || 0) : room.baseRent;
    const total = rent + (electricUsage * ELECTRIC_RATE) + (waterUsage * WATER_RATE);
    setCalculatedBill(total);
      
    if (isEditMode && !errorMsg) {
      setBillAmount(String(Math.max(0, total)));
    }

  }, [electricReading, waterReading, room.baseRent, isEditMode, prevElectricReading, prevWaterReading, isCheckoutMode, finalRent]);

  const handleListen = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isParsingSpeech) return;
    if (isListening) {
      recognition.stop();
      return;
    }
    setSpeechError('');
    setIsListening(true);
    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setSpeechError("Không thể bắt đầu ghi âm.");
      setIsListening(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setOcrFile(file);
        setOcrError('');
        const reader = new FileReader();
        reader.onloadend = () => {
            setOcrPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleScanImage = async () => {
    if (!ocrFile) return;

    setIsScanning(true);
    setOcrError('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const reader = new FileReader();
        reader.readAsDataURL(ocrFile);
        
        reader.onloadend = async () => {
            try {
                const base64Data = (reader.result as string).split(',')[1];
                
                const imagePart = {
                    inlineData: {
                        mimeType: ocrFile.type,
                        data: base64Data,
                    },
                };

                const textPart = {
                    text: `Từ hình ảnh ghi chú viết tay này, hãy trích xuất CHỈ SỐ MỚI của điện và nước. 
                           Chỉ số MỚI là con số đứng SAU dấu mũi tên "->".
                           - "điện" hoặc "dd" là điện.
                           - "nước" hoặc "nc" là nước.
                           Trả về một đối tượng JSON duy nhất.`,
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [imagePart, textPart] },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                electric: { type: Type.NUMBER, description: "Chỉ số điện mới" },
                                water: { type: Type.NUMBER, description: "Chỉ số nước mới" },
                            },
                        },
                    },
                });

                const jsonText = response.text.trim();
                const result = JSON.parse(jsonText);
                
                let foundAny = false;
                if (result.electric !== undefined && result.electric !== null && !isNaN(result.electric)) {
                    setElectricReading(String(result.electric));
                    foundAny = true;
                }
                if (result.water !== undefined && result.water !== null && !isNaN(result.water)) {
                    setWaterReading(String(result.water));
                    foundAny = true;
                }
                if (!foundAny) {
                    setOcrError("Không thể nhận dạng chỉ số điện hoặc nước từ ảnh.");
                }

            } catch(e) {
                 console.error("Lỗi khi quét OCR:", e);
                 setOcrError("Đã xảy ra lỗi khi phân tích ảnh. Vui lòng thử lại với ảnh rõ nét hơn.");
            } finally {
                setIsScanning(false);
            }
        };

        reader.onerror = () => {
            setOcrError("Không thể đọc file ảnh.");
            setIsScanning(false);
        };

    } catch (e) {
        console.error("Lỗi khởi tạo:", e);
        setOcrError("Đã xảy ra lỗi khi khởi tạo dịch vụ quét.");
        setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const electric = Number(electricReading);
    const water = Number(waterReading);
    const finalBillAmount = Number(billAmount);

    if (isNaN(electric) || isNaN(water) || electric < 0 || water < 0 || (isEditMode && (isNaN(finalBillAmount) || finalBillAmount < 0))) {
      setError('Chỉ số và tổng tiền phải là số dương.');
      return;
    }
    
    if (electric < prevElectricReading || water < prevWaterReading) {
        setError('Chỉ số mới không thể thấp hơn chỉ số kỳ trước.');
        return;
    }

    const recordIndex = isEditMode ? room.usageHistory.findIndex(r => r.id === recordToEdit!.id) : -1;
    const nextRecord = isEditMode && recordIndex < room.usageHistory.length - 1 
      ? room.usageHistory[recordIndex + 1] 
      : null;

    if (nextRecord && (electric > nextRecord.electricReading || water > nextRecord.waterReading)) {
        setError('Chỉ số mới không thể cao hơn chỉ số kỳ sau.');
        return;
    }

    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
        setError('Ngày bắt đầu không được sau ngày kết thúc.');
        return;
    }

    onSave({ 
        electricReading: electric, 
        waterReading: water, 
        startDate: new Date(startDate).toISOString(), 
        endDate: new Date(endDate).toISOString(),
        recordId: isEditMode ? recordToEdit!.id : undefined,
        billAmount: isEditMode ? finalBillAmount : undefined,
        isPaid: isEditMode ? isPaid : undefined,
        baseRent: isCheckoutMode ? Number(finalRent) : undefined,
    });
    onClose();
  };
  
  const getTitle = () => {
    if (isCheckoutMode) return `Trả phòng - ${room.name}`;
    if (isEditMode) return 'Chỉnh Sửa Hóa Đơn';
    return `Ghi Điện Nước - ${room.name}`;
  }

  const getSubmitButtonText = () => {
    if (isCheckoutMode) return 'Xác nhận & Trả phòng';
    if (isEditMode) return 'Lưu thay đổi';
    return 'Ghi nhận';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit}>
        <div className="max-h-[65vh] overflow-y-auto pr-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Từ ngày</label>
                  <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
              <div>
                  <label htmlFor="endDate" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Đến ngày</label>
                  <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
          </div>

          {!isEditMode && (
            <div className="space-y-2 border-y border-slate-200 dark:border-slate-600 py-4">
              <label className="block text-sm font-medium text-slate-900 dark:text-white">
                Quét chỉ số từ ảnh
              </label>
              <div className="flex items-center gap-4">
                <input type="file" id="ocr-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                <label htmlFor="ocr-upload" className="cursor-pointer flex-shrink-0">
                  {ocrPreview ? (
                    <img src={ocrPreview} alt="Preview" className="w-20 h-20 object-cover rounded-md border-2 border-slate-300 dark:border-slate-500" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-500">
                      <CameraIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </label>
                <div className="flex-1">
                  <button 
                    type="button" 
                    onClick={handleScanImage} 
                    disabled={!ocrFile || isScanning} 
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    {isScanning ? 'Đang phân tích...' : 'Quét ảnh & điền số'}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tải ảnh ghi chú điện, nước để AI điền tự động.</p>
                </div>
              </div>
              {ocrError && <p className="text-sm text-red-500">{ocrError}</p>}
            </div>
          )}
          
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Chỉ số điện (kWh)</label>
            <div className="flex items-center space-x-2">
              <div className="w-1/2">
                  <label htmlFor="oldElectricReading" className="block mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Chỉ số cũ</label>
                  <input 
                    type="number" 
                    id="oldElectricReading"
                    value={prevElectricReading} 
                    className="bg-slate-200 border border-slate-300 text-slate-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-600 dark:border-slate-500 dark:text-white cursor-not-allowed" 
                    disabled 
                  />
              </div>
              <div className="w-1/2">
                  <label htmlFor="electricReading" className="block mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Chỉ số mới</label>
                  <input 
                    type="number" 
                    id="electricReading" 
                    value={electricReading} 
                    onChange={(e) => setElectricReading(e.target.value)} 
                    className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" 
                    required 
                  />
              </div>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Chỉ số nước (m³)</label>
            <div className="flex items-center space-x-2">
              <div className="w-1/2">
                  <label htmlFor="oldWaterReading" className="block mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Chỉ số cũ</label>
                  <input 
                    type="number" 
                    id="oldWaterReading"
                    value={prevWaterReading} 
                    className="bg-slate-200 border border-slate-300 text-slate-900 text-sm rounded-lg block w-full p-2.5 dark:bg-slate-600 dark:border-slate-500 dark:text-white cursor-not-allowed" 
                    disabled 
                  />
              </div>
              <div className="w-1/2">
                  <label htmlFor="waterReading" className="block mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Chỉ số mới</label>
                  <input 
                    type="number" 
                    id="waterReading" 
                    value={waterReading} 
                    onChange={(e) => setWaterReading(e.target.value)} 
                    className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" 
                    required 
                  />
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-600 pt-4 mt-4 space-y-2">
              {isCheckoutMode ? (
                   <div className="flex justify-between items-center text-sm">
                      <label htmlFor="finalRent" className="text-slate-600 dark:text-slate-400">Tiền thuê phòng:</label>
                      <div className="flex items-center space-x-1">
                          <input 
                            type="number" 
                            id="finalRent" 
                            value={finalRent} 
                            onChange={(e) => setFinalRent(e.target.value)} 
                            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-32 p-1.5 text-right dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" 
                          />
                          <span className="font-medium text-slate-900 dark:text-white">VND</span>
                      </div>
                  </div>
              ) : (
                  <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Tiền thuê phòng:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{room.baseRent.toLocaleString('vi-VN')} VND</span>
                  </div>
              )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                      Tiền điện (sử dụng <span className={`font-semibold ${calculatedElectricUsage < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{calculatedElectricUsage.toLocaleString('vi-VN')}</span> kWh)
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                      {(calculatedElectricUsage >= 0 ? calculatedElectricUsage * ELECTRIC_RATE : 0).toLocaleString('vi-VN')} VND
                  </span>
              </div>
              <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                      Tiền nước (sử dụng <span className={`font-semibold ${calculatedWaterUsage < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{calculatedWaterUsage.toLocaleString('vi-VN')}</span> m³)
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                      {(calculatedWaterUsage >= 0 ? calculatedWaterUsage * WATER_RATE : 0).toLocaleString('vi-VN')} VND
                  </span>
              </div>
              {(!isEditMode || isCheckoutMode) && (
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-600">
                    <span className="text-slate-900 dark:text-white">Tổng cộng (dự tính):</span>
                    <span className={`transition-colors ${calculationError ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {(calculatedBill > 0 ? calculatedBill : 0).toLocaleString('vi-VN')} VND
                    </span>
                </div>
              )}
              {calculationError && (
                  <p className="text-sm text-red-500 text-right -mt-1">{calculationError}</p>
              )}
          </div>

          {isEditMode && (
            <>
              <div>
                <label htmlFor="billAmount" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Tổng Tiền (VND)</label>
                <input type="number" id="billAmount" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white" required />
              </div>
              <div className="flex items-center">
                <input id="isPaid" type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600" />
                <label htmlFor="isPaid" className="ms-2 text-sm font-medium text-slate-900 dark:text-slate-300">Đã thanh toán</label>
              </div>
            </>
          )}

          {!isEditMode && isBrowserSupported && (
              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-600">
                   <button type="button" onClick={handleListen} disabled={isParsingSpeech} className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors ${ isListening ? 'text-white bg-red-600 hover:bg-red-700 animate-pulse' : isParsingSpeech ? 'text-white bg-slate-500 cursor-not-allowed' : 'text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' }`}>
                      <MicrophoneIcon className="w-5 h-5 mr-2" />
                      {isListening ? 'Đang nghe...' : (isParsingSpeech ? 'Đang phân tích...' : 'Nói để nhập')}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nói "Điện [số], Nước [số]"</p>
              </div>
          )}
          
          {speechError && <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">{speechError}</p>}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
        
        <div className="flex justify-end pt-4 space-x-2 border-t border-slate-200 dark:border-slate-600 mt-4">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">{getSubmitButtonText()}</button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordUsageModal;