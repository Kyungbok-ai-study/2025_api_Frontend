/**
 * 문제 검토 및 승인 페이지
 * 교수가 AI가 파싱한 문제들을 검토하고 수정한 후 승인하는 페이지입니다.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  RefreshCw, 
  Upload, 
  CheckCircle, 
  Check, 
  X, 
  Edit3, 
  Save,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react';
import apiClient from '../../services/api.js';

const QuestionReview = () => {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editData, setEditData] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 옵션 객체를 배열로 변환하는 헬퍼 함수
  const optionsToArray = (options) => {
    if (!options || typeof options !== 'object') return [];
    
    // options가 이미 배열인 경우
    if (Array.isArray(options)) return options;
    
    // options가 객체인 경우 {"1": "선택지1", "2": "선택지2"} 형태
    const sortedKeys = Object.keys(options).sort((a, b) => parseInt(a) - parseInt(b));
    return sortedKeys.map(key => options[key]);
  };

  // 배열을 옵션 객체로 변환하는 헬퍼 함수
  const arrayToOptions = (optionsArray) => {
    if (!Array.isArray(optionsArray)) return {};
    
    const options = {};
    optionsArray.forEach((option, index) => {
      options[String(index + 1)] = option;
    });
    return options;
  };

  // 문제 필터링
  const filteredQuestions = questions.filter(question => {
    // 카테고리 필터
    if (selectedCategory !== 'all' && question.file_category !== selectedCategory) {
      return false;
    }
    
    // 검색어 필터
    if (searchTerm && !question.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !question.file_title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // 사용 가능한 카테고리 목록
  const availableCategories = [...new Set(questions.map(q => q.file_category || '일반'))].sort();

  // 정답 표시용 헬퍼 함수
  const getCorrectAnswerDisplay = (question) => {
    const optionsArray = optionsToArray(question.options);
    const correctAnswer = question.correct_answer;
    
    // 정답이 번호 형태인지 확인 (예: "1", "2", "3", "4")
    if (correctAnswer && /^[1-5]$/.test(correctAnswer)) {
      const index = parseInt(correctAnswer) - 1;
      if (optionsArray[index]) {
        return `${correctAnswer}. ${optionsArray[index]}`;
      }
    }
    
    // 정답이 실제 선택지 내용인 경우 그대로 반환
    return correctAnswer || '정답 없음';
  };

  // 옵션이 정답인지 확인하는 헬퍼 함수
  const isCorrectOption = (question, option, index) => {
    const correctAnswer = question.correct_answer;
    
    // 정답이 번호 형태인 경우 (예: "1", "2", "3", "4")
    if (correctAnswer && /^[1-5]$/.test(correctAnswer)) {
      return parseInt(correctAnswer) === index + 1;
    }
    
    // 정답이 실제 선택지 내용인 경우
    return correctAnswer === option;
  };

  // 정답 검증 함수
  const validateQuestion = (question) => {
    const errors = [];
    
    if (!question.content || question.content.trim() === '') {
      errors.push('문제 내용이 비어있습니다');
    }
    
    if (!question.correct_answer || question.correct_answer.trim() === '') {
      errors.push('정답이 설정되지 않았습니다');
    }
    
    const options = question.options || editData.options;
    const optionsArray = Array.isArray(options) ? options : optionsToArray(options);
    
    if (optionsArray.length === 0) {
      errors.push('선택지가 없습니다');
    }
    
    return errors;
  };

  // 문제 목록 로드 (실제 API 연동)
  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      // 특정 문제 ID가 URL 파라미터로 전달된 경우
      const questionId = searchParams.get('question');
      if (questionId) {
        const response = await apiClient.get(`/professor/questions/${questionId}/detail`);
        if (response.data.question) {
          setQuestions([response.data.question]);
        }
      } else {
        // 모든 대기 중인 문제 조회
        const response = await apiClient.get('/professor/questions/pending');
        if (response.data.questions) {
          setQuestions(response.data.questions);
        }
      }
    } catch (error) {
      console.error('문제 목록 로드 실패:', error);
      // 에러 시 빈 배열로 설정
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadQuestions();
      }, 30000); // 30초마다 새로고침
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  // 문제 선택/해제
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  // 문제 수정 시작
  const startEditQuestion = (question) => {
    setEditingQuestion(question.id);
    setEditData({
      content: question.content,
      description: question.description || [],
      options: optionsToArray(question.options), // 배열로 변환
      correct_answer: question.correct_answer,
      subject: question.subject,
      area_name: question.area_name,
      difficulty: question.difficulty
    });
  };

  // 문제 수정 저장
  const saveQuestionEdit = async () => {
    if (!editingQuestion) return;

    // 정답 검증
    const currentQuestion = { ...editData };
    const errors = validateQuestion(currentQuestion);
    
    if (errors.length > 0) {
      alert('❌ 수정 실패:\n\n' + errors.join('\n'));
      return;
    }

    try {
      // 백엔드 QuestionUpdateRequest 스키마에 맞춰 데이터 전송
      const requestData = {
        question_id: editingQuestion, // 백엔드 스키마에서 필수 필드
        content: editData.content,
        // description은 배열 형태여야 함
        description: editData.description ? 
          (Array.isArray(editData.description) ? editData.description : [editData.description]) 
          : null,
        options: arrayToOptions(editData.options), // 객체로 변환하여 전송
        correct_answer: editData.correct_answer,
        subject: editData.subject,
        area_name: editData.area_name,
        difficulty: editData.difficulty
      };

      // undefined 필드 제거 (백엔드에서 Optional 필드는 null/undefined일 수 있음)
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined) {
          delete requestData[key];
        }
      });

      console.log('📝 문제 수정 요청:');
      console.log('- 문제 ID (URL):', editingQuestion);
      console.log('- 요청 데이터:', JSON.stringify(requestData, null, 2));
      console.log('- API 엔드포인트:', `/professor/questions/${editingQuestion}`);
      
      const response = await apiClient.put(`/professor/questions/${editingQuestion}`, requestData);
      
      if (response.data.success) {
        // 로컬 상태 업데이트 (백엔드에서 받은 형태로)
        const updatedData = {
          ...editData,
          options: arrayToOptions(editData.options) // 객체 형태로 저장
        };
        
        setQuestions(prev => prev.map(q => 
          q.id === editingQuestion 
            ? { ...q, ...updatedData }
            : q
        ));
        
        setEditingQuestion(null);
        setEditData({});
        alert('✅ 문제가 수정되었습니다.');
      } else {
        alert('❌ 문제 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('문제 수정 실패:', error);
      
      // 에러 메시지 개선
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => {
            if (typeof err === 'string') return err;
            if (err.msg) return err.msg;
            if (err.message) return err.message;
            if (err.loc && err.msg) return `${err.loc.join('.')}: ${err.msg}`;
            return JSON.stringify(err);
          }).join('\n');
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ 문제 수정에 실패했습니다:\n\n${errorMessage}\n\n상태 코드: ${error.response?.status || 'N/A'}`);
    }
  };

  // 문제 수정 취소
  const cancelEdit = () => {
    setEditingQuestion(null);
    setEditData({});
  };

  // 일괄 승인/거부
  const bulkApprove = async (action) => {
    if (selectedQuestions.length === 0) {
      alert('처리할 문제를 선택해주세요.');
      return;
    }

    // 승인할 경우 정답 검증
    if (action === 'approve') {
      const invalidQuestions = selectedQuestions.filter(questionId => {
        const question = questions.find(q => q.id === questionId);
        const errors = validateQuestion(question);
        return errors.length > 0;
      });

      if (invalidQuestions.length > 0) {
        alert(`❌ 승인 실패\n\n다음 문제들에 오류가 있습니다:\n- ${invalidQuestions.length}개 문제에 정답 또는 내용이 누락됨\n\n먼저 문제를 수정한 후 승인해주세요.`);
        return;
      }
    }

    const confirmMessage = action === 'approve' 
      ? `선택된 ${selectedQuestions.length}개 문제를 승인하시겠습니까?`
      : `선택된 ${selectedQuestions.length}개 문제를 거부하시겠습니까?`;

    if (!confirm(confirmMessage)) return;

    try {
      const response = await apiClient.post('/professor/questions/approve', {
        question_ids: selectedQuestions,
        action: action
      });
      
      if (response.data.success) {
        // 처리된 문제들을 목록에서 제거
        setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
        setSelectedQuestions([]);
        

        
        alert(`✅ ${selectedQuestions.length}개 문제가 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
      } else {
        alert('❌ 처리에 실패했습니다: ' + response.data.message);
      }
    } catch (error) {
      console.error('일괄 처리 실패:', error);
      alert('❌ 처리 중 오류가 발생했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">문제 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              문제 검토 및 승인
              {questions.length > 0 && (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  {questions.length}개 대기중
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-2">
              AI가 파싱한 문제들을 검토하고 수정한 후 승인하세요. {autoRefresh && <span className="text-green-600">• 자동 새로고침 중 (30초마다)</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              자동 새로고침
            </label>
            <button
              onClick={loadQuestions}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <button
              onClick={() => window.location.href = '/professor/rag-update'}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              문제 업로드
            </button>
          </div>
        </div>
      </div>

      {/* 필터링 및 검색 */}
      {questions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🔍 문제 필터링 및 검색
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📁 카테고리별 필터
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체 카테고리 ({questions.length}개)</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category} ({questions.filter(q => (q.file_category || '일반') === category).length}개)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 문제 내용 또는 파일명 검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="문제 내용이나 파일명으로 검색..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {searchTerm && (
            <div className="mt-3 text-sm text-gray-600">
              📊 검색 결과: <strong>{filteredQuestions.length}개</strong> 문제가 검색되었습니다.
            </div>
          )}
        </div>
      )}

      {/* 통계 및 일괄 처리 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{filteredQuestions.length}</p>
              <p className="text-sm text-gray-500">표시된 문제</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{selectedQuestions.length}</p>
              <p className="text-sm text-gray-500">선택된 문제</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{availableCategories.length}</p>
              <p className="text-sm text-gray-500">카테고리 수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{questions.length}</p>
              <p className="text-sm text-gray-500">총 문제 수</p>
            </div>
          </div>

          {/* 일괄 처리 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={toggleSelectAll}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {selectedQuestions.length === filteredQuestions.length ? '전체 해제' : '전체 선택'}
            </button>
            <button
              onClick={() => bulkApprove('approve')}
              disabled={selectedQuestions.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              일괄 승인
            </button>
            <button
              onClick={() => bulkApprove('reject')}
              disabled={selectedQuestions.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              일괄 거부
            </button>
          </div>
        </div>
      </div>

      {/* 문제 목록 */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">검토할 문제가 없습니다</h3>
            <p className="text-gray-500 mb-6">
              RAG 업데이트 페이지에서 PDF 파일을 업로드하면 파싱된 문제들이 여기에 표시됩니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/professor/rag-update'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                RAG 업데이트 하러 가기
              </button>
              <button
                onClick={loadQuestions}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                새로고침
              </button>
            </div>
          </div>
        ) : (
          filteredQuestions.map((question) => {
            const validationErrors = validateQuestion(question);
            const hasErrors = validationErrors.length > 0;
            
            return (
              <div key={question.id} className={`bg-white rounded-xl shadow-lg border overflow-hidden ${hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        {/* 파일 정보 */}
                        <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              📄 {question.file_title || '제목 없음'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-blue-700">
                            <span className="flex items-center gap-1">
                              📁 카테고리: {question.file_category || '일반'}
                            </span>
                            <span className="flex items-center gap-1">
                              📝 문제 #{question.question_number}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {question.subject}
                          </span>
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {question.area_name}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            question.difficulty === '하' ? 'bg-green-100 text-green-800' :
                            question.difficulty === '중' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                          {hasErrors && (
                            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              검증 오류
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingQuestion === question.id ? (
                        <>
                          <button
                            onClick={saveQuestionEdit}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            title="저장"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                            title="취소"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditQuestion(question)}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                          title="수정"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 검증 오류 표시 */}
                  {hasErrors && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        승인 전 수정 필요
                      </div>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 문제 내용 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">문제</label>
                    {editingQuestion === question.id ? (
                      <textarea
                        value={editData.content || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="문제 내용을 입력하세요..."
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900">{question.content || '문제 내용이 없습니다'}</p>
                      </div>
                    )}
                  </div>

                  {/* 문제 설명/지문 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">문제 설명/지문</label>
                    {editingQuestion === question.id ? (
                      <div className="space-y-2">
                        {(editData.description || []).map((desc, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={desc}
                              onChange={(e) => {
                                const newDescription = [...(editData.description || [])];
                                newDescription[index] = e.target.value;
                                setEditData(prev => ({ ...prev, description: newDescription }));
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`설명 ${index + 1}`}
                            />
                            <button
                              onClick={() => {
                                const newDescription = (editData.description || []).filter((_, i) => i !== index);
                                setEditData(prev => ({ ...prev, description: newDescription }));
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newDescription = [...(editData.description || []), ''];
                            setEditData(prev => ({ ...prev, description: newDescription }));
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + 설명 추가
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {question.description && question.description.length > 0 ? (
                          question.description.map((desc, index) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  지문 {index + 1}
                                </span>
                              </div>
                              <p className="text-gray-800">{desc}</p>
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                            <p className="text-gray-500 text-sm">설명/지문이 없습니다</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 난이도 설정 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
                    {editingQuestion === question.id ? (
                      <select
                        value={editData.difficulty || '중'}
                        onChange={(e) => setEditData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="하">하 (쉬움)</option>
                        <option value="중">중 (보통)</option>
                        <option value="상">상 (어려움)</option>
                      </select>
                    ) : (
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        question.difficulty === '하' ? 'bg-green-100 text-green-800' :
                        question.difficulty === '중' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty === '하' ? '하 (쉬움)' :
                         question.difficulty === '중' ? '중 (보통)' :
                         '상 (어려움)'}
                      </div>
                    )}
                  </div>

                  {/* 선택지 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">선택지</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(() => {
                        // 현재 옵션 배열 가져오기
                        const currentOptions = editingQuestion === question.id 
                          ? editData.options || [] 
                          : optionsToArray(question.options);
                        
                        return currentOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {editingQuestion === question.id ? (
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(editData.options || [])];
                                  newOptions[index] = e.target.value;
                                  setEditData(prev => ({ ...prev, options: newOptions }));
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`선택지 ${String.fromCharCode(65 + index)}`}
                              />
                            ) : (
                              <span className={`flex-1 p-2 rounded ${
                                isCorrectOption(question, option, index) ? 'bg-green-100 text-green-800 font-medium' : 'bg-gray-50 text-gray-700'
                              }`}>
                                {option}
                              </span>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* 정답 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">정답</label>
                    {editingQuestion === question.id ? (
                      <select
                        value={editData.correct_answer || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, correct_answer: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">정답 선택</option>
                        {(editData.options || []).map((option, index) => (
                          <option key={index} value={option}>{String.fromCharCode(65 + index)}. {option}</option>
                        ))}
                      </select>
                    ) : (
                      <div className={`p-3 rounded-lg border ${
                        question.correct_answer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <span className={`font-medium ${
                          question.correct_answer ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {getCorrectAnswerDisplay(question)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuestionReview; 