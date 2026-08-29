import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useAIAnalyst } from '../../context/AIAnalystContext';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const JarvisOrb: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [visionMode, setVisionMode] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const { location } = useLocation();
  const { currentState } = useFortyGuard();
  const { openAIWithContext } = useAIAnalyst();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          handleVoiceCommand(transcript);
        }
      };
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch(e) {}
    }
  };

  const synthesizeSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      // Try to find a good voice
      const preferred = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.name.includes('Google US English'));
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setIsThinking(true);
    try {
      const payload: any = {
        prompt: command,
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
        locationName: location?.address || 'Current Location',
      };

      // Mocking image capture if vision mode is enabled
      if (visionMode) {
        payload.imageUrl = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80';
        payload.prompt = `[SATELLITE/VISION SCENE] ${command}`;
      }

      const res = await fetch('/api/environmental/ai/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data && data.success) {
        const textToSpeak = data.data.structuredOutput?.summary || data.data.headline || 'Analysis complete.';
        setResponse(textToSpeak);
        synthesizeSpeech(textToSpeak);
        // Also open the text UI so they can read it
        openAIWithContext({ question: command, sourceModule: 'Jarvis Voice' });
      } else {
        synthesizeSpeech("I'm sorry, I couldn't process that request at this time.");
      }
    } catch (e) {
      console.error(e);
      synthesizeSpeech("There was an error communicating with the main server.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end pointer-events-none">
      
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-4 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl max-w-sm shadow-2xl border border-slate-700/50 pointer-events-auto"
          >
            {transcript && (
              <div className="text-sm text-slate-300 mb-2 italic">
                "{transcript}"
              </div>
            )}
            {response && (
              <div className="text-sm font-medium leading-relaxed">
                {response}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setVisionMode(!visionMode)}
          className={`p-3 rounded-full shadow-lg transition-all ${visionMode ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          title="Toggle Satellite Vision Analysis"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          onClick={toggleListening}
          className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all ${
            isListening ? 'bg-rose-500 scale-110' : 
            isThinking ? 'bg-indigo-500' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full animate-ping bg-rose-400 opacity-40"></span>
          )}
          {isThinking && (
             <span className="absolute inset-0 rounded-full animate-pulse bg-indigo-400 opacity-40"></span>
          )}
          
          <div className="text-white">
            {isThinking ? (
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            ) : isListening ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
