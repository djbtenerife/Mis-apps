/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, RotateCcw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    return {
      hr: hours.toString().padStart(2, '0'),
      min: minutes.toString().padStart(2, '0'),
      sec: seconds.toString().padStart(2, '0'),
    };
  };

  const startStop = () => {
    if (isRunning) {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
    } else {
      setIsRunning(true);
      startTimeRef.current = performance.now() - time;
      
      const step = () => {
        setTime(performance.now() - startTimeRef.current);
        timerRef.current = requestAnimationFrame(step);
      };
      
      timerRef.current = requestAnimationFrame(step);
    }
  };

  const reset = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setTime(0);
  };

  const copyToClipboard = async () => {
    const { hr, min, sec } = formatTime(time);
    const timeString = `${hr}:${min}:${sec}`;
    try {
      await navigator.clipboard.writeText(timeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  const { hr, min, sec } = formatTime(time);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans selection:bg-black selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 flex flex-col items-center gap-12 border border-black/5"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/30">Stopwatch</span>
          <div className="h-1 w-8 bg-black/5 rounded-full" />
        </div>

        {/* Time Display */}
        <div className="flex items-baseline gap-1 tabular-nums">
          <motion.span 
            key={`hr-${hr}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-7xl font-light tracking-tighter text-black"
          >
            {hr}
          </motion.span>
          <span className="text-5xl font-light text-black/20 mb-2">:</span>
          <motion.span 
            key={`min-${min}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-7xl font-light tracking-tighter text-black"
          >
            {min}
          </motion.span>
          <span className="text-5xl font-light text-black/20 mb-2">:</span>
          <motion.span 
            key={`sec-${sec}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-7xl font-light tracking-tighter text-black"
          >
            {sec}
          </motion.span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          {/* Reset Button */}
          <button
            onClick={reset}
            className="group p-4 rounded-full bg-black/5 hover:bg-black/10 transition-all duration-300 active:scale-95"
            aria-label="Reset"
          >
            <RotateCcw size={20} className="text-black/60 group-hover:text-black transition-colors" />
          </button>

          {/* Start/Stop Button */}
          <button
            onClick={startStop}
            className={`
              relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 active:scale-90
              ${isRunning ? 'bg-black shadow-[0_10px_20px_rgba(0,0,0,0.2)]' : 'bg-white border-2 border-black/10 hover:border-black/20'}
            `}
            aria-label={isRunning ? 'Stop' : 'Start'}
          >
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div
                  key="stop"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                >
                  <Square size={28} fill="white" className="text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  className="ml-1"
                >
                  <Play size={28} fill="black" className="text-black" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="group p-4 rounded-full bg-black/5 hover:bg-black/10 transition-all duration-300 active:scale-95 relative"
            aria-label="Copy to clipboard"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check size={20} className="text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy size={20} className="text-black/60 group-hover:text-black transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-[10px] font-medium tracking-widest uppercase text-black/20">
          Precision 1s
        </div>
      </motion.div>
    </div>
  );
}
