'use client';

import { useEffect, useState } from 'react';

interface DancingCharacter {
  id: number;
  x: number;
  y: number;
  character: string;
  direction: 'left' | 'right';
}

interface DancingMarioProps {
  characterUrls: {
    [key: string]: string; // Map of character names to their SVG URLs
  };
}

export function DancingMario({ characterUrls }: DancingMarioProps) {
  const [characters, setCharacters] = useState<DancingCharacter[]>([]);

  useEffect(() => {
    const spawnCharacter = () => {
      const id = Date.now();
      const characterKeys = Object.keys(characterUrls);
      const character =
        characterKeys[Math.floor(Math.random() * characterKeys.length)];
      const direction = Math.random() > 0.5 ? 'left' : 'right';
      const y = Math.random() * (window.innerHeight - 100); 

      const newCharacter: DancingCharacter = {
        id,
        x: direction === 'left' ? window.innerWidth : -50,
        y,
        character,
        direction,
      };

      console.log('New Character:', newCharacter);

      setCharacters((prev) => [...prev, newCharacter]);

      // Remove character after animation
      setTimeout(() => {
        setCharacters((prev) => prev.filter((c) => c.id !== id));
      }, 10000); // Duration matches animation (10 seconds)
    };

    // Spawn a new character every 6-12 seconds
    const interval = setInterval(() => {
      if (characters.length < 3) {
        spawnCharacter();
      }
    }, Math.random() * 6000 + 6000);

    return () => clearInterval(interval);
  }, [characters.length, characterUrls]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {characters.map((char) => (
        <div
          key={char.id}
          className="absolute w-12 h-12"
          style={{
            top: `${char.y}px`,
            left: `${char.x}px`,
            transform: char.direction === 'left' ? 'scaleX(-1)' : 'none',
            animation: `${
              char.direction === 'left' ? 'move-left' : 'move-right'
            } 10s linear`,
          }}
        >
          <img
            src={characterUrls[char.character]}
            alt={`${char.character} dancing`}
            className="w-full h-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}
