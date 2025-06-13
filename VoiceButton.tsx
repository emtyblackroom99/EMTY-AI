import React from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { VoiceState } from '../types';

interface VoiceButtonProps {
  voiceState: VoiceState;
  onToggleListening: () => void;
  hasRecognitionSupport: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  voiceState,
  onToggleListening,
  hasRecognitionSupport,
}) => {
  const { isListening, isProcessing, isSpeaking } = voiceState;

  if (!hasRecognitionSupport) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4 mx-auto">
          <MicOff size={32} className="text-gray-400" />
        </div>
        <p className="text-red-400 text-sm">Tarayıcınız ses tanımayı desteklemiyor</p>
      </div>
    );
  }

  const getButtonContent = () => {
    if (isProcessing) {
      return <Loader2 size={32} className="text-blue-400 animate-spin" />;
    }
    if (isSpeaking) {
      return <Volume2 size={32} className="text-purple-400 animate-pulse" />;
    }
    if (isListening) {
      return <Mic size={32} className="text-green-400" />;
    }
    return <Mic size={32} className="text-gray-300" />;
  };

  const getButtonStyle = () => {
    if (isProcessing) {
      return 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/50 shadow-blue-400/20';
    }
    if (isSpeaking) {
      return 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/50 shadow-purple-400/20';
    }
    if (isListening) {
      return 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/50 shadow-green-400/20 animate-pulse';
    }
    return 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30 hover:border-green-400/50 hover:shadow-green-400/20';
  };

  const getStatusText = () => {
    if (isProcessing) return 'Düşünüyor...';
    if (isSpeaking) return 'Konuşuyor...';
    if (isListening) return 'Dinliyor...';
    return 'Konuşmak için tıkla';
  };

  return (
    <div className="text-center">
      <button
        onClick={onToggleListening}
        disabled={isProcessing || isSpeaking}
        className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-4 mx-auto transition-all duration-300 backdrop-blur-sm ${getButtonStyle()} shadow-2xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {getButtonContent()}
      </button>
      
      <p className={`text-sm font-medium transition-colors duration-300 ${
        isListening ? 'text-green-400' : 
        isProcessing ? 'text-blue-400' : 
        isSpeaking ? 'text-purple-400' : 
        'text-gray-400'
      }`}>
        {getStatusText()}
      </p>
      
      {voiceState.error && (
        <p className="text-red-400 text-xs mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          Hata: {voiceState.error}
        </p>
      )}
    </div>
  );
};