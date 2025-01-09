import React, { useState } from "react";
import TerminalUI, { TerminalOutput, ColorMode } from "react-terminal-ui";
import "../src/styles/terminal.css";

interface TerminalProps {
  data: any;
}

export function CustomTerminal({ data }: TerminalProps) {
  const redactSensitiveData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => redactSensitiveData(item));
    }
    if (typeof obj === "object" && obj !== null) {
      const newObj = { ...obj };
      for (const key in newObj) {
        if (key === "email") {
          newObj[key] = "********@****.***";
        } else if (key === "id") {
          newObj[key] = "**********************";
        } else if (key === "phone") {
            newObj[key] = "************";
        } else {
          newObj[key] = redactSensitiveData(newObj[key]);
        }
      }
      return newObj;
    }
    return obj;
  };

  const redactedData = redactSensitiveData(data);
  const [terminalLines, setTerminalLines] = useState([
    <TerminalOutput>
      <span style={{ color: "#00FF00" }}>Explore the Game State</span>
    </TerminalOutput>
  ]);

  const handleInput = (input: string) => {
    setTerminalLines(prevLines => [
      ...prevLines,
      <TerminalOutput>{`> ${input}`}</TerminalOutput>,
      <TerminalOutput>{`Command not recognized: "${input}"`}</TerminalOutput>
    ]);
  };

  return (
    <div className="matrix-terminal">
      {/* Terminal Header */}
      <div className="matrix-header">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div className="flex-1 flex justify-center relative">
          <span className="text-green-400 text-sm font-mono tracking-wider animate-pulse">
            JSON DATA EXPLORER
          </span>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-scan"></div>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="matrix-content matrix-scrollbar">
        <TerminalUI
          name=""
          colorMode={ColorMode.Dark}
          onInput={handleInput}
          prompt=">"
          height="100%"
          style={{
            width: '100%', 
            whiteSpace: 'pre-wrap', 
            overflowWrap: 'break-word', 
          }}
        >
          {terminalLines}
          <TerminalOutput>
            <pre>
              <code>
                {JSON.stringify(redactedData, null, 2)}
              </code>
            </pre>
          </TerminalOutput>
        </TerminalUI>
      </div>
    </div>
  );
}
