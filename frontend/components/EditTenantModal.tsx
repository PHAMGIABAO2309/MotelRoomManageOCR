import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Tenant } from '../types';
import { GoogleGenAI } from "@google/genai";
import { UploadIcon } from './icons';

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTenant: (tenant: Tenant) => void;
  tenant: Tenant;
}

const EditTenantModal: React.FC<EditTenantModalProps> = ({ isOpen, onClose, onEditTenant, tenant }) => {
  const [name, setName] = useState(tenant.name);
  const [phone, setPhone] = useState(tenant.phone);
  const [moveInDate, setMoveInDate] = useState(tenant.moveInDate.split('T')[0]);
  const [dateOfBirth, setDateOfBirth] = useState(tenant.dateOfBirth ? tenant.dateOfBirth.split('T')[0] : '');
  const [avatarUrl, setAvatarUrl] = useState(tenant.avatarUrl || '');
  const [idNumber, setIdNumber] = useState(tenant.idNumber || '');
  const [sex, setSex] = useState(tenant.sex || '');
  const [nationality, setNationality] = useState(tenant.nationality || '');
  const [placeOfOrigin, setPlaceOfOrigin] = useState(tenant.placeOfOrigin || '');
  const [placeOfResidence, setPlaceOfResidence] = useState(tenant.placeOfResidence || '');
  const [occupation, setOccupation] = useState(tenant.occupation || '');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(tenant.avatarUrl || '');


  useEffect(() => {
    if(isOpen) {
        setName(tenant.name);
        setPhone(tenant.phone);
        setMoveInDate(tenant.moveInDate.split('T')[0]);
        setDateOfBirth(tenant.dateOfBirth ? tenant.dateOfBirth.split('T')[0] : '');
        setAvatarUrl(tenant.avatarUrl || '');
        setIdNumber(tenant.idNumber || '');
        setSex(tenant.sex || '');
        setNationality(tenant.nationality || '');
        setPlaceOfOrigin(tenant.placeOfOrigin || '');
        setPlaceOfResidence(tenant.placeOfResidence || '');
        setOccupation(tenant.occupation || '');
        setPreviewUrl(tenant.avatarUrl || '');
        setError('');
        setOcrFile(null);
    }
  }, [isOpen, tenant]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOcrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        setPreviewUrl(resultUrl);
        setAvatarUrl(resultUrl); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOcr = async () => {
    if (!ocrFile) {
        setError("Vui lòng chọn một file ảnh CCCD.");
        return;
    }

    setIsProcessing(true);
    setError('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const reader = new FileReader();
        reader.readAsDataURL(ocrFile);
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            
            const imagePart = {
                inlineData: {
                    mimeType: ocrFile.type,
                    data: base64Data,
                },
            };

            const textPart = {
                text: `Phân tích hình ảnh Căn cước công dân Việt Nam này. Trích xuất các thông tin sau và trả về dưới dạng một đối tượng JSON duy nhất được bọc trong \`\`\`json ... \`\`\`:
- idNumber (Số CCCD)
- fullName (Họ và tên)
- dateOfBirth (Ngày sinh, định dạng YYYY-MM-DD)
- sex (Giới tính)
- nationality (Quốc tịch)
- placeOfOrigin (Quê quán)
- placeOfResidence (Nơi thường trú)
Nếu không tìm thấy thông tin nào, hãy để giá trị là một chuỗi rỗng.`,
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });

            // Fix: Access the .text property directly instead of calling it as a function.
            const textResponse = response.text;
            const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);

            if (jsonMatch && jsonMatch[1]) {
                const result = JSON.parse(jsonMatch[1]);
                if (result.fullName) setName(result.fullName);
                if (result.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(result.dateOfBirth)) {
                   setDateOfBirth(result.dateOfBirth);
                } else if (result.dateOfBirth) {
                    // Attempt to parse dd/mm/yyyy
                    const parts = result.dateOfBirth.split('/');
                    if (parts.length === 3) {
                        const [day, month, year] = parts;
                        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        if(!isNaN(new Date(formattedDate).getTime())){
                             setDateOfBirth(formattedDate);
                        }
                    }
                }
                if (result.idNumber) setIdNumber(result.idNumber);
                if (result.sex) setSex(result.sex);
                if (result.nationality) setNationality(result.nationality);
                if (result.placeOfOrigin) setPlaceOfOrigin(result.placeOfOrigin);
                if (result.placeOfResidence) setPlaceOfResidence(result.placeOfResidence);
            } else {
                throw new Error("Không thể tìm thấy dữ liệu JSON hợp lệ trong phản hồi của AI.");
            }

            setIsProcessing(false);
        };
        reader.onerror = () => {
             setError("Không thể đọc file ảnh.");
             setIsProcessing(false);
        }

    } catch (e) {
        console.error("Lỗi khi xử lý OCR:", e);
        setError("Không thể trích xuất thông tin. Vui lòng thử lại với ảnh rõ nét hơn.");
        setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !moveInDate) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    const updatedTenant: Tenant = {
      ...tenant,
      name,
      phone,
      moveInDate: new Date(moveInDate).toISOString(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
      avatarUrl,
      idNumber,
      sex,
      nationality,
      placeOfOrigin,
      placeOfResidence,
      occupation,
    };
    onEditTenant(updatedTenant);
    onClose();
  };

  const inputClass = "bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white";
  const labelClass = "block mb-2 text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh Sửa Thông Tin Người Thuê">
      <form onSubmit={handleSubmit}>
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <label className={labelClass}>Tải lên CCCD để điền tự động</label>
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                       {previewUrl ? (
                            <img src={previewUrl} alt="Avatar Preview" className="w-20 h-20 rounded-lg object-cover border-2 border-slate-300" />
                        ) : (
                            <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                <UploadIcon className="w-10 h-10 text-slate-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                         <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                         <label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-500 hover:underline">
                            {ocrFile ? `Đã chọn: ${ocrFile.name}` : 'Chọn ảnh CCCD...'}
                         </label>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ảnh này cũng sẽ được dùng làm ảnh đại diện.</p>
                         <button type="button" onClick={handleOcr} disabled={!ocrFile || isProcessing} className="mt-2 w-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg px-3 py-1.5 text-center disabled:bg-slate-400 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800">
                            {isProcessing ? 'Đang xử lý...' : 'Quét thông tin bằng AI'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tenantName" className={labelClass}>Họ và tên</label>
                  <input type="text" id="tenantName" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="idNumber" className={labelClass}>Số CCCD</label>
                  <input type="text" id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className={labelClass}>Ngày sinh</label>
                  <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
                </div>
                 <div>
                  <label htmlFor="sex" className={labelClass}>Giới tính</label>
                  <input type="text" id="sex" value={sex} onChange={(e) => setSex(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="nationality" className={labelClass}>Quốc tịch</label>
                  <input type="text" id="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} />
                </div>
                 <div>
                  <label htmlFor="occupation" className={labelClass}>Nghề nghiệp</label>
                  <input type="text" id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="tenantPhone" className={labelClass}>Số điện thoại</label>
                  <input type="tel" id="tenantPhone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="placeOfOrigin" className={labelClass}>Quê quán</label>
                    <textarea id="placeOfOrigin" value={placeOfOrigin} onChange={(e) => setPlaceOfOrigin(e.target.value)} rows={2} className={inputClass}></textarea>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="placeOfResidence" className={labelClass}>Nơi thường trú</label>
                    <textarea id="placeOfResidence" value={placeOfResidence} onChange={(e) => setPlaceOfResidence(e.target.value)} rows={2} className={inputClass}></textarea>
                </div>
                 <div className="md:col-span-2">
                  <label htmlFor="moveInDate" className={labelClass}>Ngày chuyển vào</label>
                  <input type="date" id="moveInDate" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className={inputClass} required />
                </div>
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
         <div className="flex justify-end pt-4 space-x-2 border-t border-slate-200 dark:border-slate-700 mt-4">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Lưu thay đổi</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTenantModal;