import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trade } from '../types/trade';
import { useChallenges } from '../context/ChallengesContext';
import { useAccounts } from '../context/AccountsContext';

// Cria um cache para armazenar os trades entre navegações
// Mas não entre recargas da página
let tradesCache: Trade[] = [];

// Flag para identificar se é a primeira carga da página
let isFirstLoad = true;

// Nome do bucket para armazenar screenshots
// IMPORTANTE: Este nome deve corresponder EXATAMENTE ao nome do bucket criado no Supabase
const STORAGE_BUCKET = 'trade_screenshots';

// Função para validar uma URL
const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Função para garantir que a URL seja completa
const ensureFullURL = (url: string): string => {
  if (!url) return '';
  
  // Se a URL já é válida, retorna-a
  if (isValidURL(url)) return url;
  
  // Se começa com '/', assume que é um caminho relativo
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  
  // Tenta adicionar o protocolo se estiver faltando
  if (!url.startsWith('http') && !url.startsWith('//')) {
    return `https://${url}`;
  }
  
  return url;
};

export const useTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recalculateChallengeStatus } = useChallenges();
  const { recalculateAccountStatus } = useAccounts();

  const fetchTrades = useCallback(async (forceRefresh = false) => {
    if (!user) return [];

    // Se temos dados em cache, não é a primeira carga e não é forçada a atualização, use o cache
    if (tradesCache.length > 0 && !isFirstLoad && !forceRefresh) {
      setTrades(tradesCache);
      setLoading(false);
      return tradesCache;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching trades from database...');
      
      // Modificado para não incluir account_id diretamente na query
      // Isso evita o erro caso a coluna ainda não exista
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Verificar se a coluna screenshot_url existe
      let hasScreenshotUrlColumn = true;
      try {
        // Tentamos verificar se algum dos itens tem a propriedade screenshot_url
        hasScreenshotUrlColumn = data && data.length > 0 && 'screenshot_url' in data[0];
        console.log(`✅ A coluna screenshot_url ${hasScreenshotUrlColumn ? 'existe' : 'não existe'} na tabela trades`);
      } catch (err) {
        console.warn('⚠️ Não foi possível determinar se a coluna screenshot_url existe:', err);
        hasScreenshotUrlColumn = false;
      }
      
      // Verificar se a coluna account_id existe
      let hasAccountIdColumn = true;
      try {
        // Tentamos verificar se algum dos itens tem a propriedade account_id
        hasAccountIdColumn = data && data.length > 0 && 'account_id' in data[0];
        console.log(`✅ A coluna account_id ${hasAccountIdColumn ? 'existe' : 'não existe'} na tabela trades`);
      } catch (err) {
        console.warn('⚠️ Não foi possível determinar se a coluna account_id existe:', err);
        hasAccountIdColumn = false;
      }

      // Log para debug
      console.log('📊 Dados brutos do banco:', data);
      console.log('✨ Trades com screenshots:');
      data.forEach(trade => {
        if (trade.screenshot_url) {
          console.log(`- Trade ${trade.id} (${trade.symbol}): ${trade.screenshot_url}`);
        }
      });

      // Verificar o bucket para uploads futuros
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket(STORAGE_BUCKET);
        
        if (bucketError) {
          console.warn(`⚠️ Bucket de screenshots pode não existir ou você não tem permissão para verificá-lo: ${bucketError.message}`);
        } else {
          console.log('✅ Bucket encontrado:', bucketData);
        }
      } catch (err) {
        console.warn('⚠️ Erro ao verificar bucket:', err);
      }

      // Formatar os trades para uso na aplicação
      const formattedTrades: Trade[] = data.map(trade => {
        // Verificar e processar a URL do screenshot
        let screenshotUrl = trade.screenshot_url || undefined;
        
        if (screenshotUrl) {
          // Garantir que a URL seja completa e válida
          screenshotUrl = ensureFullURL(screenshotUrl);
          
          console.log(`📷 Trade ${trade.id} (${trade.symbol}) - Screenshot URL:`, screenshotUrl);
          
          // Teste adicional para validar a URL
          if (isValidURL(screenshotUrl)) {
            console.log(`✅ URL do screenshot para trade ${trade.id} é válida`);
          } else {
            console.warn(`⚠️ URL do screenshot para trade ${trade.id} pode ser inválida: ${screenshotUrl}`);
          }
        } else {
          console.log(`ℹ️ Trade ${trade.id} (${trade.symbol}) não possui screenshot_url`);
        }
        
        return {
          id: trade.id,
          date: trade.date,
          symbol: trade.symbol,
          type: trade.type,
          entryPrice: trade.entry_price,
          exitPrice: trade.exit_price,
          quantity: trade.quantity,
          pnl: trade.pnl,
          pnlPercentage: trade.pnl_percentage,
          setup: trade.setup,
          notes: trade.notes || '',
          tags: trade.tags || [],
          duration: trade.duration,
          commission: trade.commission,
          riskRewardRatio: trade.risk_reward_ratio,
          challengeId: trade.challenge_id,
          accountId: hasAccountIdColumn ? trade.account_id : undefined,
          screenshotUrl: screenshotUrl
        };
      });

      // Resumo dos trades com screenshots
      console.log('📊 Resumo dos trades:');
      console.log(`- Total de trades: ${formattedTrades.length}`);
      console.log(`- Trades com screenshots: ${formattedTrades.filter(t => t.screenshotUrl).length}`);
      
      // Lista detalhada dos trades com screenshots
      console.log('🖼️ Detalhes dos trades com screenshots:');
      formattedTrades
        .filter(trade => trade.screenshotUrl)
        .forEach(trade => {
          console.log(`- Trade ${trade.id}: ${trade.symbol} | URL: ${trade.screenshotUrl}`);
        });

      // Atualiza o cache e o estado
      tradesCache = formattedTrades;
      setTrades(formattedTrades);
      console.log(`✅ Carregados ${formattedTrades.length} trades`);
      
      // Marca que não é mais a primeira carga
      isFirstLoad = false;
      
      return formattedTrades;
    } catch (err) {
      console.error('❌ Error fetching trades:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadScreenshot = async (file: File, tradeId: string): Promise<string | null> => {
    if (!file) {
      console.log('No screenshot file provided');
      return null;
    }
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return null;
    }
    
    try {
      console.log(`🔄 Uploading screenshot for trade ${tradeId}...`);
      console.log(`📁 File details: name=${file.name}, size=${file.size}, type=${file.type}`);
      
      // Generate a unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/${tradeId}_${timestamp}.${fileExt}`;
      
      console.log(`🔄 Fazendo upload do arquivo para ${STORAGE_BUCKET}/${fileName}`);
      
      // Upload the file to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Usar upsert para substituir arquivos existentes
        });
      
      if (uploadError) {
        console.error('❌ Error uploading screenshot:', uploadError);
        
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          alert(`Erro: O bucket '${STORAGE_BUCKET}' não existe no Supabase. Verifique o nome do bucket.`);
          console.error(`❌ Bucket '${STORAGE_BUCKET}' não encontrado.`);
        } else if (uploadError.message.includes('permission') || uploadError.code === 'PGRST116') {
          alert(`Erro: Você não tem permissão para fazer upload de arquivos no bucket '${STORAGE_BUCKET}'.`);
          console.error('⚠️ Erro de permissão ao fazer upload.');
        } else {
          alert(`Erro ao fazer upload: ${uploadError.message}`);
          console.error('⚠️ Erro ao fazer upload:', uploadError);
        }
        
        return null;
      }
      
      console.log('✅ Screenshot uploaded successfully:', uploadData?.path);
      
      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('❌ Não foi possível obter a URL pública do screenshot');
        return null;
      }
      
      const publicUrl = publicUrlData.publicUrl;
      console.log('📷 Screenshot public URL:', publicUrl);
      
      // Validar a URL
      if (isValidURL(publicUrl)) {
        console.log('✅ URL gerada é válida:', publicUrl);
      } else {
        console.error('❌ URL gerada é inválida:', publicUrl);
      }
      
      return publicUrl;
    } catch (err) {
      console.error('❌ Error in uploadScreenshot:', err);
      alert(`Erro durante o upload: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      return null;
    }
  };

  // Função para verificar se a coluna screenshot_url existe na tabela trades
  const checkScreenshotUrlColumn = async (): Promise<boolean> => {
    try {
      // Tentativa de consulta que inclui screenshot_url
      const { error } = await supabase
        .from('trades')
        .select('screenshot_url')
        .limit(1);
      
      // Se não houver erro, a coluna existe
      if (!error) {
        console.log('✅ Coluna screenshot_url existe na tabela trades');
        return true;
      }
      
      // Se o erro for sobre a coluna não existir
      if (error && error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.warn('⚠️ Coluna screenshot_url não existe na tabela trades. Execute o script de migração.');
        alert('A coluna screenshot_url não existe na tabela trades. Por favor, execute o script de migração no SQL Editor do Supabase.');
        return false;
      }
      
      // Outros erros
      console.error('❌ Erro ao verificar coluna screenshot_url:', error);
      return false;
    } catch (err) {
      console.error('❌ Erro ao verificar coluna screenshot_url:', err);
      return false;
    }
  };

  const addTrade = async (tradeData: Omit<Trade, 'id'>) => {
    if (!user) return;

    try {
      console.log('🔄 Adding new trade to database...');
      console.log('📊 Trade data:', tradeData);
      
      // Extract the screenshot file from tradeData and remove it from the object
      const { screenshot, ...tradeDataWithoutScreenshot } = tradeData as any;
      let screenshotUrl = null;

      // Create the trade record first to get an ID
      const insertData = {
        user_id: user.id,
        date: tradeDataWithoutScreenshot.date,
        symbol: tradeDataWithoutScreenshot.symbol,
        type: tradeDataWithoutScreenshot.type,
        entry_price: tradeDataWithoutScreenshot.entryPrice,
        exit_price: tradeDataWithoutScreenshot.exitPrice,
        quantity: tradeDataWithoutScreenshot.quantity,
        pnl: tradeDataWithoutScreenshot.pnl,
        pnl_percentage: tradeDataWithoutScreenshot.pnlPercentage,
        setup: tradeDataWithoutScreenshot.setup,
        notes: tradeDataWithoutScreenshot.notes,
        tags: tradeDataWithoutScreenshot.tags,
        duration: tradeDataWithoutScreenshot.duration,
        commission: tradeDataWithoutScreenshot.commission,
        risk_reward_ratio: tradeDataWithoutScreenshot.riskRewardRatio,
      };
      
      // Adiciona challenge_id se não for uma string vazia
      if (tradeDataWithoutScreenshot.challengeId) {
        insertData.challenge_id = tradeDataWithoutScreenshot.challengeId;
      }
      
      // Adiciona account_id se não for uma string vazia
      if (tradeDataWithoutScreenshot.accountId) {
        insertData.account_id = tradeDataWithoutScreenshot.accountId;
      }
      
      let data;
      let error;
      
      try {
        // Tenta inserir o trade com todos os dados
        const result = await supabase
          .from('trades')
          .insert(insertData)
          .select()
          .single();
          
        data = result.data;
        error = result.error;
      } catch (insertError) {
        console.warn('⚠️ Erro na primeira tentativa de inserção:', insertError);
        
        // Se o erro for relacionado ao challenge_id, tenta novamente sem ele
        if (insertError.message && insertError.message.includes('trades_challenge_id_fkey')) {
          console.log('⚠️ Erro de chave estrangeira detectado. Verifique se a tabela challenges existe e se o ID é válido.');
          console.log('🔄 Tentando novamente sem o challenge_id...');
          delete insertData.challenge_id;
          
          const retryResult = await supabase
            .from('trades')
            .insert(insertData)
            .select()
            .single();
            
          data = retryResult.data;
          error = retryResult.error;
        } else {
          // Se for outro erro, repassa
          throw insertError;
        }
      }

      if (error) {
        console.error('❌ Error inserting trade:', error);
        throw error;
      }
      
      console.log('✅ Trade record created:', data);
      
      // If there's a screenshot, upload it and update the trade record with the URL
      if (screenshot) {
        console.log('🔄 Uploading screenshot...');
        screenshotUrl = await uploadScreenshot(screenshot, data.id);
        
        if (screenshotUrl) {
          console.log('🔄 Updating trade with screenshot URL:', screenshotUrl);
          
          // Verificar se a coluna screenshot_url existe antes de tentar atualizar
          const columnExists = await checkScreenshotUrlColumn();
          
          if (columnExists) {
            // Modificação aqui: Usar o ID correto do trade para atualização
            const { data: updateData, error: updateError } = await supabase
              .from('trades')
              .update({ screenshot_url: screenshotUrl })
              .eq('id', data.id)
              .eq('user_id', user.id) // Adicionar filtro por user_id para garantir segurança
              .select()
              .single();
              
            if (updateError) {
              console.error('❌ Error updating trade with screenshot URL:', updateError);
              // Não lançar erro, apenas logar e continuar
              console.warn('⚠️ O trade foi criado, mas não foi possível atualizar com a URL do screenshot.');
            } else {
              console.log('✅ Trade updated with screenshot URL, resultado:', updateData);
              // Usar os dados atualizados que retornam do banco
              if (updateData && updateData.screenshot_url) {
                screenshotUrl = updateData.screenshot_url;
                console.log('✅ URL do screenshot confirmada no banco:', screenshotUrl);
              }
            }
          } else {
            console.warn('⚠️ Não foi possível atualizar o trade com a URL do screenshot porque a coluna não existe.');
          }
        } else {
          console.warn('⚠️ Não foi possível fazer upload do screenshot. O trade foi salvo sem imagem.');
        }
      }

      // Create a new trade object with the ID and screenshot URL
      const newTrade = {
        id: data.id,
        date: data.date,
        symbol: data.symbol,
        type: data.type,
        entryPrice: data.entry_price,
        exitPrice: data.exit_price,
        quantity: data.quantity,
        pnl: data.pnl,
        pnlPercentage: data.pnl_percentage,
        setup: data.setup,
        notes: data.notes || '',
        tags: data.tags || [],
        duration: data.duration,
        commission: data.commission,
        riskRewardRatio: data.risk_reward_ratio,
        challengeId: data.challenge_id,
        accountId: data.account_id,
        screenshotUrl: screenshotUrl || undefined
      };

      // Update the local state and cache immediately
      const updatedTrades = [newTrade, ...trades];
      setTrades(updatedTrades);
      tradesCache = updatedTrades;
      
      console.log(`✅ Trade added successfully: ${newTrade.symbol}`);
      console.log('📊 Final trade object:', newTrade);
      
      // After successful operation, fetch all trades to ensure data consistency
      // This ensures we have the latest data from the server
      fetchTrades(true).catch(console.error);

      // If there's a challenge ID, recalculate its status
      if (tradeDataWithoutScreenshot.challengeId) {
        console.log(`🔄 Hook: Trade associado ao desafio ${tradeDataWithoutScreenshot.challengeId}, atualizando status...`);
        recalculateChallengeStatus(tradeDataWithoutScreenshot.challengeId, updatedTrades);
      }

      // If there's an account ID, recalculate its status
      if (tradeDataWithoutScreenshot.accountId) {
        console.log(`🔄 Hook: Trade associado à conta ${tradeDataWithoutScreenshot.accountId}, atualizando status...`);
        recalculateAccountStatus(tradeDataWithoutScreenshot.accountId, updatedTrades);
      }

      // Return the newly created trade
      return newTrade;
    } catch (err) {
      console.error('❌ Error adding trade:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add trade');
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (!user) return;

    try {
      console.log(`🔄 Updating trade ${id}...`);
      console.log('📊 Update data:', updates);
      
      // Extract the screenshot file from updates if it exists
      const { screenshot, ...updatesWithoutScreenshot } = updates as any;
      let screenshotUrl = updates.screenshotUrl;

      // If there's a new screenshot file, upload it
      if (screenshot) {
        console.log('🔄 Uploading new screenshot for update...');
        screenshotUrl = await uploadScreenshot(screenshot, id);
        
        if (!screenshotUrl) {
          console.warn('⚠️ Não foi possível fazer upload do novo screenshot. Mantendo a URL anterior.');
        }
      }

      // Prepare database fields for update
      const updateFields: any = {};
      
      // Adicionar apenas campos que existem no objeto de atualizações
      if (updatesWithoutScreenshot.date) updateFields.date = updatesWithoutScreenshot.date;
      if (updatesWithoutScreenshot.symbol) updateFields.symbol = updatesWithoutScreenshot.symbol;
      if (updatesWithoutScreenshot.type) updateFields.type = updatesWithoutScreenshot.type;
      if (updatesWithoutScreenshot.entryPrice !== undefined) updateFields.entry_price = updatesWithoutScreenshot.entryPrice;
      if (updatesWithoutScreenshot.exitPrice !== undefined) updateFields.exit_price = updatesWithoutScreenshot.exitPrice;
      if (updatesWithoutScreenshot.quantity !== undefined) updateFields.quantity = updatesWithoutScreenshot.quantity;
      if (updatesWithoutScreenshot.pnl !== undefined) updateFields.pnl = updatesWithoutScreenshot.pnl;
      if (updatesWithoutScreenshot.pnlPercentage !== undefined) updateFields.pnl_percentage = updatesWithoutScreenshot.pnlPercentage;
      if (updatesWithoutScreenshot.setup) updateFields.setup = updatesWithoutScreenshot.setup;
      if (updatesWithoutScreenshot.notes !== undefined) updateFields.notes = updatesWithoutScreenshot.notes;
      if (updatesWithoutScreenshot.tags) updateFields.tags = updatesWithoutScreenshot.tags;
      if (updatesWithoutScreenshot.duration) updateFields.duration = updatesWithoutScreenshot.duration;
      if (updatesWithoutScreenshot.commission !== undefined) updateFields.commission = updatesWithoutScreenshot.commission;
      if (updatesWithoutScreenshot.riskRewardRatio !== undefined) updateFields.risk_reward_ratio = updatesWithoutScreenshot.riskRewardRatio;
      if (updatesWithoutScreenshot.challengeId) updateFields.challenge_id = updatesWithoutScreenshot.challengeId;
      if (updatesWithoutScreenshot.accountId) updateFields.account_id = updatesWithoutScreenshot.accountId;
      
      // Sempre adicionar a data de atualização
      updateFields.updated_at = new Date().toISOString();
      
      // Verificar se a coluna screenshot_url existe antes de tentar atualizar
      const columnExists = await checkScreenshotUrlColumn();
      
      // Adicionar screenshot_url apenas se a coluna existir e houver uma URL
      if (columnExists && screenshotUrl) {
        updateFields.screenshot_url = screenshotUrl;
      }
      
      console.log('📊 Final update fields:', updateFields);

      // Update the trade record
      const { data, error } = await supabase
        .from('trades')
        .update(updateFields)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating trade in database:', error);
        throw error;
      }
      
      console.log('✅ Trade updated in database:', data);

      // Create updated trade object
      const updatedTrade = {
        id: data.id,
        date: data.date,
        symbol: data.symbol,
        type: data.type,
        entryPrice: data.entry_price,
        exitPrice: data.exit_price,
        quantity: data.quantity,
        pnl: data.pnl,
        pnlPercentage: data.pnl_percentage,
        setup: data.setup,
        notes: data.notes || '',
        tags: data.tags || [],
        duration: data.duration,
        commission: data.commission,
        riskRewardRatio: data.risk_reward_ratio,
        challengeId: data.challenge_id,
        accountId: data.account_id,
        screenshotUrl: (columnExists ? data.screenshot_url : undefined) || undefined
      };

      // Update local state and cache immediately
      const updatedTrades = trades.map(trade => trade.id === id ? updatedTrade : trade);
      setTrades(updatedTrades);
      tradesCache = updatedTrades;
      
      console.log(`✅ Trade updated successfully: ${updatedTrade.symbol}`);
      console.log('📊 Final updated trade object:', updatedTrade);
      
      // After successful operation, fetch all trades to ensure data consistency
      fetchTrades(true).catch(console.error);

      const originalTrade = trades.find(t => t.id === id);
      const challengeIds = new Set<string>();
      const accountIds = new Set<string>();
      
      if (originalTrade?.challengeId) challengeIds.add(originalTrade.challengeId);
      if (updatedTrade.challengeId) challengeIds.add(updatedTrade.challengeId);
      
      if (originalTrade?.accountId) accountIds.add(originalTrade.accountId);
      if (updatedTrade.accountId) accountIds.add(updatedTrade.accountId);
      
      challengeIds.forEach(challengeId => {
        console.log(`🔄 Hook: Atualizando status do desafio ${challengeId} após edição de trade...`);
        recalculateChallengeStatus(challengeId, updatedTrades);
      });
      
      accountIds.forEach(accountId => {
        console.log(`🔄 Hook: Atualizando status da conta ${accountId} após edição de trade...`);
        recalculateAccountStatus(accountId, updatedTrades);
      });

      // Return the updated trade
      return updatedTrade;
    } catch (err) {
      console.error('❌ Error updating trade:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update trade');
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;

    try {
      console.log(`🔄 Deleting trade ${id}...`);
      
      const tradeToDelete = trades.find(t => t.id === id);
      const challengeId = tradeToDelete?.challengeId;
      const accountId = tradeToDelete?.accountId;
      
      // Se houver um screenshot, tente excluí-lo primeiro
      if (tradeToDelete?.screenshotUrl) {
        const fileName = tradeToDelete.screenshotUrl.split('/').pop();
        if (fileName) {
          console.log(`🔄 Attempting to delete screenshot: ${fileName}`);
          try {
            const { error: deleteStorageError } = await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([`${user.id}/${fileName}`]);
              
            if (deleteStorageError) {
              console.warn('⚠️ Could not delete screenshot file:', deleteStorageError);
            }
          } catch (storageErr) {
            console.warn('⚠️ Error deleting screenshot:', storageErr);
          }
        }
      }
      
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error deleting trade from database:', error);
        throw error;
      }

      // Update local state and cache immediately
      const updatedTrades = trades.filter(trade => trade.id !== id);
      setTrades(updatedTrades);
      tradesCache = updatedTrades;
      
      console.log(`✅ Trade deleted successfully`);
      
      // After successful operation, fetch all trades to ensure data consistency
      fetchTrades(true).catch(console.error);
      
      if (challengeId) {
        console.log(`🔄 Hook: Recalculando status do desafio ${challengeId} após exclusão de trade...`);
        recalculateChallengeStatus(challengeId, updatedTrades);
      }
      
      if (accountId) {
        console.log(`🔄 Hook: Recalculando status da conta ${accountId} após exclusão de trade...`);
        recalculateAccountStatus(accountId, updatedTrades);
      }
    } catch (err) {
      console.error('❌ Error deleting trade:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete trade');
    }
  };

  // Verificar a coluna screenshot_url quando o componente é montado
  useEffect(() => {
    if (user) {
      checkScreenshotUrlColumn().catch(console.error);
      
      // Executar query para verificar existência de screenshots
      const checkExistingScreenshots = async () => {
        try {
          const { data, error } = await supabase
            .from('trades')
            .select('id, symbol, screenshot_url')
            .eq('user_id', user.id)
            .not('screenshot_url', 'is', null);
            
          if (error) {
            console.error('❌ Erro ao verificar screenshots existentes:', error);
            return;
          }
          
          if (data && data.length > 0) {
            console.log(`✅ Encontrados ${data.length} trades com screenshots:`);
            data.forEach(trade => {
              console.log(`- Trade ${trade.id} (${trade.symbol}): ${trade.screenshot_url}`);
            });
          } else {
            console.log('ℹ️ Nenhum trade encontrado com screenshot');
          }
        } catch (err) {
          console.error('❌ Erro ao verificar screenshots existentes:', err);
        }
      };
      
      checkExistingScreenshots();
    }
  }, [user]);

  useEffect(() => {
    // Sempre forçar a atualização na primeira carga da página
    fetchTrades(true);
  }, [user, fetchTrades]);

  return {
    trades,
    loading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    refetch: () => fetchTrades(true)
  };
};