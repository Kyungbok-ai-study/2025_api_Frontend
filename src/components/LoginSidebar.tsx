import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Help as HelpIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

const LoginSidebar: React.FC = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // 소셜 로그인 구현 (테스트 기간 동안 비활성화)
    console.log(`${provider} 로그인 - 테스트 기간 동안 비활성화`);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        position: 'sticky',
        top: 20,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom textAlign="center" sx={{ mb: 3 }}>
        🔐 로그인
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          size="small"
          label="학번"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          size="small"
          label="비밀번호"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          sx={{ mb: 3 }}
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          startIcon={<LoginIcon />}
          sx={{ mb: 2 }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="textSecondary">
          또는
        </Typography>
      </Divider>

      {/* 소셜 로그인 (테스트 기간 동안 비활성화) */}
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
        <IconButton
          onClick={() => handleSocialLogin('google')}
          disabled
          size="small"
          sx={{ border: 1, borderColor: 'divider' }}
        >
          <GoogleIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={() => handleSocialLogin('facebook')}
          disabled
          size="small"
          sx={{ border: 1, borderColor: 'divider' }}
        >
          <FacebookIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Typography variant="caption" color="textSecondary" textAlign="center" sx={{ display: 'block', mb: 3 }}>
        * 소셜 로그인은 테스트 기간 동안 비활성화됩니다
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1}>
        <Button
          component={Link}
          to="/register"
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<PersonAddIcon />}
        >
          회원가입
        </Button>
        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<HelpIcon />}
          onClick={() => {
            // ID/PW 찾기 기능 구현
            console.log('ID/PW 찾기 기능');
          }}
        >
          ID/PW 찾기
        </Button>
      </Stack>
    </Paper>
  );
};

export default LoginSidebar; 