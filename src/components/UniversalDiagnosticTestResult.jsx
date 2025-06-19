import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import { 
  School,
  TrendingUp,
  CheckCircle,
  Cancel,
  Lightbulb,
  MenuBook,
  Assessment,
  Star,
  Timeline,
  Recommend
} from '@mui/icons-material';

const UniversalDiagnosticTestResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `http://localhost:8000/api/universal-diagnosis/result/${resultId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResultData(data);
        } else {
          throw new Error('결과를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('결과 로드 실패:', error);
        alert('결과를 불러올 수 없습니다.');
        navigate('/student/universal-diagnosis');
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId, navigate]);

  // 등급별 색상
  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': '#4caf50',
      'A': '#66bb6a', 
      'B+': '#9ccc65',
      'B': '#ffeb3b',
      'C+': '#ff9800',
      'C': '#ff5722',
      'D+': '#f44336',
      'D': '#d32f2f',
      'F': '#b71c1c'
    };
    return gradeColors[grade] || '#9e9e9e';
  };

  // 퍼센트를 바 차트로 표시
  const ScoreBar = ({ label, score, maxScore, color = 'primary' }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight="medium">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">
          {score}/{maxScore} ({Math.round((score/maxScore) * 100)}%)
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={(score/maxScore) * 100} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color === 'primary' ? '#1976d2' : color
          }
        }} 
      />
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>결과를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!resultData) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6">결과를 찾을 수 없습니다.</Typography>
        <Button onClick={() => navigate('/student/universal-diagnosis')} sx={{ mt: 2 }}>
          진단테스트로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* 헤더 */}
      <Paper sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Assessment sx={{ fontSize: 50 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              {resultData.department_name} 진단테스트 결과
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
              총점: {resultData.total_score}점 / {resultData.max_score}점
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
              응시일: {new Date(resultData.completed_at).toLocaleDateString('ko-KR')}
            </Typography>
          </Grid>
          <Grid item>
            <Box textAlign="center">
              <Chip 
                label={resultData.grade}
                sx={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  height: 60,
                  backgroundColor: getGradeColor(resultData.grade),
                  color: 'white'
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                등급
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* 점수 분석 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1 }} />
                점수 분석
              </Typography>
              
              <ScoreBar 
                label="전체 점수"
                score={resultData.total_score}
                maxScore={resultData.max_score}
                color="#1976d2"
              />

              {resultData.category_scores && Object.entries(resultData.category_scores).map(([category, score]) => (
                <ScoreBar 
                  key={category}
                  label={category}
                  score={score.score}
                  maxScore={score.max_score}
                  color="#4caf50"
                />
              ))}

              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2 }}>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  상위 {Math.round(resultData.percentile || 0)}% 성과
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  전체 응시자 중 상위권에 속하는 우수한 결과입니다.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 문제별 결과 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ mr: 1 }} />
                문제별 결과
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 30, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {resultData.correct_answers || 0}
                      </Typography>
                      <Typography variant="body2">정답</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" sx={{ p: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2 }}>
                      <Cancel sx={{ color: 'error.main', fontSize: 30, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {resultData.wrong_answers || 0}
                      </Typography>
                      <Typography variant="body2">오답</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {resultData.question_results && (
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {resultData.question_results.map((result, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ mr: 2 }}>
                          문제 {index + 1}
                        </Typography>
                        {result.is_correct ? (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        ) : (
                          <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
                        )}
                        <Chip 
                          size="small" 
                          label={result.difficulty || '중'}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        선택한 답: {result.user_answer}
                      </Typography>
                      {!result.is_correct && (
                        <Typography variant="body2" color="success.main">
                          정답: {result.correct_answer}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 학습 추천사항 */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1 }} />
                학습 추천사항
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1, color: 'primary.main' }} />
                    강점 분야
                  </Typography>
                  <List dense>
                    {resultData.strengths?.map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    )) || (
                      <ListItem>
                        <ListItemText primary="기본 개념 이해도가 우수합니다." />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Timeline sx={{ mr: 1, color: 'warning.main' }} />
                    개선 필요 분야
                  </Typography>
                  <List dense>
                    {resultData.weaknesses?.map((weakness, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Recommend sx={{ color: 'warning.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText primary={weakness} />
                      </ListItem>
                    )) || (
                      <ListItem>
                        <ListItemText primary="심화 학습을 통해 더욱 발전할 수 있습니다." />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>추천 학습 계획:</strong> 이 결과를 바탕으로 개인 맞춤 학습 계획을 수립해보세요. 
                  강점 분야는 더욱 심화하고, 개선이 필요한 분야는 기초부터 차근차근 학습하시기 바랍니다.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 액션 버튼 */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/student/universal-diagnosis')}
          startIcon={<MenuBook />}
        >
          다른 진단테스트 보기
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/student/dashboard')}
          startIcon={<School />}
        >
          학습 대시보드로
        </Button>
      </Box>
    </Box>
  );
};

export default UniversalDiagnosticTestResult; 