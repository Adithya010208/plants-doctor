import React, { useState, useRef, useEffect } from 'react';
import { getCommunityChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { SendIcon, UserIcon, SparklesIcon, MicIcon, MicOffIcon } from './Icons';
import { Chat } from '@google/genai';


// Fix: Add types for the Web Speech API to the global Window interface
// to resolve TypeScript errors.
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Check for SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

export const Community: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial', role: 'model', text: 'Welcome to the AI Chatbot! I am Plants Doctor. Ask me anything about farming.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    chatRef.current = getCommunityChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if(chatRef.current) {
        const response = await chatRef.current.sendMessage({ message: input });
        const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">AI Chatbot</h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">Ask questions and get instant advice from our AI expert, Plants Doctor.</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            )}
            <div className={`max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
             {msg.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-800 dark:text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="max-w-md p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type or speak your question..."}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50 dark:bg-gray-700"
            disabled={isLoading || isListening}
          />
          {recognition && (
             <button
                type="button"
                onClick={toggleListen}
                className={`p-3 rounded-lg transition-colors shadow-md ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
             >
                {isListening ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
             </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center transition-colors shadow-md"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};