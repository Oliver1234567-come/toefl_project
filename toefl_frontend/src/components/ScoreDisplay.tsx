// toefl_frontend/src/components/ScoreDisplay.tsx

import React from 'react';

interface ScoreDisplayProps {
  score: number;
  feedback: string;
  duration: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, feedback, duration }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500 text-center space-y-4">
      <p className="text-sm text-gray-500">录音时长: {duration.toFixed(1)} 秒</p>
      <div className="text-6xl font-extrabold text-indigo-600">
        {score} / 30
      </div>
      <h2 className="text-xl font-semibold text-gray-800">评分反馈</h2>
      <p className="text-base text-gray-600 leading-relaxed">
        {feedback}
      </p>
    </div>
  );
};