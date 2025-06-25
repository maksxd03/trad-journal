-- Script para adicionar a coluna screenshot_url à tabela trades
-- Execute este script no SQL Editor do Supabase

-- Adiciona a coluna screenshot_url se ela não existir
ALTER TABLE trades ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- Comentário: Esta coluna armazenará as URLs das capturas de tela dos trades
-- As URLs serão geradas pelo Supabase Storage após o upload dos arquivos

-- Create a storage bucket for trade screenshots if it doesn't exist
-- Note: This part needs to be executed via the Supabase dashboard or using the Supabase JS client
-- as SQL doesn't have direct control over storage buckets 