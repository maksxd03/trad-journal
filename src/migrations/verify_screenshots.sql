-- Script para verificar screenshots nos trades
-- Execute este script no SQL Editor do Supabase para diagnosticar

-- Verifica se a coluna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'trades' AND column_name = 'screenshot_url';

-- Lista todos os trades que possuem screenshot_url não nulo
SELECT id, symbol, date, screenshot_url 
FROM trades 
WHERE screenshot_url IS NOT NULL;

-- Lista a quantidade de trades com e sem screenshot
SELECT 
  COUNT(*) as total_trades,
  COUNT(CASE WHEN screenshot_url IS NOT NULL THEN 1 END) as with_screenshot,
  COUNT(CASE WHEN screenshot_url IS NULL THEN 1 END) as without_screenshot
FROM trades; 