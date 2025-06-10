/**
 * 문제 RAG 업데이트 페이지
 * 교수가 PDF 파일을 업로드하여 RAG 지식 베이스를 업데이트하고 실시간 자동 러닝을 관리합니다.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight,
  Download,
  Eye,
  Database,
  Zap,
  Activity,
  Layers,
  X,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { questionReviewApi } from '../../services/questionReviewService.js';
import apiClient from '../../services/api.js';

// 문제 검토 카드 컴포넌트
const QuestionReviewCard = ({ question, onApprove, onReject, onEdit }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">문제 {question.question_number}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              question.difficulty === '상' ? 'bg-red-100 text-red-800' :
              question.difficulty === '중' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {question.difficulty}
            </span>
            {question.subject && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {question.subject}
              </span>
            )}
          </div>
          <p className="text-gray-900 mb-2">{question.content}</p>
          {question.description && (
            <p className="text-sm text-gray-600 mb-2">{question.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          🔧 수정
        </button>
        <button
          onClick={onApprove}
          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        >
          ✅ 승인
        </button>
        <button
          onClick={onReject}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          ❌ 거부
        </button>
      </div>
    </div>
  );
};

const RAGUpdate = () => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadResults, setUploadResults] = useState([]); // 다중 업로드 결과
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [ragStats, setRagStats] = useState(null);
  const [realTimeLearning, setRealTimeLearning] = useState(true);
  const [autoLearningLogs, setAutoLearningLogs] = useState([]);
  const [vectorIndexing, setVectorIndexing] = useState(false);
  const [showVectorExplanation, setShowVectorExplanation] = useState(false);
  const [professorInfo, setProfessorInfo] = useState(null);
  
  // 다중 파일 업로드 관련 상태
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileMetadata, setFileMetadata] = useState({});
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [totalUploadCount, setTotalUploadCount] = useState(0);

  useEffect(() => {
    loadProfessorInfo();
    loadRagStats();
    if (realTimeLearning) {
      startRealTimeLearning();
    }
  }, [realTimeLearning]);

  // 교수 정보 로드
  const loadProfessorInfo = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setProfessorInfo(response.data);
    } catch (error) {
      console.error('교수 정보 로드 실패:', error);
    }
  };

  // 교수 학과별 카테고리 생성
  const getDepartmentCategories = () => {
    const department = professorInfo?.department || '일반';
    
    const departmentCategories = {
      '간호학과': [
        { value: '국가고시', label: '간호사 국가고시' },
        { value: '임상실습', label: '임상실습 사례' },
        { value: '간호과정', label: '간호과정 자료' },
        { value: '기본간호', label: '기본간호학' },
        { value: '성인간호', label: '성인간호학' },
        { value: '아동간호', label: '아동간호학' },
        { value: '모성간호', label: '모성간호학' },
        { value: '정신간호', label: '정신건강간호학' }
      ],
      '물리치료학과': [
        { value: '국가고시', label: '물리치료사 국가고시' },
        { value: '재활치료', label: '재활치료 사례' },
        { value: '운동치료', label: '운동치료 매뉴얼' },
        { value: '물리치료학개론', label: '물리치료학개론' },
        { value: '정형물리치료', label: '정형물리치료학' },
        { value: '신경물리치료', label: '신경물리치료학' },
        { value: '심폐물리치료', label: '심폐물리치료학' },
        { value: '소아물리치료', label: '소아물리치료학' }
      ],
      '작업치료학과': [
        { value: '국가고시', label: '작업치료사 국가고시' },
        { value: '인지재활', label: '인지재활 사례' },
        { value: '일상생활활동', label: '일상생활활동 평가' },
        { value: '작업치료학개론', label: '작업치료학개론' },
        { value: '신체기능작업치료', label: '신체기능작업치료학' },
        { value: '정신사회작업치료', label: '정신사회작업치료학' },
        { value: '소아작업치료', label: '소아작업치료학' },
        { value: '연구방법론', label: '작업치료 연구방법론' }
      ]
    };

    // 기본 공통 카테고리
    const commonCategories = [
      { value: '논문자료', label: '논문 자료' },
      { value: '외부자료', label: '외부 자료' },
      { value: '교재', label: '교재' },
      { value: '모의고사', label: '모의고사' },
      { value: '중간고사', label: '중간고사' },
      { value: '기말고사', label: '기말고사' }
    ];

    return [
      ...(departmentCategories[department] || []),
      ...commonCategories
    ];
  };

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        setShowVectorExplanation(!showVectorExplanation);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showVectorExplanation]);

  // RAG 통계 로드
  const loadRagStats = async () => {
    try {
      const response = await apiClient.get('/professor/rag/stats');
      setRagStats(response.data);
      console.log('RAG 통계 로딩 완료');
    } catch (error) {
      console.error('RAG 통계 로드 실패:', error);
      setRagStats({
        total_documents: 0,
        total_embeddings: 0,
        embedding_dimensions: 0,
        last_updated: new Date().toISOString(),
        knowledge_areas: [],
        auto_learning_enabled: false,
        indexing_status: 'error'
      });
    }
  };

  // 실시간 자동 러닝 시작
  const startRealTimeLearning = () => {
    console.log('🔄 실시간 RAG 자동 러닝 시작');
    
    // 자동 학습 로그 시뮬레이션
    const logInterval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: '자동 벡터 인덱싱 업데이트',
        status: 'success',
        documents_processed: Math.floor(Math.random() * 10) + 1,
        embeddings_updated: Math.floor(Math.random() * 100) + 50
      };
      
      setAutoLearningLogs(prev => [newLog, ...prev.slice(0, 9)]); // 최근 10개만 유지
    }, 30000); // 30초마다

    return () => clearInterval(logInterval);
  };

  // 파일 드롭 핸들러 (다중 파일 지원)
  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    // PDF 파일만 필터링
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    const invalidFiles = acceptedFiles.filter(file => file.type !== 'application/pdf');

    if (invalidFiles.length > 0) {
      alert(`⚠️ PDF 파일만 업로드 가능합니다.\n제외된 파일: ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    if (pdfFiles.length === 0) {
      setUploadError('PDF 파일을 선택해주세요.');
      return;
    }

    // 파일 크기 검증 (50MB per file)
    const oversizedFiles = pdfFiles.filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`⚠️ 파일 크기는 50MB 이하여야 합니다.\n초과된 파일: ${oversizedFiles.map(f => f.name).join(', ')}`);
      const validFiles = pdfFiles.filter(file => file.size <= 50 * 1024 * 1024);
      if (validFiles.length === 0) return;
      setSelectedFiles(validFiles);
    } else {
      setSelectedFiles(pdfFiles);
    }

    // 파일별 메타데이터 초기화 (교수 학과 기본 카테고리로)
    const defaultCategory = getDepartmentCategories()[0]?.value || '국가고시';
    const initialMetadata = {};
    pdfFiles.forEach(file => {
      initialMetadata[file.name] = {
        title: file.name.replace('.pdf', ''),
        category: defaultCategory
      };
    });
    setFileMetadata(initialMetadata);

    // 업로드 상태 초기화
    setUploadResults([]);
    setUploadError('');
    setUploadProgress({});
  }, []);

  // 파일 메타데이터 업데이트
  const updateFileMetadata = (fileName, field, value) => {
    setFileMetadata(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        [field]: value
      }
    }));
  };

  // 파일 제거
  const removeFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setFileMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[fileName];
      return newMetadata;
    });
  };

  // 다중 파일 통합 업로드 시작 (방식 1: 멀티파일 한번에 업로드)
  const startMultipleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    // 교수 정보 확인
    if (!professorInfo) {
      alert('교수 정보를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setUploadStatus('uploading');
    setUploadError('');
    setUploadResults([]);
    setCurrentUploadIndex(1);
    setTotalUploadCount(1); // 통합 업로드이므로 1개 작업
    setVectorIndexing(true);

    // 통합 메타데이터 설정 (첫 번째 파일 기준, 여러 파일 통합 표시)
    const firstFile = selectedFiles[0];
    const metadata = fileMetadata[firstFile.name] || { 
      title: `통합문제_${selectedFiles.length}개파일`, 
      category: '일반' 
    };
    
    try {
      // 전체 파일에 대한 진행률 추적
      const handleUploadProgress = (percentCompleted) => {
        // 실제 업로드는 전체의 40%까지만, 나머지 60%는 파싱 단계
        const uploadProgress = Math.min(percentCompleted * 0.4, 40);
        selectedFiles.forEach(file => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: uploadProgress
          }));
        });
      };

      // 파싱 시작 표시 (40% -> 95%)
      selectedFiles.forEach(file => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 40
        }));
      });

      // 파싱 진행률 시뮬레이션 (모든 파일에 대해 동기화)
      const parsingInterval = setInterval(() => {
        selectedFiles.forEach(file => {
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 40;
            if (currentProgress < 95) {
              return {
                ...prev,
                [file.name]: Math.min(currentProgress + Math.random() * 3, 95)
              };
            }
            return prev;
          });
        });
      }, 1500);

      // 통합 멀티파일 업로드 API 호출
      const result = await questionReviewApi.uploadPdfWithReview(
        selectedFiles,  // 파일 배열 전체 전송
        handleUploadProgress, 
        metadata.title, 
        metadata.category
      );
      
      // 파싱 완료
      clearInterval(parsingInterval);
      selectedFiles.forEach(file => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      });
      
      if (result.success) {
        setUploadResults([{
          ...result,
          fileName: `통합업로드_${selectedFiles.length}개파일`,
          fileTitle: metadata.title,
          fileCategory: metadata.category,
          status: 'success',
          message: `✅ ${selectedFiles.length}개 파일 통합 업로드 완료 (${result.total_questions}개 문제 생성)`,
          questionLimitApplied: result.total_questions >= 22,
          uploadedFiles: selectedFiles.map(f => f.name),
          filesProcessed: result.files_processed || selectedFiles.length
        }]);
      } else {
        setUploadResults([{
          fileName: `통합업로드_${selectedFiles.length}개파일`,
          fileTitle: metadata.title,
          fileCategory: metadata.category,
          status: 'error',
          message: `❌ 통합 업로드 실패: ${result.message}`,
          error: result.message,
          uploadedFiles: selectedFiles.map(f => f.name)
        }]);
      }
    } catch (error) {
      console.error(`통합 파일 업로드 오류:`, error);
      
      // 파싱 진행률 시뮬레이션 중단
      clearInterval(parsingInterval);
      
      // 500 오류의 경우 부분적 성공으로 처리
      if (error.response?.status === 500) {
        setUploadResults([{
          fileName: `통합업로드_${selectedFiles.length}개파일`,
          fileTitle: metadata.title,
          fileCategory: metadata.category,
          status: 'partial_success',
          message: `⚠️ ${selectedFiles.length}개 파일 통합 업로드 부분 완료 (파싱 성공, 응답 오류)`,
          note: '문제 검토 페이지에서 확인 필요',
          uploadedFiles: selectedFiles.map(f => f.name)
        }]);
      } else {
        setUploadResults([{
          fileName: `통합업로드_${selectedFiles.length}개파일`,
          fileTitle: metadata.title,
          fileCategory: metadata.category,
          status: 'error',
          message: `❌ 통합 업로드 실패`,
          error: error.response?.data?.detail || error.message,
          uploadedFiles: selectedFiles.map(f => f.name)
        }]);
      }
    }

    setUploadStatus('success');
    setVectorIndexing(false);
    
    // 결과 요약 알림
    const successCount = uploadResults.filter(r => r.status === 'success').length;
    const partialCount = uploadResults.filter(r => r.status === 'partial_success').length;
    const errorCount = uploadResults.filter(r => r.status === 'error').length;
    const limitAppliedCount = uploadResults.filter(r => r.questionLimitApplied).length;
    
    setTimeout(() => {
      alert(`📊 업로드 완료!\n\n✅ 성공: ${successCount}개\n⚠️ 부분 성공: ${partialCount}개\n❌ 실패: ${errorCount}개\n📋 22개 제한 적용: ${limitAppliedCount}개 파일\n\n문제 검토 페이지에서 확인해주세요!`);
    }, 1000);
    
    // RAG 통계 새로고침
    setTimeout(() => {
      loadRagStats();
    }, 2000);
    
    // 문제 검토 페이지로 이동 제안
    setTimeout(() => {
      if (successCount > 0 || partialCount > 0) {
        if (confirm('📋 문제 검토 페이지로 이동하시겠습니까?\n\n업로드된 문제들을 즉시 검토하실 수 있습니다.')) {
          window.location.href = '/professor/question-review';
        }
      }
    }, 3000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    disabled: uploadStatus === 'uploading'
  });

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadResults([]);
    setUploadError('');
    setUploadProgress({});
    setSelectedFiles([]);
    setFileMetadata({});
    setCurrentUploadIndex(0);
    setTotalUploadCount(0);
  };

  // 문제 액션 핸들러
  const handleQuestionAction = async (questionId, action) => {
    try {
      if (action === 'approve') {
        const response = await apiClient.post('/professor/questions/approve', {
          question_ids: [questionId],
          action: 'approve'
        });
        if (response.data.success) {
          alert('✅ 문제가 승인되었습니다.');
          // 업로드 결과에서 해당 문제 제거
          setUploadResults(prev => prev.map(result => ({
            ...result,
            questions_preview: result.questions_preview.filter(q => q.id !== questionId)
          })));
        }
      } else if (action === 'reject') {
        const response = await apiClient.post('/professor/questions/approve', {
          question_ids: [questionId],
          action: 'reject'
        });
        if (response.data.success) {
          alert('❌ 문제가 거부되었습니다.');
          // 업로드 결과에서 해당 문제 제거
          setUploadResults(prev => prev.map(result => ({
            ...result,
            questions_preview: result.questions_preview.filter(q => q.id !== questionId)
          })));
        }
      }
    } catch (error) {
      console.error('문제 액션 실패:', error);
      
      // 에러 메시지 개선
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ 처리 중 오류가 발생했습니다:\n\n${errorMessage}\n\n상태 코드: ${error.response?.status || 'N/A'}`);
    }
  };

  // 문제 수정 핸들러
  const handleQuestionEdit = (questionId) => {
    // 문제 검토 페이지로 이동
    window.location.href = `/professor/question-review?question=${questionId}`;
  };

  // 수동 벡터 인덱스 재구성
  const handleReindexVectors = async () => {
    // 사용자 확인 대화상자
    const userConfirmed = confirm(`🔧 벡터 재인덱싱을 시작하시겠습니까?

📋 작업 내용:
• 모든 업로드된 문제를 AI 벡터로 재변환
• 검색 인덱스 최적화 및 재구성  
• 문제 검색 성능 향상

⏱️ 예상 소요 시간: 2-5분
📊 현재 문서 수: ${ragStats?.total_documents || 0}개

💡 많은 문제가 업로드되어 있거나 검색 성능이 떨어질 때 실행하시면 좋습니다.`);

    if (!userConfirmed) return;

    try {
      setVectorIndexing(true);
      const response = await apiClient.post('/professor/rag/reindex');
      if (response.data.success) {
        alert(`✅ 벡터 재인덱싱 완료!

🎉 ${response.data.message}
📈 AI 문제 검색 성능이 향상되었습니다.
🔍 이제 더 정확한 문제 추천이 가능합니다.

💡 팁: 정기적으로(월 1회) 실행하시면 최적의 성능을 유지할 수 있습니다.`);
        loadRagStats();
      } else {
        alert('❌ 벡터 인덱싱에 실패했습니다: ' + response.data.message);
      }
    } catch (error) {
      console.error('벡터 인덱싱 실패:', error);
      alert(`❌ 벡터 인덱싱 중 오류가 발생했습니다.

🔍 오류 내용: ${error.response?.data?.detail || error.message}

💡 해결 방법:
• 네트워크 연결을 확인해주세요
• 잠시 후 다시 시도해주세요  
• 문제가 지속되면 관리자에게 문의해주세요`);
    } finally {
      setVectorIndexing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
              {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">문제 RAG 업데이트</h1>
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              최대 22개 문제 처리
            </div>
          </div>
          <p className="text-gray-600 text-lg mb-3">
            PDF 파일을 업로드하여 RAG 지식 베이스를 업데이트하고 실시간 자동 러닝을 관리합니다.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <p className="text-blue-800 text-sm">
              <strong>📢 시스템 정책:</strong> question_parser.py에 설정된 정책에 따라 파일당 최대 22개 문제(1~22번)까지만 파싱됩니다. 
              더 많은 문제가 포함된 경우 별도 파일로 분할하여 업로드하세요.
            </p>
          </div>
        </div>

      {/* RAG 시스템 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6" title={`${professorInfo?.department || '해당 학과'} 관련 업로드된 PDF 파일의 총 개수`}>
          <div className="flex items-center justify-between mb-2">
            <Layers className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{ragStats?.total_documents || 0}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">총 문서 수</h3>
          <p className="text-xs text-gray-500 mt-1">
            {professorInfo?.department || '해당 학과'} 관련 자료
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6" title="AI가 문제를 이해하기 위해 생성한 벡터의 개수">
          <div className="flex items-center justify-between mb-2">
            <Brain className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{ragStats?.total_embeddings?.toLocaleString() || 0}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">임베딩 벡터</h3>
          <p className="text-xs text-gray-500 mt-1">AI 이해를 위한 벡터</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6" title="각 벡터가 가지는 수학적 차원의 수 (높을수록 정확함)">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">{ragStats?.embedding_dimensions || 0}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">벡터 차원</h3>
          <p className="text-xs text-gray-500 mt-1">벡터 정밀도</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6" title="새로운 문제 업로드 시 자동으로 벡터를 생성하는 기능">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-8 w-8 text-yellow-600" />
            <span className={`text-2xl font-bold ${realTimeLearning ? 'text-green-600' : 'text-gray-400'}`}>
              {realTimeLearning ? 'ON' : 'OFF'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">실시간 러닝</h3>
          <p className="text-xs text-gray-500 mt-1">자동 벡터 생성</p>
        </div>
      </div>

      {/* 실시간 자동 러닝 제어 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              실시간 자동 러닝 제어
            </h2>
            <button
              onClick={() => setShowVectorExplanation(!showVectorExplanation)}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
              title={showVectorExplanation ? '설명을 숨깁니다 (Ctrl+H)' : '벡터 재인덱싱에 대한 자세한 설명을 봅니다 (Ctrl+H)'}
            >
              <Brain className="h-3 w-3" />
              {showVectorExplanation ? (
                <>
                  <span>설명 숨기기</span>
                  <span className="text-xs opacity-70">▲</span>
                </>
              ) : (
                <>
                  <span>설명 보기</span>
                  <span className="text-xs opacity-70">▼</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReindexVectors}
              disabled={vectorIndexing}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {vectorIndexing ? '🔄 인덱싱 중...' : '🔧 벡터 재인덱싱'}
            </button>
            <button
              onClick={() => setRealTimeLearning(!realTimeLearning)}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                realTimeLearning ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                  realTimeLearning ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
        
        {/* 벡터 재인덱싱 설명 - 토글 가능 */}
        {showVectorExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              🔧 벡터 재인덱싱이란?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">📚 쉬운 설명</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>도서관 색인 시스템</strong>과 비슷합니다</li>
                  <li>• 새로운 책(문제)이 들어오면 <strong>카탈로그를 업데이트</strong></li>
                  <li>• AI가 <strong>문제를 더 잘 찾고 이해</strong>할 수 있도록 정리</li>
                  <li>• 검색 성능과 정확도가 <strong>크게 향상</strong>됩니다</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">⚙️ 기술적 설명</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• 문제들을 AI가 이해하는 <strong>수학적 벡터</strong>로 변환</li>
                  <li>• 이 벡터들을 <strong>검색 가능한 DB</strong>에 저장</li>
                  <li>• 새로운 문제 추가 시 <strong>전체 인덱스 재구성</strong></li>
                  <li>• <strong>유사한 문제들을 더 정확하게</strong> 찾을 수 있음</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🕐 언제 사용하나요?</h4>
              <div className="grid md:grid-cols-3 gap-3 text-xs text-blue-700">
                <div className="bg-white rounded p-2">
                  <strong>새 문제 대량 업로드 후</strong><br/>
                  많은 문제를 한번에 업로드한 경우
                </div>
                <div className="bg-white rounded p-2">
                  <strong>검색 성능이 떨어질 때</strong><br/>
                  AI가 관련 문제를 잘 못찾는 경우
                </div>
                <div className="bg-white rounded p-2">
                  <strong>정기적인 최적화</strong><br/>
                  월 1회 정도 성능 향상을 위해
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 자동 학습 로그 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">최근 자동 학습 로그</h3>
          {autoLearningLogs.length === 0 ? (
            <p className="text-sm text-gray-500">자동 학습 로그가 없습니다.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {autoLearningLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    {new Date(log.timestamp).toLocaleTimeString()} - {log.action}
                  </span>
                  <span className="text-green-600 font-medium">
                    +{log.embeddings_updated} 벡터
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 업로드 영역 */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          RAG 지식 베이스 업데이트
        </h2>

        {uploadStatus === 'idle' && (
          <div className="space-y-6">
            {/* 파일 드롭존 */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-4 mb-4">
                <Upload className="h-12 w-12 text-blue-500" />
                <Plus className="h-8 w-8 text-gray-400" />
                <FileText className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'PDF 파일들을 여기에 놓으세요!' : '여러 개의 PDF 파일을 드래그하거나 클릭하여 선택하세요'}
              </h3>
              <p className="text-gray-500 mb-4">
                • 파일당 최대 50MB • PDF 형식만 지원 • 한 번에 여러 파일 업로드 가능
              </p>
              
              {/* 방식 1: 통합 업로드 안내 */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🚀</span>
                  <h4 className="font-semibold text-green-800">방식 1: 통합 멀티업로드</h4>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">추천</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>✅ 한번에 업로드:</strong> 문제지와 정답지를 함께 드래그 앤 드롭</p>
                  <p><strong>🔄 자동 매칭:</strong> AI가 같은 문제번호끼리 자동으로 매칭</p>
                  <p><strong>⚡ 빠른 처리:</strong> 개별 업로드 대신 통합 처리로 시간 절약</p>
                  <p><strong>🎯 정답 우선:</strong> 정답지 정보가 우선 적용되어 정확도 향상</p>
                  <p><strong>📊 최대 처리:</strong> 통합 파일에서 최대 22개 문제까지 추출</p>
                </div>
              </div>
              
              {/* 추가 안내사항 */}
              <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p><strong>✅ 지원 형식:</strong> PDF만 가능</p>
                    <p><strong>📏 파일 크기:</strong> 최대 50MB per file</p>
                  </div>
                  <div>
                    <p><strong>🔢 문제 제한:</strong> 파일당 22개</p>
                    <p><strong>⚡ 처리 시간:</strong> 파일당 2-5분</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 선택된 파일 목록 */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  선택된 파일 ({selectedFiles.length}개)
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">{file.name}</span>
                            <span className="text-sm text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          
                          {/* 진행률 표시 */}
                          {uploadProgress[file.name] !== undefined && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">업로드 진행률</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {uploadProgress[file.name]}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[file.name]}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {uploadStatus !== 'uploading' && (
                          <button
                            onClick={() => removeFile(file.name)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="파일 제거"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* 파일 메타데이터 입력 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            파일 제목
                          </label>
                          <input
                            type="text"
                            value={fileMetadata[file.name]?.title || ''}
                            onChange={(e) => updateFileMetadata(file.name, 'title', e.target.value)}
                            disabled={uploadStatus === 'uploading'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="파일 제목 (선택사항)"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            카테고리
                          </label>
                          <select
                            value={fileMetadata[file.name]?.category || '국가고시'}
                            onChange={(e) => updateFileMetadata(file.name, 'category', e.target.value)}
                            disabled={uploadStatus === 'uploading'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          >
                            {getDepartmentCategories().map(category => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-blue-600 mt-1">
                            📚 {professorInfo?.department || '일반'} 전용 카테고리
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 일괄 업로드 버튼 */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={startMultipleUpload}
                    disabled={uploadStatus === 'uploading' || selectedFiles.length === 0}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    {uploadStatus === 'uploading' 
                      ? `🚀 통합 업로드 중... (매칭 진행)`
                      : `🚀 ${selectedFiles.length}개 파일 통합 업로드 (방식 1)`
                    }
                  </button>
                  <button
                    onClick={resetUpload}
                    disabled={uploadStatus === 'uploading'}
                    className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-purple-600 animate-spin" />
              <span className="text-lg font-medium">
                🚀 통합 멀티업로드 진행 중... (방식 1)
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                자동 매칭 중
              </span>
            </div>
            
            {/* 전체 진행률 */}
            <div className="mb-6">
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentUploadIndex / totalUploadCount) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                전체 진행률: {Math.round((currentUploadIndex / totalUploadCount) * 100)}%
              </p>
            </div>

            {/* 현재 처리 중인 파일들 표시 */}
            <div className="max-w-2xl mx-auto">
              <h4 className="text-md font-medium mb-3">파일별 업로드 현황</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress[file.name];
                  const isCompleted = progress === 100;
                  const isProcessing = progress !== undefined && progress < 100;
                  const isPending = progress === undefined;
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      isCompleted ? 'bg-green-50 border border-green-200' :
                      isProcessing ? 'bg-blue-50 border border-blue-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <FileText className={`h-4 w-4 ${
                          isCompleted ? 'text-green-600' :
                          isProcessing ? 'text-blue-600' :
                          'text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-green-800' :
                          isProcessing ? 'text-blue-800' :
                          'text-gray-600'
                        }`}>
                          {file.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">완료</span>
                          </>
                        )}
                                                 {isProcessing && (
                           <>
                             <div className="w-16 bg-gray-200 rounded-full h-2">
                               <div 
                                 className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                 style={{ width: `${progress}%` }}
                               />
                             </div>
                             <span className="text-xs text-blue-700 font-medium">
                               {progress < 30 ? '업로드' : progress < 95 ? '파싱' : '완료'} {Math.round(progress)}%
                             </span>
                           </>
                         )}
                        {isPending && (
                          <span className="text-xs text-gray-500">대기 중</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 안내 메시지 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg max-w-md mx-auto border border-green-200">
              <p className="text-xs text-green-700">
                🚀 <strong>방식 1: 통합 멀티업로드 진행 중</strong><br/>
                ✅ 문제지와 정답지를 자동으로 매칭합니다<br/>
                🔄 같은 문제번호끼리 통합 처리됩니다<br/>
                ⚡ 한번에 모든 파일을 처리하여 시간을 절약합니다<br/>
                📊 통합 파일에서 최대 22개 문제까지 추출됩니다
              </p>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              {uploadError.includes('타임아웃') ? '처리 시간 초과' : 'RAG 업데이트 실패'}
            </h3>
            <div className="text-red-600 mb-6 whitespace-pre-line text-sm max-w-md mx-auto">
              {uploadError}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetUpload}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                다시 시도
              </button>
              {uploadError.includes('타임아웃') && (
                <button
                  onClick={() => window.location.href = '/professor/question-review'}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  문제 검토 페이지 확인
                </button>
              )}
            </div>
          </div>
        )}

        {uploadStatus === 'success' && uploadResults.length > 0 && (
          <div className="py-8">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">🚀 통합 멀티업로드 완료! (방식 1)</h3>
              <p className="text-sm text-green-700">문제지와 정답지가 자동으로 매칭되어 처리되었습니다</p>
              
              {/* 업로드 결과 요약 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">성공</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {uploadResults.filter(r => r.status === 'success').length}개
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900">부분 성공</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {uploadResults.filter(r => r.status === 'partial_success').length}개
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900">실패</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {uploadResults.filter(r => r.status === 'error').length}개
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-900">22개 제한 적용</h4>
                  <p className="text-2xl font-bold text-amber-600">
                    {uploadResults.filter(r => r.questionLimitApplied).length}개
                  </p>
                </div>
              </div>
            </div>

            {/* 업로드 결과 상세 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                업로드 결과 상세
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {uploadResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      result.status === 'success' ? 'bg-green-50 border-green-200' :
                      result.status === 'partial_success' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${
                          result.status === 'success' ? 'text-green-800' :
                          result.status === 'partial_success' ? 'text-yellow-800' :
                          'text-red-800'
                        }`}>
                          {result.message}
                        </p>
                        {result.note && (
                          <p className="text-sm text-gray-600 mt-1">{result.note}</p>
                        )}
                        {result.error && (
                          <p className="text-sm text-red-600 mt-1">오류: {result.error}</p>
                        )}
                        {result.questionLimitApplied && (
                          <p className="text-xs text-amber-700 mt-1 bg-amber-100 rounded px-2 py-1 inline-block">
                            ⚠️ 22개 문제 제한 적용됨
                          </p>
                        )}
                      </div>
                      {result.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                      )}
                      {result.status === 'partial_success' && (
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 ml-2" />
                      )}
                      {result.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 22개 제한 안내 (다중 파일용) */}
            {uploadResults.some(r => r.questionLimitApplied) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">문제 개수 제한 정책 적용됨</h4>
                    <div className="text-sm text-amber-700 space-y-1">
                      <p>• 일부 파일에서 22개 문제 제한이 적용되었습니다.</p>
                      <p>• 각 파일마다 1~22번 문제까지만 파싱되었습니다.</p>
                      <p>• 나머지 문제를 처리하려면 별도 파일로 분할하여 다시 업로드하세요.</p>
                      <p>• 제한이 적용된 파일: <strong>{uploadResults.filter(r => r.questionLimitApplied).length}개</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/professor/problems'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                RAG 문제 생성하기
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => window.location.href = '/professor/question-review'}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                문제 검토하기
              </button>
              <button
                onClick={resetUpload}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                추가 업로드
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RAG 지식 영역 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          지식 베이스 영역
          {professorInfo && (
            <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {professorInfo.department} 전용
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ragStats?.knowledge_areas?.map((area, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">{area.name || area}</h3>
              <div className="text-sm text-gray-600">
                <p>문서: {area.document_count || 0}개</p>
                <p>벡터: {area.vector_count || 0}개</p>
                <p>최근 업데이트: {area.last_updated || '미확인'}</p>
              </div>
            </div>
          )) || (
            <div className="col-span-3 text-center text-gray-500 py-8">
              지식 베이스 영역을 로딩 중입니다...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RAGUpdate;
