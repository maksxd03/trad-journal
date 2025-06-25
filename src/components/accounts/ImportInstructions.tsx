import React, { useState, useEffect } from 'react';
import { getBrokerConfig } from '../../lib/importInstructions';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ImportInstructionsProps {
  broker: string;
}

const ImportInstructions: React.FC<ImportInstructionsProps> = ({ broker }) => {
  const [instructions, setInstructions] = useState<string>('');
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  
  // Atualiza as instruções quando a corretora muda
  useEffect(() => {
    if (!broker) {
      setInstructions('');
      setFileTypes([]);
      return;
    }
    
    const brokerConfig = getBrokerConfig(broker);
    if (brokerConfig) {
      setInstructions(brokerConfig.instructions);
      setFileTypes(brokerConfig.fileTypes);
    } else {
      setInstructions('');
      setFileTypes([]);
    }
  }, [broker]);
  
  // Se não houver corretora selecionada, não exibe nada
  if (!broker) {
    return null;
  }
  
  // Se não houver instruções, exibe uma mensagem genérica
  if (!instructions) {
    return (
      <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-warning-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
              Instruções não disponíveis
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Não há instruções específicas para esta corretora. Por favor, exporte o histórico de trades 
              no formato CSV, XLS, XLSX ou HTML e certifique-se de que ele contenha todas as informações 
              necessárias sobre seus trades.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
      <div className="flex items-start">
        <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-primary-900 dark:text-primary-300">
            Como exportar seu histórico de trades
          </h3>
          
          <div className="prose prose-sm dark:prose-invert prose-headings:text-primary-700 dark:prose-headings:text-primary-300 prose-p:text-neutral-600 dark:prose-p:text-neutral-400 mt-2">
            <ReactMarkdown>
              {instructions}
            </ReactMarkdown>
          </div>
          
          {fileTypes.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Formatos suportados: {fileTypes.map(type => type.toUpperCase()).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportInstructions; 