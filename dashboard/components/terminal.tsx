interface TerminalProps {
    data: any;
  }
  
  export function Terminal({ data }: TerminalProps) {
    const redactSensitiveData = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => redactSensitiveData(item));
      }
      if (typeof obj === 'object' && obj !== null) {
        const newObj = { ...obj };
        for (const key in newObj) {
          if (key === 'email') {
            newObj[key] = '********@****.***';
          } else if (key === 'id') {
            newObj[key] = '**********************';
          } else {
            newObj[key] = redactSensitiveData(newObj[key]);
          }
        }
        return newObj;
      }
      return obj;
    };
  
    const redactedData = redactSensitiveData(data);
  
    return (
      <div className="h-full bg-black rounded-lg shadow-[0_0_15px_rgba(0,255,0,0.3)] overflow-hidden border border-green-500/30">
        {/* Terminal Header */}
        <div className="h-8 bg-black/50 backdrop-blur flex items-center px-4 gap-2 border-b border-green-500/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <div className="flex-1 flex justify-center relative">
            <span className="text-green-400 text-sm font-mono tracking-wider animate-pulse">
              DATA EXPLORER
            </span>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-scan"></div>
            </div>
          </div>
        </div>
  
        {/* Terminal Content */}
        <div className="relative p-4 font-mono text-sm overflow-auto h-[calc(100%-2rem)] matrix-scrollbar bg-[linear-gradient(rgba(0,0,0,0.9),rgba(0,0,0,0.9)),repeating-linear-gradient(0deg,rgba(0,255,0,0.1)_0px,rgba(0,255,0,0.1)_1px,transparent_1px,transparent_2px)]">
          <div className="relative z-10">
            <pre className="text-green-400 leading-relaxed matrix-text">
              <code className="block whitespace-pre-wrap break-all">
                {JSON.stringify(redactedData, null, 2)
                  .split('\n')
                  .map((line, i) => (
                    <div 
                      key={i} 
                      className="matrix-line"
                      style={{ 
                        animationDelay: `${i * 50}ms`,
                        opacity: 0
                      }}
                    >
                      {line}
                    </div>
                  ))}
              </code>
            </pre>
          </div>
          <div className="absolute inset-0 pointer-events-none matrix-overlay"></div>
        </div>
      </div>
    )
  }
  
  