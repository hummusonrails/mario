'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CountdownProps {
    onComplete: () => void
    startFrom: number
}

export function Countdown({ onComplete, startFrom }: CountdownProps) {
    const [count, setCount] = useState(startFrom)

    useEffect(() => {
        if (count <= 0) {
                onComplete();
                return;
        }
    
        const timer = setTimeout(() => {
            setCount((prev) => prev - 1);
        }, 1000);
    
        return () => clearTimeout(timer);
    }, [count, onComplete]);  

    return (
        <AnimatePresence mode="sync">
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[20000] pointer-events-none">
                <motion.div
                        key={`count-${count}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="countdown pointer-events-none font-extrabold text-black leading-none font-[Bungee Shade] flex items-center justify-center w-full h-full z-[20001] "
                >
                    {count}
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
