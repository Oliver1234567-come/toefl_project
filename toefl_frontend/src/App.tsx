import React, { useState, useMemo } from 'react';
// The import path is now resolved because the component file exists.
import VoiceRecorder from './components/VoiceRecorder'; 
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
// The import path is now resolved because the utilities file exists.
import { uploadAudioToStorage } from './utils/firebaseUtils'; 

// --- Mock/Placeholder Components ---

// Component to display the score and feedback
const ScoreDisplay = ({ score, feedback, duration }: { score: number, feedback: string, duration: number }) => {
    // Use mock score if actual score is null
    const displayScore = score || Math.floor(Math.random() * (30 - 18 + 1)) + 18; 
    const displayFeedback = feedback || "系统已完成模拟评分，请点击回放听取录音。"; // System completed mock scoring, click replay to listen to the recording.

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-indigo-600">得分: {displayScore} / 30</h2>
            <p className="text-sm text-gray-500">录音时长: {duration.toFixed(1)} 秒</p>
            <p className="text-gray-700 mt-2 border-t pt-4">{displayFeedback}</p>
        </div>
    );
};

// AudioPlayer component for playback
const AudioPlayer = ({ audioBlob, label, isAISample = false }: { audioBlob: Blob, label: string, isAISample?: boolean }) => {
    // Revoke the previous URL when component unmounts or audioBlob changes to prevent memory leaks
    const audioUrl = useMemo(() => {
        if (audioBlob) {
            return URL.createObjectURL(audioBlob);
        }
        return '';
    }, [audioBlob]);
    
    // Cleanup old URL when component unmounts
    React.useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <p className={`text-sm font-semibold ${isAISample ? 'text-indigo-600' : 'text-gray-800'}`}>{label}</p>
            {audioUrl ? (
                <audio controls src={audioUrl} className="w-full h-10">
                    Your browser does not support the audio element.
                </audio>
            ) : (
                <p className="text-sm text-red-500">无法加载音频文件。</p>
            )}
        </div>
    );
};

// Reusable Button component with Tailwind styling
const Button = ({ children, onClick, className = '', size = 'md', variant = 'default', disabled = false }: any) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition duration-150';
    let sizeStyle = 'px-4 py-2 text-sm';

    if (size === 'lg') {
        sizeStyle = 'px-6 py-3 text-base';
    } else if (size === 'sm') {
        sizeStyle = 'px-3 py-1.5 text-sm';
    }
    
    let colorStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300'; 
    if (className.includes('bg-indigo')) {
        colorStyle = 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md'; 
    } else if (variant === 'ghost') {
        colorStyle = 'bg-transparent text-gray-700 hover:bg-gray-100';
    }

    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseStyle} ${sizeStyle} ${colorStyle} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
};

// --- App Logic ---

type AppState = 'welcome' | 'idle' | 'uploading' | 'result'; 

/**
 * TODO: Replace with actual OpenAI API call
 * @param audioBlob The recorded audio Blob
 * @returns The transcribed text
 */
const transcribeAudioWithOpenAI = async (audioBlob: Blob): Promise<string> => {
    // ==========================================================
    // *** TODO: Replace this with your actual OpenAI API call logic ***
    //
    // This is a mock function, simulating an API call delay.
    // ==========================================================
    
    // Mock Delay and return text
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const mockTranscription = "Well, I think the most important thing to consider when looking for a new job is the company culture, as it greatly impacts daily work life.";
    
    return mockTranscription;
};

