import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  LinearProgress,
  Alert,
  Chip,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import { 
  Timer, 
  CheckCircle, 
  Warning, 
  School,
  Assignment,
  TrendingUp
} from '@mui/icons-material';

const UniversalDiagnosticTestRunner = () => {
  const { department } = useParams();
  const navigate = useNavigate();
  
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // 테스트 데이터 로드
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `http://localhost:8000/api/universal-diagnosis/department/${department}/start-test`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTestData(data);
          setTimeRemaining(data.test_info?.time_limit * 60 || 3600); // 기본 60분
          setTestStarted(true);
        } else {
          throw new Error('테스트 데이터를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('테스트 로드 실패:', error);
        alert('테스트를 시작할 수 없습니다. 다시 시도해주세요.');
        navigate('/student/universal-diagnosis');
      }
    };

    if (department) {
      fetchTestData();
    }
  }, [department, navigate]);

  // 타이머
  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  // 숫자키 선택 기능
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (testData && currentQuestionIndex < testData.questions.length) {
        const key = event.key;
        const currentQuestion = testData.questions[currentQuestionIndex];
        
        // 1-5 숫자키로 답안 선택
        if (['1', '2', '3', '4', '5'].includes(key) && currentQuestion.options[key]) {
          handleAnswerChange(currentQuestion.id, key);
        }
        
        // 엔터키로 다음 문제
        if (key === 'Enter' && !isLastQuestion) {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testData, currentQuestionIndex, answers]);

  // 답안 선택
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // 다음 문제
  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // 이전 문제
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 테스트 제출
  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8000/api/universal-diagnosis/department/${department}/submit-test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            test_session_id: testData.test_session_id,
            answers: answers
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        navigate(`/student/universal-diagnosis/result/${result.result_id}`);
      } else {
        throw new Error('답안 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('제출 실패:', error);
      alert('답안 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 진행률 계산
  const getProgress = () => {
    if (!testData) return 0;
    return ((currentQuestionIndex + 1) / testData.questions.length) * 100;
  };

  // 답안 완성도 계산
  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (!testData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>테스트를 불러오는 중...</Typography>
      </Box>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;
  const answeredCount = getAnsweredCount();
  const totalQuestions = testData.questions.length;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* 헤더 */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <School sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              {testData.test_info?.department_name} 진단테스트
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {testData.test_info?.description}
            </Typography>
          </Grid>
          <Grid item>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold">
                <Timer sx={{ mr: 1, verticalAlign: 'middle' }} />
                {formatTime(timeRemaining)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                남은 시간
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 진행 상태 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              문제 {currentQuestionIndex + 1} / {totalQuestions}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                icon={<Assignment />} 
                label={`답변완료: ${answeredCount}/${totalQuestions}`}
                color={answeredCount === totalQuestions ? "success" : "default"}
              />
              <Chip 
                icon={<TrendingUp />} 
                label={`진행률: ${Math.round(getProgress())}%`}
                color="primary"
              />
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgress()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      {/* 시간 경고 */}
      {timeRemaining < 300 && ( // 5분 미만
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Warning sx={{ mr: 1 }} />
          시간이 얼마 남지 않았습니다! ({formatTime(timeRemaining)})
        </Alert>
      )}

      {/* 문제 카드 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Chip 
              label={`${currentQuestion.difficulty} 난이도`}
              color={
                currentQuestion.difficulty === '상' ? 'error' :
                currentQuestion.difficulty === '중' ? 'warning' : 'success'
              }
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 2, lineHeight: 1.6 }}>
              {currentQuestion.question}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {Object.entries(currentQuestion.options).map(([key, option]) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={
                    <Typography sx={{ fontSize: '1.1rem', py: 0.5 }}>
                      {key}. {option}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                    ...(answers[currentQuestion.id] === key && {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      border: '1px solid rgba(25, 118, 210, 0.3)'
                    })
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* 네비게이션 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          sx={{ minWidth: 120 }}
        >
          이전 문제
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* 문제 번호 네비게이션 */}
          {testData.questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestionIndex ? "contained" : "outlined"}
              size="small"
              onClick={() => setCurrentQuestionIndex(index)}
              sx={{ 
                minWidth: 40, 
                height: 40,
                ...(answers[testData.questions[index].id] && index !== currentQuestionIndex && {
                  backgroundColor: 'success.light',
                  color: 'white',
                  '&:hover': { backgroundColor: 'success.main' }
                })
              }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>

        {isLastQuestion ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitTest}
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
            startIcon={<CheckCircle />}
          >
            {isSubmitting ? '제출 중...' : '테스트 완료'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNextQuestion}
            sx={{ minWidth: 120 }}
          >
            다음 문제
          </Button>
        )}
      </Box>

      {/* 키보드 사용 안내 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        💡 <strong>키보드 단축키:</strong> 숫자키 1~5로 답안 선택, Enter키로 다음 문제 이동
      </Alert>

      {/* 미답변 문제 경고 */}
      {answeredCount < totalQuestions && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          아직 답변하지 않은 문제가 {totalQuestions - answeredCount}개 있습니다. 
          위의 번호 버튼을 클릭하여 해당 문제로 이동할 수 있습니다.
        </Alert>
      )}
    </Box>
  );
};

export default UniversalDiagnosticTestRunner; 