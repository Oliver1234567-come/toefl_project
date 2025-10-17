// toefl_frontend/src/components/AudioPlayer.tsx

import React from 'react';

interface AudioPlayerProps {
  audioBlob: Blob; // 实际音频数据
  label: string;
  isAISample?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ label, isAISample }) => {
  
  // 实际项目中，你需要使用 URL.createObjectURL(audioBlob) 创建 URL 
  // 并将其分配给 <audio> 标签的 src 属性
  
  return (
    <div className={`flex items-center p-3 rounded-lg border ${isAISample ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-100 border-gray-300'}`}>
      
      <span className={`flex-1 font-medium text-sm ${isAISample ? 'text-indigo-700' : 'text-gray-700'}`}>
        {label}
      </span>
      
      {/* 占位播放按钮 */}
      <button className={`p-2 rounded-full text-white transition ${isAISample ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-500 hover:bg-gray-600'}`}>
        播放
      </button>
    </div>
  );
};