export default function App() {
    const [state, setState] = useState<AppState>('welcome');
    const [userAudio, setUserAudio] = useState<Blob | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [aiSampleAudio, setAiSampleAudio] = useState<Blob | null>(null);
    const [scoreResult, setScoreResult] = useState<{score: number, feedback: string} | null>(null); 
    
    // Store transcribed text
    const [transcribedText, setTranscribedText] = useState<string>(''); 
    
    // Function to handle recording completion
    const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
        setUserAudio(audioBlob);
        setRecordingDuration(duration);
        setState('uploading'); 
        
        try {
            // --- 1. Speech Recognition (STT) ---
            const text = await transcribeAudioWithOpenAI(audioBlob);
            setTranscribedText(text);
            console.log("Speech recognition result (语音识别结果):", text);
            
            // --- 2. Mock Upload and Scoring ---
            
            // Example of how to use Firebase upload (currently commented out to prevent immediate errors if setup is incomplete)
            // Note: uploadAudioToStorage handles its own auth setup.
            // const audioURL = await uploadAudioToStorage(audioBlob, 'mock_user_id'); 
            
            // Simulate backend scoring process based on transcription
            const mockScore = Math.floor(Math.random() * (25 - 18 + 1)) + 18; 
            setScoreResult({
                score: mockScore,
                feedback: `您的模拟分数为 ${mockScore} 分。您的口语表达清晰，但在流畅度和词汇多样性方面还有提升空间。`, // Your mock score is X. Your spoken expression is clear, but there is room for improvement in fluency and vocabulary diversity.
            });
            
            // Simulate generating AI example
            setTimeout(() => {
                // Temporarily use user audio as AI sample (since we don't have TTS)
                setAiSampleAudio(audioBlob); 
            }, 500); 
            
            setState('result'); 

        } catch (error) {
            console.error("Error processing recording:", error);
            console.error('音频或语音识别处理失败，请检查控制台。'); // Audio or speech recognition processing failed, check console.
            // If upload/processing fails, revert to idle
            setState('idle'); 
        }
    };

    const handleReset = () => {
        setState('idle');
        setUserAudio(null);
        setAiSampleAudio(null);
        setRecordingDuration(0);
        setScoreResult(null); 
        setTranscribedText(''); // Reset transcription
    };

    const handleStart = () => {
        setState('idle');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-safe relative">
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-16">
                
                {/* Header */}
                <header className="p-4 pt-safe">
                    <div className="flex items-center justify-between">
                        {state !== 'idle' && state !== 'welcome' && (
                            <Button
                                onClick={handleReset}
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-gray-700"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                返回
                            </Button>
                        )}
                        {state !== 'welcome' && (
                            <div className="ml-auto flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500" /> 
                                <h1 className="text-lg font-semibold text-gray-800">AI 语音评测</h1> {/* AI Voice Evaluation */}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 px-4 pb-8">
                    <AnimatePresence mode="wait">
                        {state === 'welcome' && (
                            // Welcome Page
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center pt-20"
                            >
                                <motion.div
                                    className="text-center space-y-4"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h1 className="text-4xl tracking-wide font-bold text-gray-900">TOEFL AI SAMPLE</h1>
                                    </motion.div>

                                    <motion.p
                                        className="text-gray-500"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        用你的声音，成为更好的自己 {/* Use your voice, be a better self */}
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    className="mt-24"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <Button
                                        onClick={handleStart}
                                        size="lg"
                                        className="bg-indigo-500 text-white shadow-lg"
                                    >
                                        开始测试 {/* Start Test */}
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {state === 'idle' && (
                            // Idle Page
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full flex flex-col justify-center pt-16"
                            >
                                <div className="text-center mb-12">
                                    <h2 className="text-2xl font-semibold mb-3">欢迎使用 AI 语音评测</h2> {/* Welcome to AI Voice Evaluation */}
                                    <p className="text-gray-500"> 
                                        录制你的声音，获取即时评分、文本和 AI 示例 {/* Record your voice, get instant score, text, and AI sample */}
                                    </p>
                                </div>
                                
                                <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                                
                                <div className="mt-12 space-y-3 text-center">
                                    <p className="text-gray-500">评分维度包括：</p> {/* Scoring dimensions include: */}
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['发音准确度', '流畅度', '语调', '内容'].map((item) => (
                                            <span
                                                key={item}
                                                className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full" 
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {state === 'uploading' && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-16"
                            >
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <h2 className="text-xl font-semibold text-gray-800">正在处理您的录音...</h2> {/* Processing your recording... */}
                                <p className="text-gray-500">
                                    语音识别和 AI 评分中，请稍候。 {/* Speech recognition and AI scoring in progress, please wait. */}
                                </p>
                            </motion.div>
                        )}


                        {state === 'result' && scoreResult && (
                            // Result Page
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6 py-6"
                            >
                                {/* Score Display */}
                                <ScoreDisplay 
                                    score={scoreResult.score} 
                                    feedback={scoreResult.feedback}
                                    duration={recordingDuration} 
                                />
                                
                                {/* Transcription Text Display */}
                                {transcribedText && (
                                    <div className="p-4 bg-white rounded-xl shadow-lg space-y-2">
                                        <h3 className="text-base font-semibold text-gray-800 border-b pb-1">识别文本 (STT)</h3> {/* Recognized Text */}
                                        <p className="text-gray-700 text-sm italic leading-relaxed">
                                            {transcribedText}
                                        </p>
                                    </div>
                                )}

                                {/* Audio Players */}
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-semibold text-gray-800">录音回放</h3> {/* Audio Playback */}
                                    
                                    {/* User Audio */}
                                    {userAudio && (
                                        <AudioPlayer audioBlob={userAudio} label="你的录音" /> 
                                    )}
                                    
                                    {/* AI Sample Audio (Placeholder) */}
                                    {aiSampleAudio ? (
                                        <AudioPlayer
                                            audioBlob={aiSampleAudio}
                                            label="AI 优化示例" // AI Optimized Sample
                                            isAISample
                                        />
                                    ) : (
                                        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                            <div className="flex items-center justify-center gap-2 text-gray-600"> 
                                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                <span>AI 正在生成优化示例...</span> {/* AI is generating optimized sample... */}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Reset Button */}
                                <div className="pt-4 flex justify-center">
                                    <Button
                                        onClick={handleReset}
                                        size="lg"
                                        className="bg-indigo-500 text-white shadow-lg"
                                    >
                                        再测一次 {/* Test Again */}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}