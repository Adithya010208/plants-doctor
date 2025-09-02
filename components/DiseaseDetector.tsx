import React, { useState, useCallback, useRef, useEffect } from 'react';
import { detectPlantDisease, translateText } from '../services/geminiService';
import { DiseaseAnalysis } from '../types';
import { UploadCloudIcon, AlertTriangleIcon, CheckCircleIcon, WindIcon, DropletsIcon, TestTubeIcon, LeafIcon, CameraIcon, LanguagesIcon, Volume2Icon } from './Icons';

export const DiseaseDetector: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setAnalysis(null);
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectDisease = useCallback(async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await detectPlantDisease(imageFile);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Plant Disease Detector</h2>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">Upload or snap a photo of a plant leaf for an AI-powered diagnosis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <label htmlFor="file-upload" className="w-full h-72 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300 bg-gray-50 dark:bg-gray-700 overflow-hidden">
                {imagePreview ? (
                    <img src={imagePreview} alt="Plant preview" className="w-full h-full object-cover"/>
                ) : (
                    <div className="text-center">
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-600 dark:text-gray-300">Click to upload an image</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP</span>
                    </div>
                )}
            </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0] || null)} />
            
            <div className="w-full flex gap-4 mt-4">
                 <button onClick={() => setIsCameraOpen(true)} className="flex-1 border-2 border-primary-600 text-primary-600 font-bold py-3 px-4 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/50 flex items-center justify-center gap-2 transition-colors">
                     <CameraIcon className="w-5 h-5"/> Use Camera
                 </button>
                 <button
                    onClick={handleDetectDisease}
                    disabled={!imageFile || isLoading}
                    className="flex-1 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center transition-colors shadow-lg"
                 >
                    {isLoading ? "Analyzing..." : "Detect Disease"}
                 </button>
            </div>
        </div>
        
        <div className="space-y-4">
            {error && <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md" role="alert"><p>{error}</p></div>}
            
            {!isLoading && !analysis && !error && (
                 <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full flex flex-col justify-center items-center">
                    <LeafIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">Analysis results will appear here</h3>
                </div>
            )}
             {analysis && <AnalysisReport analysis={analysis} />}
        </div>
      </div>
      {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={handleImageChange} />}
    </div>
  );
};


const AnalysisReport: React.FC<{analysis: DiseaseAnalysis}> = ({ analysis }) => {
    const fullReportText = `Disease: ${analysis.disease_name}. Description: ${analysis.description}. Causes: ${analysis.causes.join(', ')}. Organic Treatments: ${analysis.treatment_recommendations.organic.join(', ')}. Chemical Treatments: ${analysis.treatment_recommendations.chemical.join(', ')}.`;
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg space-y-4">
            <div className={`p-4 rounded-lg flex items-center text-white ${analysis.is_healthy ? 'bg-green-500' : 'bg-yellow-600'}`}>
                {analysis.is_healthy ? <CheckCircleIcon className="h-8 w-8 mr-4"/> : <AlertTriangleIcon className="h-8 w-8 mr-4"/>}
                <div>
                  <h3 className="text-2xl font-bold">{analysis.disease_name}</h3>
                  <p className="text-sm opacity-90">{analysis.is_healthy ? "Your plant appears healthy!" : "A potential issue was detected."}</p>
                </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">Description</h4>
                <p className="text-gray-600 dark:text-gray-300">{analysis.description}</p>
            </div>
            
            {!analysis.is_healthy && (
                <>
                  <ResultCard title="Potential Causes" items={analysis.causes} icon={WindIcon} />
                  <ResultCard title="Organic Treatments" items={analysis.treatment_recommendations.organic} icon={DropletsIcon} />
                  <ResultCard title="Chemical Treatments" items={analysis.treatment_recommendations.chemical} icon={TestTubeIcon} />
                </>
            )}
            <TranslatorBlock textToTranslate={fullReportText} />
        </div>
    );
};

const ResultCard: React.FC<{ title: string; items: string[]; icon: React.FC<{className: string;}> }> = ({ title, items, icon: Icon }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <h4 className="font-semibold text-lg mb-2 flex items-center text-primary-700 dark:text-primary-300">
            <Icon className="h-5 w-5 mr-2" /> {title}
        </h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

const languages = [ { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'hi', name: 'Hindi' }, { code: 'ta', name: 'Tamil' }, { code: 'bn', name: 'Bengali' }, { code: 'pt', name: 'Portuguese' }, { code: 'ar', name: 'Arabic' }, { code: 'sw', name: 'Swahili' } ];

const TranslatorBlock: React.FC<{textToTranslate: string}> = ({ textToTranslate }) => {
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = useCallback(async () => {
    setIsLoading(true);
    const result = await translateText(textToTranslate, languages.find(l => l.code === targetLanguage)?.name || 'English');
    setTranslatedText(result);
    setIsLoading(false);
  }, [textToTranslate, targetLanguage]);

  const handleSpeak = () => {
    if (translatedText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = targetLanguage;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <h3 className="text-lg font-bold mb-3">Translate Report</h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
             <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 appearance-none">
                {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
             <button onClick={handleTranslate} disabled={isLoading} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400">
                {isLoading ? 'Translating...' : 'Translate'}
             </button>
        </div>
        {translatedText && (
            <div className="relative p-3 rounded-md bg-gray-100 dark:bg-gray-700">
                <p>{translatedText}</p>
                <button onClick={handleSpeak} className="absolute top-2 right-2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600">
                    <Volume2Icon className="w-4 h-4" />
                </button>
            </div>
        )}
    </div>
  );
};

const CameraModal: React.FC<{onClose: () => void; onCapture: (file: File) => void;}> = ({ onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                onClose();
            }
        };
        startCamera();
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [onClose]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob((blob) => {
                if(blob) {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    onCapture(file);
                    onClose();
                }
            }, 'image/jpeg');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-30 p-4">
            <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[70vh] rounded-lg"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="flex gap-4 mt-6">
                <button onClick={handleCapture} className="bg-primary-600 text-white font-bold py-3 px-6 rounded-full hover:bg-primary-700 text-lg">Capture Photo</button>
                <button onClick={onClose} className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-lg">Cancel</button>
            </div>
        </div>
    );
};