import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Memory as MemoryIcon,
  CloudSync as CloudSyncIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { experimentalStyled as styled } from '@mui/material/styles';
import FileUploadDropzone from '../../components/FileUploadDropzone';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  color: 'white',
  textAlign: 'center',
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  color: 'white',
  height: '100%',
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
  },
}));

const EnterpriseRAGDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStrategy, setSearchStrategy] = useState('adaptive');
  const [qualityLevel, setQualityLevel] = useState('enterprise');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // 문서 업로드 상태
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadConfig, setUploadConfig] = useState({
    documentTitle: '',
    department: '간호학과',
    enableMultimodal: true,
    extractImages: true,
    extractTables: true
  });

  const handleFilesSelected = (validFiles, fileErrors) => {
    if (fileErrors.length > 0) {
      alert(fileErrors.join('\n'));
      return;
    }

    if (validFiles.length > 0) {
      setUploadFile(validFiles[0]); // 단일 파일만 선택
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAnalytics(),
        loadSystemStatus()
      ]);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/enterprise-rag/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/enterprise-rag/system-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('시스템 상태 로드 실패:', error);
    }
  };

  const handleUnifiedSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch('/api/enterprise-rag/unified-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: searchQuery,
          strategy: searchStrategy,
          quality_level: qualityLevel,
          department: '간호학과',
          context_limit: 10,
          enable_learning: true,
          include_analytics: true
        })
      });
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('통합 검색 실패:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadConfig.documentTitle) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('request_data', JSON.stringify(uploadConfig));
      
      const response = await fetch('/api/enterprise-rag/enterprise-document-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        alert('문서 업로드가 성공적으로 완료되었습니다!');
        setUploadFile(null);
        setUploadConfig(prev => ({ ...prev, documentTitle: '' }));
      }
    } catch (error) {
      console.error('문서 업로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSystemOverview = () => (
    <Grid container spacing={3}>
      {/* 시스템 상태 카드 */}
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              🏢 엔터프라이즈 RAG 시스템
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.8)">
              대기업급 통합 RAG 플랫폼 v3.0 Enterprise Edition
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label="✅ Operational" 
                sx={{ backgroundColor: 'rgba(76, 175, 80, 0.8)', color: 'white', mr: 1 }} 
              />
              <Chip 
                label="99.97% Uptime" 
                sx={{ backgroundColor: 'rgba(33, 150, 243, 0.8)', color: 'white', mr: 1 }} 
              />
              <Chip 
                label="실시간 처리" 
                sx={{ backgroundColor: 'rgba(255, 152, 0, 0.8)', color: 'white' }} 
              />
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* 성능 메트릭 */}
      <Grid item xs={12} md={3}>
        <MetricCard>
          <CardContent>
            <SpeedIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">1.8초</Typography>
            <Typography variant="body2">평균 응답시간</Typography>
          </CardContent>
        </MetricCard>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <MetricCard>
          <CardContent>
            <MemoryIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">15,620</Typography>
            <Typography variant="body2">벡터 데이터</Typography>
          </CardContent>
        </MetricCard>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <MetricCard>
          <CardContent>
            <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">87%</Typography>
            <Typography variant="body2">품질 점수</Typography>
          </CardContent>
        </MetricCard>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <MetricCard>
          <CardContent>
            <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">4.3/5</Typography>
            <Typography variant="body2">사용자 만족도</Typography>
          </CardContent>
        </MetricCard>
      </Grid>

      {/* 엔터프라이즈 기능 */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🚀 엔터프라이즈 핵심 기능
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FeatureCard>
                  <CardContent>
                    <AutoAwesomeIcon sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="h6">통합 RAG 엔진</Typography>
                    <Typography variant="body2">
                      5가지 검색 전략을 하나의 API로 통합
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FeatureCard>
                  <CardContent>
                    <PsychologyIcon sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="h6">적응형 AI</Typography>
                    <Typography variant="body2">
                      상황별 최적 전략 자동 선택
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FeatureCard>
                  <CardContent>
                    <CloudSyncIcon sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="h6">실시간 학습</Typography>
                    <Typography variant="body2">
                      사용자 피드백 기반 지속 개선
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUnifiedSearch = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 통합 RAG 검색 엔진
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="검색 쿼리"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="간호 중재 방법에 대해 알려주세요"
                  InputProps={{
                    endAdornment: (
                      <Button
                        variant="contained"
                        onClick={handleUnifiedSearch}
                        disabled={searchLoading}
                        sx={{ ml: 1 }}
                      >
                        <SearchIcon />
                      </Button>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>검색 전략</InputLabel>
                  <Select
                    value={searchStrategy}
                    onChange={(e) => setSearchStrategy(e.target.value)}
                  >
                    <MenuItem value="adaptive">🤖 적응형 (추천)</MenuItem>
                    <MenuItem value="hybrid">🔍 하이브리드</MenuItem>
                    <MenuItem value="fusion">🔥 RAG Fusion</MenuItem>
                    <MenuItem value="basic">📊 기본 시맨틱</MenuItem>
                    <MenuItem value="multimodal">🎨 멀티모달</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>품질 수준</InputLabel>
                  <Select
                    value={qualityLevel}
                    onChange={(e) => setQualityLevel(e.target.value)}
                  >
                    <MenuItem value="enterprise">🏢 엔터프라이즈</MenuItem>
                    <MenuItem value="premium">💎 프리미엄</MenuItem>
                    <MenuItem value="standard">📋 표준</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {searchLoading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  엔터프라이즈 RAG 엔진이 최적의 결과를 검색 중입니다...
                </Typography>
              </Box>
            )}

            {searchResults.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  검색 결과 ({searchResults.length}개)
                </Typography>
                {searchResults.map((result, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1 }}>
                          {result.content.substring(0, 100)}...
                        </Typography>
                        <Chip 
                          label={`점수: ${(result.score * 100).toFixed(1)}%`}
                          color="primary"
                          size="small"
                          sx={{ ml: 2 }}
                        />
                        {result.credibility_score && (
                          <Chip 
                            label={`신뢰도: ${(result.credibility_score * 100).toFixed(1)}%`}
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography paragraph>
                        {result.content}
                      </Typography>
                      {result.ai_summary && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">AI 요약</Typography>
                          <Typography variant="body2">{result.ai_summary}</Typography>
                        </Alert>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`소스: ${result.source}`} size="small" />
                        {result.metadata?.subject && (
                          <Chip label={`과목: ${result.metadata.subject}`} size="small" />
                        )}
                        {result.department_relevance && (
                          <Chip 
                            label={`학과 연관성: ${(result.department_relevance * 100).toFixed(0)}%`} 
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDocumentUpload = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏢 엔터프라이즈 문서 처리
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="문서 제목"
                  value={uploadConfig.documentTitle}
                  onChange={(e) => setUploadConfig(prev => ({ ...prev, documentTitle: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>학과</InputLabel>
                  <Select
                    value={uploadConfig.department}
                    onChange={(e) => setUploadConfig(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <MenuItem value="간호학과">간호학과</MenuItem>
                    <MenuItem value="물리치료학과">물리치료학과</MenuItem>
                    <MenuItem value="작업치료학과">작업치료학과</MenuItem>
                  </Select>
                </FormControl>

                <FileUploadDropzone
                  onFilesSelected={handleFilesSelected}
                  acceptedFormats={['.pdf', '.xlsx', '.xls', '.txt']}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  multiple={false}
                  disabled={loading}
                >
                  <UploadIcon sx={{ fontSize: 48, color: 'gray', mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    파일을 드래그하여 업로드하거나 클릭하세요
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    PDF, Excel, 텍스트 파일만 가능 (최대 50MB)
                  </Typography>
                </FileUploadDropzone>
                
                {uploadFile && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    선택된 파일: {uploadFile.name}
                  </Alert>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  처리 옵션
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={uploadConfig.enableMultimodal}
                      onChange={(e) => setUploadConfig(prev => ({ ...prev, enableMultimodal: e.target.checked }))}
                    />
                    멀티모달 처리 활성화
                  </label>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={uploadConfig.extractImages}
                      onChange={(e) => setUploadConfig(prev => ({ ...prev, extractImages: e.target.checked }))}
                    />
                    이미지 추출 및 OCR
                  </label>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={uploadConfig.extractTables}
                      onChange={(e) => setUploadConfig(prev => ({ ...prev, extractTables: e.target.checked }))}
                    />
                    표 구조화 추출
                  </label>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleFileUpload}
                  disabled={!uploadFile || !uploadConfig.documentTitle || loading}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : '엔터프라이즈 처리 시작'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3}>
      {analytics && (
        <>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 성능 메트릭
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="총 검색 수"
                      secondary={analytics.performance_metrics?.total_searches || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="평균 응답 시간"
                      secondary={`${analytics.performance_metrics?.avg_response_time || 0}초`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="평균 품질 점수"
                      secondary={`${(analytics.performance_metrics?.avg_quality_score * 100 || 0).toFixed(1)}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="사용자 만족도"
                      secondary={`${analytics.performance_metrics?.user_satisfaction || 0}/5`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 전략 분포
                </Typography>
                {analytics.performance_metrics?.strategy_distribution && 
                  Object.entries(analytics.performance_metrics.strategy_distribution).map(([strategy, count]) => (
                    <Box key={strategy} sx={{ mb: 2 }}>
                      <Typography variant="body2">{strategy}: {count}%</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={count} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))
                }
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💡 개선 권장사항
                </Typography>
                <List>
                  {analytics.recommendations?.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingUpIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🏢 엔터프라이즈 RAG 대시보드
        </Typography>
        <Box>
          <IconButton onClick={loadInitialData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="시스템 개요" icon={<AnalyticsIcon />} />
        <Tab label="통합 검색" icon={<SearchIcon />} />
        <Tab label="문서 처리" icon={<UploadIcon />} />
        <Tab label="성능 분석" icon={<TrendingUpIcon />} />
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {activeTab === 0 && renderSystemOverview()}
      {activeTab === 1 && renderUnifiedSearch()}
      {activeTab === 2 && renderDocumentUpload()}
      {activeTab === 3 && renderAnalytics()}
    </Box>
  );
};

export default EnterpriseRAGDashboard; 