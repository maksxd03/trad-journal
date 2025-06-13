import React, { useState, ChangeEvent, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  Paper,
  Divider,
  Grid,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import { Upload, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import { getSupportedBrokers, getDateFormats } from '../../lib/importInstructions';

interface FormData {
  name: string;
  type: string;
  broker: string;
  dateFormat: string;
  targetBalance?: number;
  maxDrawdown?: number;
  startDate?: string;
  endDate?: string;
  file: File | null;
}

const accountTypes = [
  { value: 'live', label: 'Conta Real' },
  { value: 'demo', label: 'Conta Demo' },
  { value: 'prop', label: 'Desafio de Prop Firm' },
];

const ImportAccountForm: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAccount } = useAccounts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'live',
    broker: '',
    dateFormat: 'MM/DD/YYYY',
    file: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: unknown };
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpa o erro do campo quando o usuário faz uma alteração
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
    
    // Emite evento de mudança de broker para atualizar as instruções
    if (name === 'broker') {
      // Cria um evento customizado para notificar a mudança de broker
      const event = new CustomEvent('brokerChange', {
        detail: { broker: value }
      });
      window.dispatchEvent(event);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    
    if (file) {
      setFormData({
        ...formData,
        file,
      });
      
      if (formErrors.file) {
        setFormErrors({
          ...formErrors,
          file: '',
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome da conta é obrigatório';
    }
    
    if (!formData.broker) {
      errors.broker = 'Selecione uma corretora';
    }
    
    if (!formData.file) {
      errors.file = 'Selecione um arquivo para importar';
    } else {
      const fileExt = formData.file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xls', 'xlsx', 'html'].includes(fileExt || '')) {
        errors.file = 'Formato de arquivo não suportado. Use CSV, XLS, XLSX ou HTML';
      }
    }
    
    if (formData.type === 'prop') {
      if (!formData.targetBalance) {
        errors.targetBalance = 'Meta de lucro é obrigatória para contas de desafio';
      }
      
      if (!formData.maxDrawdown) {
        errors.maxDrawdown = 'Drawdown máximo é obrigatório para contas de desafio';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Aqui seria onde processaríamos o arquivo e extrairíamos os trades
      // Por enquanto, vamos apenas criar a conta sem os trades
      const accountData = {
        name: formData.name,
        type: formData.type,
        broker: formData.broker,
        balance: 0, // O saldo seria calculado com base nos trades importados
        currency: 'USD', // Isso poderia ser determinado a partir do arquivo ou ser um campo adicional
        dateFormat: formData.dateFormat,
        // Adiciona os campos específicos para contas de desafio
        ...(formData.type === 'prop' && {
          targetBalance: formData.targetBalance,
          maxDrawdown: formData.maxDrawdown,
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      };
      
      // Adicionar a conta no Supabase
      await addAccount(accountData);
      
      // Navegar para a página de contas após sucesso
      navigate('/accounts');
    } catch (err) {
      console.error('Erro ao importar conta:', err);
      setError('Ocorreu um erro ao processar o arquivo. Verifique o formato e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const brokers = getSupportedBrokers();
  const dateFormats = getDateFormats();

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box mb={3} display="flex" alignItems="center">
        <Button 
          startIcon={<ArrowLeft />} 
          onClick={() => navigate('/accounts')}
          variant="text"
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h5">
          Adicionar Nova Conta via Importação
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 4 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Informações Básicas */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informações da Conta
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nome da Conta"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name || 'Ex: FTMO Challenge 100k'}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!formErrors.type}>
              <InputLabel>Tipo de Conta</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Tipo de Conta"
                onChange={handleChange}
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.type && (
                <FormHelperText>{formErrors.type}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!formErrors.broker}>
              <InputLabel>Corretora / Plataforma</InputLabel>
              <Select
                name="broker"
                value={formData.broker}
                label="Corretora / Plataforma"
                onChange={handleChange}
              >
                {brokers.map((broker) => (
                  <MenuItem key={broker.value} value={broker.value}>
                    {broker.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.broker && (
                <FormHelperText>{formErrors.broker}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Formato da Data</InputLabel>
              <Select
                name="dateFormat"
                value={formData.dateFormat}
                label="Formato da Data"
                onChange={handleChange}
              >
                {dateFormats.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Selecione o formato de data usado no arquivo que você vai importar
              </FormHelperText>
            </FormControl>
          </Grid>
          
          {/* Campos específicos para contas de Prop Firm */}
          {formData.type === 'prop' && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Regras do Desafio
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meta de Lucro ($)"
                  name="targetBalance"
                  type="number"
                  value={formData.targetBalance || ''}
                  onChange={handleChange}
                  error={!!formErrors.targetBalance}
                  helperText={formErrors.targetBalance || 'Ex: 10000 (para meta de $10.000)'}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Drawdown Máximo (%)"
                  name="maxDrawdown"
                  type="number"
                  value={formData.maxDrawdown || ''}
                  onChange={handleChange}
                  error={!!formErrors.maxDrawdown}
                  helperText={formErrors.maxDrawdown || 'Ex: 5 (para 5% de drawdown)'}
                  InputProps={{
                    inputProps: { min: 0, max: 100 },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Início"
                  name="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data Final"
                  name="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
          
          {/* Importação de Arquivo */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Importação de Arquivo
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box 
              sx={{ 
                border: '2px dashed',
                borderColor: formErrors.file ? 'error.main' : 'divider',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.default',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv,.xls,.xlsx,.html"
                onChange={handleFileChange}
              />
              
              <Upload 
                size={48}
                color={formData.file ? '#4caf50' : '#9e9e9e'}
                style={{ marginBottom: '16px' }}
              />
              
              {formData.file ? (
                <>
                  <Typography variant="subtitle1" color="success.main" gutterBottom>
                    Arquivo selecionado
                  </Typography>
                  <Typography variant="body2">
                    {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Clique ou arraste para selecionar um arquivo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Suporta arquivos CSV, XLS, XLSX e HTML
                  </Typography>
                </>
              )}
            </Box>
            {formErrors.file && (
              <FormHelperText error>{formErrors.file}</FormHelperText>
            )}
          </Grid>
          
          {/* Botões de ação */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Box display="flex" justifyContent="space-between">
              <Button
                variant="outlined"
                startIcon={<ArrowLeft />}
                onClick={() => navigate('/accounts')}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                {loading ? 'Processando...' : 'Importar Conta'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ImportAccountForm; 