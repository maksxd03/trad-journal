import React, { useState, useEffect } from 'react';
import { useAccounts } from '../context/AccountsContext';
import { Box, Button, Typography, Grid, Paper, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Menu } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const AccountCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const AccountsPage: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, loading } = useAccounts();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'live',
    broker: '',
    balance: '',
    currency: 'USD',
    notes: ''
  });

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpen = (account?: any) => {
    if (account) {
      setEditMode(true);
      setCurrentAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        broker: account.broker,
        balance: account.balance.toString(),
        currency: account.currency,
        notes: account.notes || ''
      });
    } else {
      setEditMode(false);
      setCurrentAccount(null);
      setFormData({
        name: '',
        type: 'live',
        broker: '',
        balance: '',
        currency: 'USD',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    const accountData = {
      ...formData,
      balance: parseFloat(formData.balance)
    };
    
    if (editMode && currentAccount) {
      updateAccount(currentAccount.id, accountData);
    } else {
      addAccount(accountData);
    }
    
    handleClose();
  };

  const handleDelete = (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccount(accountId);
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'live':
        return '#4caf50';
      case 'demo':
        return '#2196f3';
      case 'prop':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trading Accounts
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<UploadIcon />}
            onClick={() => navigate('/accounts/new')}
            sx={{ mr: 2 }}
          >
            Importar por Arquivo
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Adicionar Conta
          </Button>
        </Box>
      </Box>

      {accounts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No accounts added yet
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Add your first trading account to start tracking your performance
          </Typography>
          <Box mt={2}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<UploadIcon />}
              onClick={() => navigate('/accounts/new')}
              sx={{ mr: 2 }}
            >
              Importar por Arquivo
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Adicionar Conta
            </Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <AccountCard elevation={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" component="h2">
                    {account.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(account)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(account.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'inline-block',
                    bgcolor: getAccountTypeColor(account.type),
                    color: 'white',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  {account.type}
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box mt={1}>
                  <Typography variant="body2" color="textSecondary">
                    Broker
                  </Typography>
                  <Typography variant="body1">
                    {account.broker}
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Balance
                  </Typography>
                  <Typography variant="h6" component="p">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: account.currency 
                    }).format(account.balance)}
                  </Typography>
                </Box>
                
                {account.notes && (
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {account.notes}
                    </Typography>
                  </Box>
                )}
              </AccountCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Account Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel id="account-type-label">Account Type</InputLabel>
              <Select
                labelId="account-type-label"
                name="type"
                value={formData.type}
                label="Account Type"
                onChange={handleChange}
              >
                <MenuItem value="live">Live</MenuItem>
                <MenuItem value="demo">Demo</MenuItem>
                <MenuItem value="prop">Prop Firm</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              name="broker"
              label="Broker"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.broker}
              onChange={handleChange}
              required
            />
            
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  margin="dense"
                  name="balance"
                  label="Balance"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.balance}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="currency-label">Currency</InputLabel>
                  <Select
                    labelId="currency-label"
                    name="currency"
                    value={formData.currency}
                    label="Currency"
                    onChange={handleChange}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="JPY">JPY</MenuItem>
                    <MenuItem value="BRL">BRL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              margin="dense"
              name="notes"
              label="Notes"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={formData.notes}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Add'} Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPage; 