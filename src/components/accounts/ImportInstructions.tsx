import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Chip, Stack, Alert } from '@mui/material';
import { ArrowRight, Info, Check, FileText } from 'lucide-react';
import { getImportInstructions } from '../../lib/importInstructions';

interface ImportInstructionsProps {
  brokerKey: string;
}

const ImportInstructions: React.FC<ImportInstructionsProps> = ({ brokerKey }) => {
  // Se não houver broker selecionado, mostra uma mensagem genérica
  if (!brokerKey) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Instruções de Importação
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Selecione uma corretora para ver instruções específicas de exportação.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          O TraderLog Pro suporta importação de trades de várias corretoras e plataformas populares.
          Selecione sua corretora no formulário à esquerda para ver instruções detalhadas sobre como exportar seus dados.
        </Typography>
      </Paper>
    );
  }

  const instructions = getImportInstructions(brokerKey);

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {instructions.title}
      </Typography>

      {/* Formatos suportados */}
      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Formatos Suportados:
        </Typography>
        <Stack direction="row" spacing={1}>
          {instructions.supportedFormats.map((format, index) => (
            <Chip 
              key={index}
              label={format}
              size="small"
              color="primary"
              variant="outlined"
              icon={<FileText size={14} />}
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Passos */}
      <Typography variant="subtitle1" gutterBottom>
        Passos para exportação:
      </Typography>
      <List dense sx={{ mb: 2 }}>
        {instructions.steps.map((step, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: '30px' }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {index + 1}
              </Box>
            </ListItemIcon>
            <ListItemText primary={step} />
          </ListItem>
        ))}
      </List>

      {/* Notas */}
      {instructions.notes && instructions.notes.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Notas importantes:
          </Typography>
          <List dense>
            {instructions.notes.map((note, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <Info size={18} color="#1976d2" />
                </ListItemIcon>
                <ListItemText primary={note} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Imagem de exemplo */}
      {instructions.sampleImage && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Exemplo:
          </Typography>
          <Box 
            component="img" 
            src={instructions.sampleImage} 
            alt="Exemplo de exportação"
            sx={{ 
              maxWidth: '100%', 
              maxHeight: '250px', 
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              boxShadow: 1
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default ImportInstructions; 