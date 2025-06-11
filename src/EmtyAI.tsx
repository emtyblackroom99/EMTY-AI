import React, { useState, useEffect, useRef } from 'react';
import { Bot, Settings } from 'lucide-react';
import { Message, VoiceState } from '../types';
import { MessageBubble } from './MessageBubble';
import { VoiceButton } from './VoiceButton';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { OpenAIService } from '../services/openai';

export const EmtyAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    error: null,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openAIServiceRef = useRef<OpenAIService | null>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error: speechError,
  } = useSpeechRecognition();

  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();

  // Initialize API key from environment or localStorage
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const savedApiKey = localStorage.getItem('openai_api_key');
    const key = envApiKey || savedApiKey || '';
    
    setApiKey(key);
    if (key) {
      openAIServiceRef.current = new OpenAIService(key);
    }
  }, []);

  // Update voice state
  useEffect(() => {
    setVoiceState(prev => ({
      ...prev,
      isListening,
      isSpeaking,
      error: speechError,
    }));
  }, [isListening, isSpeaking, speechError]);

  // Handle new transcript
  useEffect(() => {
    if (transcript && !voiceState.isProcessing) {
      handleUserMessage(transcript);
    }
  }, [transcript]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setVoiceState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      if (!openAIServiceRef.current) {
        throw new Error('API anahtarı yapılandırılmamış');
      }

      const aiResponse = await openAIServiceRef.current.getResponse(userInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      speak(aiResponse);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setVoiceState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      openAIServiceRef.current = new OpenAIService(apiKey.trim());
      setShowSettings(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-green-400 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-400/20">
              <Bot size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              EMTY AI
            </h1>
          </div>
          <p className="text-gray-400 text-sm font-mono">Sesli AI Asistan</p>
          
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-6 right-6 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-green-400/50 transition-colors"
          >
            <Settings size={20} className="text-gray-400 hover:text-green-400" />
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Ayarlar</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  OpenAI API Anahtarı
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-green-400 font-mono text-sm focus:outline-none focus:border-green-400/50"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
              <button
                onClick={clearMessages}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Konuşmaları Temizle
              </button>
            </div>
          </div>
        )}

        {/* Voice Control */}
        <div className="mb-8">
          <VoiceButton
            voiceState={voiceState}
            onToggleListening={handleToggleListening}
            hasRecognitionSupport={hasRecognitionSupport}
          />
        </div>

        {/* Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400/20 scrollbar-track-transparent pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500 font-mono">
                Merhaba! Konuşmaya başlamak için mikrofon butonuna tıkla.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-600 font-mono">
          <p>EMTY AI • Sesli Yapay Zeka Asistanı</p>
          <p className="mt-1">Türkçe Dil Desteği • OpenAI GPT-4</p>
        </div>
      </div>
    </div>
  );
};