import React, { useState, useRef, useMemo, useEffect } from 'react';

// 定义录音状态
type RecordingStatus = 'idle' | 'acquiring' | 'recording' | 'stopping' | 'stopped' | 'error';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null); // New state for playback URL
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // Cleanup effect to revoke the object URL when state changes or component unmounts
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]); // Dependency on URL ensures cleanup happens when URL is replaced

  // 1. 获取麦克风权限并初始化 MediaRecorder
  const startRecording = async () => {
    // Clear previous audio URL when starting a new recording
    if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
    }
    
    if (!('MediaRecorder' in window)) {
      console.error("当前浏览器不支持 MediaRecorder API。");
      console.error('您的浏览器不支持录音功能。');
      setStatus('error');
      return;
    }

    setStatus('acquiring');
    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 尝试使用 'audio/webm'，如果不支持，则使用浏览器默认
      const options = MediaRecorder.isTypeSupported('audio/webm') 
          ? { mimeType: 'audio/webm' } 
          : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // 监听数据事件，将音频数据块推入数组
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 监听停止事件，处理录音完成
      mediaRecorder.onstop = () => {
        const endTime = Date.now();
        const duration = (endTime - startTimeRef.current) / 1000; // 计算时长（秒）
        
        // 将所有音频数据块合并为一个 Blob 文件
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        
        // NEW: Create and store the audio URL for local playback
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url); 
        
        // 停止并清理媒体流
        stream.getTracks().forEach(track => track.stop());
        
        // 传递给父组件进行上传 - **添加函数存在性检查**
        if (typeof onRecordingComplete === 'function') {
          onRecordingComplete(audioBlob, duration);
        }
        
        setStatus('stopped');
      };
      
      // 开始录制
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setStatus('recording');
      
    } catch (err) {
      console.error("获取麦克风权限失败或录音初始化错误:", err);
      console.error('无法获取麦克风权限。请检查您的浏览器设置。');
      setStatus('idle');
    }
  };

  // 2. 停止录音
  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      setStatus('stopping');
      mediaRecorder.stop(); // 触发 onstop 事件
    }
  };

  // 3. 按钮点击处理
  const handleClick = () => {
    if (status === 'idle' || status === 'stopped' || status === 'error') {
      startRecording();
    } else if (status === 'recording') {
      stopRecording();
    }
    // acquiring 和 stopping 状态下禁用按钮
  };

  const buttonText = useMemo(() => {
    switch (status) {
      case 'idle':
      case 'stopped':
      case 'error':
        return '点击开始';
      case 'recording':
        return '点击停止';
      case 'acquiring':
        return '获取权限...';
      case 'stopping':
        return '处理中...';
      default:
        return '点击开始';
    }
  }, [status]);

  const isButtonDisabled = status === 'stopping' || status === 'acquiring';

  return (
    <div className="flex flex-col items-center p-8">
      <div 
        className="relative flex items-center justify-center w-36 h-36 bg-white rounded-full shadow-2xl transition duration-300"
        // 录音时增加脉冲动画效果
        style={{ 
          transform: status === 'recording' ? 'scale(1.1)' : 'scale(1)',
          boxShadow: status === 'recording' ? '0 0 0 10px rgba(239, 68, 68, 0.4)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <button 
          className="w-24 h-24 bg-red-500 rounded-full text-white text-lg font-bold shadow-xl hover:bg-red-600 transition disabled:bg-red-300 disabled:cursor-not-allowed"
          onClick={handleClick} 
          disabled={isButtonDisabled}
        >
          {buttonText}
        </button>
      </div>
      
      {/* 状态显示 */}
      <p className="mt-6 text-sm text-gray-600 font-medium">
        当前状态: <span className={`font-bold ${status === 'recording' ? 'text-red-500' : 'text-indigo-500'}`}>{buttonText}</span>
      </p>
      
      {/* NEW: 重听播放器，仅在停止录音且有 URL 时显示 */}
      {status === 'stopped' && recordedAudioUrl && (
        <div className="mt-4 w-full max-w-xs p-3 bg-indigo-50 rounded-lg shadow-inner">
          <p className="text-xs font-medium text-indigo-700 mb-2">✅ 录音已保存，请试听：</p>
          <audio controls src={recordedAudioUrl} className="w-full h-8">
            您的浏览器不支持音频回放。
          </audio>
        </div>
      )}
      {/* --------------------------- */}

      {(status === 'idle' || status === 'stopped') && (
        <p className="mt-2 text-xs text-gray-500">点击按钮并允许麦克风权限开始录音。</p>
      )}
      {status === 'recording' && (
        <p className="mt-2 text-xs text-red-500 animate-pulse">正在录制...</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-700 font-bold">录音遇到错误，请检查权限。</p>
      )}
    </div>
  );
};

export default VoiceRecorder;