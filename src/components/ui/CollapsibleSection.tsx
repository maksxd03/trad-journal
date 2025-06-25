import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  );

  // Medindo altura do conteúdo quando ele for visível
  useEffect(() => {
    if (!contentRef.current) return;
    
    if (isOpen) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    } else {
      setContentHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left transition-colors hover:text-purple-600 dark:hover:text-purple-400 rounded-md px-2 -mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-700/30"
      >
        <span className={`text-sm font-medium ${isOpen ? 'text-purple-700 dark:text-purple-400' : ''}`}>
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className={`h-4 w-4 ${isOpen ? 'text-purple-600 dark:text-purple-400' : 'opacity-70'}`} />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-70" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out`}
        style={{ 
          maxHeight: contentHeight !== undefined ? `${contentHeight}px` : 'auto',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div 
          ref={contentRef} 
          className="pt-4"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection; 