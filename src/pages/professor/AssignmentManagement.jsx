import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignment_type: 'homework',
    subject_name: '',
    due_date: '',
    max_score: 100,
    allow_late_submission: false,
    instructions: ''
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await apiClient.get('/professor/assignments');
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('과제 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAssignment) {
        // 수정
        await apiClient.put(`/professor/assignments/${selectedAssignment.id}`, formData);
        alert('과제가 성공적으로 수정되었습니다.');
        setShowEditModal(false);
      } else {
        // 생성
        await apiClient.post('/professor/assignments', formData);
        alert('과제가 성공적으로 생성되었습니다.');
        setShowCreateModal(false);
      }
      
      resetForm();
      loadAssignments();
    } catch (error) {
      console.error('과제 처리 실패:', error);
      alert(selectedAssignment ? '과제 수정에 실패했습니다.' : '과제 생성에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignment_type: 'homework',
      subject_name: '',
      due_date: '',
      max_score: 100,
      allow_late_submission: false,
      instructions: ''
    });
    setSelectedAssignment(null);
  };

  const handleDetailView = async (assignment) => {
    try {
      const response = await apiClient.get(`/professor/assignments/${assignment.id}`);
      setAssignmentDetail(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('과제 상세 조회 실패:', error);
      alert('과제 상세 정보를 불러오지 못했습니다.');
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      assignment_type: assignment.assignment_type,
      subject_name: assignment.subject_name,
      due_date: assignment.due_date ? assignment.due_date.slice(0, 16) : '',
      max_score: assignment.max_score || 100,
      allow_late_submission: assignment.allow_late_submission || false,
      instructions: assignment.instructions || ''
    });
    setShowEditModal(true);
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      await apiClient.patch(`/professor/assignments/${assignmentId}/status`, {
        status: newStatus
      });
      
      const statusNames = {
        'published': '게시됨',
        'closed': '마감됨',
        'draft': '초안'
      };
      
      alert(`과제가 ${statusNames[newStatus]}로 변경되었습니다.`);
      loadAssignments();
    } catch (error) {
      console.error('과제 상태 변경 실패:', error);
      alert('과제 상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm('정말로 이 과제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await apiClient.delete(`/professor/assignments/${assignmentId}`);
      alert('과제가 삭제되었습니다.');
      loadAssignments();
    } catch (error) {
      console.error('과제 삭제 실패:', error);
      if (error.response?.status === 400) {
        alert('제출물이 있는 과제는 삭제할 수 없습니다.');
      } else {
        alert('과제 삭제에 실패했습니다.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { text: '초안', color: 'bg-gray-100 text-gray-800' },
      'published': { text: '게시됨', color: 'bg-green-100 text-green-800' },
      'closed': { text: '마감됨', color: 'bg-red-100 text-red-800' },
      'graded': { text: '채점완료', color: 'bg-blue-100 text-blue-800' }
    };
    const config = statusConfig[status] || statusConfig['draft'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'homework': { text: '숙제', color: 'bg-blue-100 text-blue-800' },
      'project': { text: '프로젝트', color: 'bg-purple-100 text-purple-800' },
      'quiz': { text: '퀴즈', color: 'bg-yellow-100 text-yellow-800' },
      'exam': { text: '시험', color: 'bg-red-100 text-red-800' }
    };
    const config = typeConfig[type] || typeConfig['homework'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">과제 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/professor')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← 대시보드로 돌아가기
              </button>
              <h1 className="text-xl font-bold text-gray-900">과제 관리</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              + 새 과제 생성
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-500">전체 과제</div>
                </div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {assignments.length}
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-500">게시된 과제</div>
                </div>
                <div className="mt-1 text-2xl font-semibold text-green-600">
                  {assignments.filter(a => a.status === 'published').length}
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-500">마감된 과제</div>
                </div>
                <div className="mt-1 text-2xl font-semibold text-red-600">
                  {assignments.filter(a => a.status === 'closed').length}
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-500">채점 완료</div>
                </div>
                <div className="mt-1 text-2xl font-semibold text-blue-600">
                  {assignments.filter(a => a.status === 'graded').length}
                </div>
              </div>
            </div>
          </div>

          {/* 과제 목록 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">과제 목록</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                생성된 과제들을 관리하고 제출 현황을 확인하세요.
              </p>
            </div>
            
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">📝</div>
                <p className="text-gray-500">생성된 과제가 없습니다.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  첫 과제 생성하기
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <li key={assignment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">{assignment.title}</h4>
                          {getTypeBadge(assignment.assignment_type)}
                          {getStatusBadge(assignment.status)}
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>📚 {assignment.subject_name}</span>
                          {assignment.due_date && (
                            <span>📅 마감: {formatDateTime(assignment.due_date)}</span>
                          )}
                          <span>📊 제출: {assignment.submission_count}건</span>
                          <span>✅ 채점: {assignment.graded_count}건</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          생성일: {assignment.created_at}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleDetailView(assignment)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          상세보기
                        </button>
                        <button 
                          onClick={() => handleEdit(assignment)}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          수정
                        </button>
                        {assignment.status === 'draft' && (
                          <button 
                            onClick={() => handleStatusChange(assignment.id, 'published')}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            게시
                          </button>
                        )}
                        {assignment.status === 'published' && (
                          <button 
                            onClick={() => handleStatusChange(assignment.id, 'closed')}
                            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                          >
                            마감
                          </button>
                        )}
                        {assignment.status === 'draft' && assignment.submission_count === 0 && (
                          <button 
                            onClick={() => handleDelete(assignment.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* 과제 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">새 과제 생성</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">과제 제목</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="과제 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">과목명</label>
                <input
                  type="text"
                  required
                  value={formData.subject_name}
                  onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="과목명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">과제 유형</label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="homework">숙제</option>
                    <option value="project">프로젝트</option>
                    <option value="quiz">퀴즈</option>
                    <option value="exam">시험</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">만점</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_score}
                    onChange={(e) => setFormData({...formData, max_score: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">마감일</label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">과제 설명</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="과제에 대한 간단한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">상세 지시사항</label>
                <textarea
                  rows="4"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="과제 수행을 위한 상세한 지시사항을 입력하세요"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allow_late"
                  checked={formData.allow_late_submission}
                  onChange={(e) => setFormData({...formData, allow_late_submission: e.target.checked})}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="allow_late" className="ml-2 block text-sm text-gray-900">
                  지각 제출 허용
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  과제 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 과제 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">과제 수정</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedAssignment && selectedAssignment.status !== 'draft' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ 게시된 과제는 제목, 설명, 지시사항만 수정할 수 있습니다.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">과제 제목</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">과목명</label>
                <input
                  type="text"
                  required
                  value={formData.subject_name}
                  onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                  disabled={selectedAssignment?.status !== 'draft'}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">과제 유형</label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
                    disabled={selectedAssignment?.status !== 'draft'}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                  >
                    <option value="homework">숙제</option>
                    <option value="project">프로젝트</option>
                    <option value="quiz">퀴즈</option>
                    <option value="exam">시험</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">만점</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_score}
                    onChange={(e) => setFormData({...formData, max_score: parseInt(e.target.value)})}
                    disabled={selectedAssignment?.status !== 'draft'}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">마감일</label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  disabled={selectedAssignment?.status !== 'draft'}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">과제 설명</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">상세 지시사항</label>
                <textarea
                  rows="4"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {selectedAssignment?.status === 'draft' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_late_edit"
                    checked={formData.allow_late_submission}
                    onChange={(e) => setFormData({...formData, allow_late_submission: e.target.checked})}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allow_late_edit" className="ml-2 block text-sm text-gray-900">
                    지각 제출 허용
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  과제 수정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 과제 상세보기 모달 */}
      {showDetailModal && assignmentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">과제 상세보기</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 과제 정보 */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{assignmentDetail.assignment.title}</h3>
                    {getTypeBadge(assignmentDetail.assignment.assignment_type)}
                    {getStatusBadge(assignmentDetail.assignment.status)}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">과목: </span>
                      <span className="text-sm text-gray-900">{assignmentDetail.assignment.subject_name}</span>
                    </div>
                    
                    {assignmentDetail.assignment.description && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">설명: </span>
                        <p className="text-sm text-gray-900 mt-1">{assignmentDetail.assignment.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">만점: </span>
                        <span className="text-sm text-gray-900">{assignmentDetail.assignment.max_score}점</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">지각 제출: </span>
                        <span className="text-sm text-gray-900">
                          {assignmentDetail.assignment.allow_late_submission ? '허용' : '불허'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">생성일: </span>
                        <span className="text-sm text-gray-900">{formatDateTime(assignmentDetail.assignment.created_at)}</span>
                      </div>
                      {assignmentDetail.assignment.due_date && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">마감일: </span>
                          <span className="text-sm text-gray-900">{formatDateTime(assignmentDetail.assignment.due_date)}</span>
                        </div>
                      )}
                    </div>

                    {assignmentDetail.assignment.published_at && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">게시일: </span>
                        <span className="text-sm text-gray-900">{formatDateTime(assignmentDetail.assignment.published_at)}</span>
                      </div>
                    )}

                    {assignmentDetail.assignment.instructions && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">지시사항: </span>
                        <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                          {assignmentDetail.assignment.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 통계 및 제출 현황 */}
              <div className="space-y-6">
                {/* 통계 카드 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-blue-900 mb-3">제출 통계</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">총 제출:</span>
                      <span className="text-sm font-medium text-blue-900">{assignmentDetail.statistics.total_submissions}건</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">채점 완료:</span>
                      <span className="text-sm font-medium text-blue-900">{assignmentDetail.statistics.graded_submissions}건</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">평균 점수:</span>
                      <span className="text-sm font-medium text-blue-900">
                        {(assignmentDetail.statistics?.average_score || 0).toFixed(1)}점
                      </span>
                    </div>
                  </div>
                </div>

                {/* 제출 목록 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">최근 제출물</h4>
                  {assignmentDetail.submissions.length === 0 ? (
                    <p className="text-sm text-gray-500">제출물이 없습니다.</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {assignmentDetail.submissions.slice(0, 10).map((submission) => (
                        <div key={submission.id} className="border-b border-gray-100 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{submission.student_name}</p>
                              <p className="text-xs text-gray-500">@{submission.student_id}</p>
                              <p className="text-xs text-gray-500">{formatDateTime(submission.submitted_at)}</p>
                            </div>
                            <div className="text-right">
                              {submission.score !== null ? (
                                <span className="text-sm font-medium text-green-600">{submission.score}점</span>
                              ) : (
                                <span className="text-sm text-yellow-600">미채점</span>
                              )}
                              {submission.is_late && (
                                <span className="block text-xs text-red-500">지각 제출</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement; 