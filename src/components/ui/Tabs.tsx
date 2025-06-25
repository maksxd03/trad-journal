import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultTab, 
  onChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <div className={`flex justify-center mb-8 ${className}`}>
      <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs; 