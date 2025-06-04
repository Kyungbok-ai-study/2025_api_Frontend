import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

const VerificationHistory = ({ user, onClose }) => {
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerificationHistory();
  }, []);

  const loadVerificationHistory = async () => {
    try {
      const response = await apiClient.get('/auth/verification-history');
      setVerificationHistory(response.data);
    } catch (error) {
      console.error('인증 기록 조회 실패:', error);
      // 오류 시 빈 배열로 설정
      setVerificationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        label: '검토중'
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        label: '승인됨'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        label: '거절됨'
      }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const getTypeText = (type) => {
    return type === 'student' ? '재학생 인증' : '교수 인증';
  };

  const currentRoleText = {
    'student': '재학생',
    'professor': '교수',
    'admin': '관리자',
    'unverified': '미인증유저'
  }[user?.role] || '미인증유저';

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-[600px] max-w-full mx-4 shadow-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-500"></div>
            <span className="ml-4 text-gray-700">인증 기록을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 w-[700px] max-w-full mx-4 shadow-2xl transform animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 ml-4">학교 인증 기록</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 현재 상태 */}
        <div className={`border rounded-xl p-4 mb-6 ${
          user?.role === 'unverified' 
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center mb-2">
            <svg className={`w-5 h-5 mr-2 ${
              user?.role === 'unverified' ? 'text-yellow-600' : 'text-green-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {user?.role === 'unverified' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              )}
            </svg>
            <p className={`font-medium ${
              user?.role === 'unverified' ? 'text-yellow-900' : 'text-green-900'
            }`}>
              {user?.role === 'unverified' ? '인증 대기 중' : '인증 완료'}
            </p>
          </div>
          <p className={`text-sm ${
            user?.role === 'unverified' ? 'text-yellow-700' : 'text-green-700'
          }`}>
            현재 역할: <span className="font-semibold">{currentRoleText}</span>
          </p>
          <p className={`text-xs mt-1 ${
            user?.role === 'unverified' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {user?.role === 'unverified' 
              ? '인증 완료 후 모든 서비스를 이용하실 수 있습니다.'
              : '모든 서비스를 정상적으로 이용하실 수 있습니다.'
            }
          </p>
        </div>

        {/* 인증 기록 목록 */}
        <div className="space-y-6">
          {verificationHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">인증 기록이 없습니다.</p>
            </div>
          ) : (
            verificationHistory.map((record) => (
              <div key={record.id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                {/* 기록 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <span className="text-blue-700 font-bold text-sm">#{record.requestNumber}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{getTypeText(record.verificationType)}</h4>
                      <p className="text-sm text-gray-500">신청번호: {record.requestNumber}</p>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>

                {/* 날짜 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium mb-1">신청일시</p>
                    <p className="text-sm text-gray-900">{formatDate(record.submittedAt)}</p>
                  </div>
                  {record.reviewedAt && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        {record.status === 'approved' ? '승인일시' : '거절일시'}
                      </p>
                      <p className="text-sm text-gray-900">{formatDate(record.reviewedAt)}</p>
                    </div>
                  )}
                </div>

                {/* 신청 사유 */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">신청 사유</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {record.reason}
                  </p>
                </div>

                {/* 검토자 코멘트 또는 거부 사유 */}
                {(record.reviewerComment || record.rejectionReason) && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {record.status === 'approved' ? '승인 메시지' : '거부 사유'}
                    </p>
                    <div className={`p-3 rounded-lg border ${
                      record.status === 'approved' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-sm ${
                        record.status === 'approved' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {record.status === 'approved' 
                          ? (record.reviewerComment || '관리자가 승인하였습니다.')
                          : (record.rejectionReason || record.reviewerComment || '사유 없음')
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* 제출 서류 */}
                {record.documents && record.documents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">제출 서류</p>
                    <div className="space-y-2">
                      {record.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-900">{doc.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatFileSize(doc.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-center pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg font-medium"
          >
            확인
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VerificationHistory; 