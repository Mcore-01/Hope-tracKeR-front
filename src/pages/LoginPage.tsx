import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, Snackbar } from '@mui/material';
import { login } from '../services/AuthService';
import type { LoginRequest } from '../models/LoginRequest';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginField.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }

    const loginData: LoginRequest = {
      login: loginField.trim(),
      password: password.trim(),
    };

    try {
      const response = await login(loginData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userName', response.userName);
      localStorage.setItem('userId', String(response.userId));
      navigate('/');
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError('Не удалось войти в систему');
    }
  };

  const handleGuestLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#121212',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#1e1e1e',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#ffffff' }}>
          Вход
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
          <TextField
            fullWidth
            label="Логин"
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 1 }}
          >
            Войти
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGuestLogin}
          >
            Гость
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}