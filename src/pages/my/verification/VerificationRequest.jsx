import React, { useState } from 'react';
import apiClient from '../../../services/api';
import FileUploadDropzone from '../../../components/FileUploadDropzone';

const VerificationRequest = ({ user, onClose, onVerificationRequest }) => {
  const [formData, setFormData] = useState({
    verificationType: 'student', // 'student' 또는 'professor'
    reason: '',
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFilesSelected = (validFiles, fileErrors) => {
    if (fileErrors.length > 0) {
      setErrors(prev => ({ ...prev, files: fileErrors }));
    } else {
      setErrors(prev => ({ ...prev, files: null }));
    }

    if (validFiles.length > 0) {
      const newFiles = validFiles.map((file, index) => ({
        id: Date.now() + index,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type
      }));

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles]
      }));
    }
  };



  const removeFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== fileId)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors = {};
    
    if (!formData.reason.trim()) {
      newErrors.reason = '신청 사유를 입력해주세요.';
    }
    
    if (formData.reason.trim().length < 10) {
      newErrors.reason = '신청 사유는 최소 10자 이상 입력해주세요.';
    }
    
    if (formData.documents.length === 0) {
      newErrors.documents = '최소 1개의 증빙 서류를 업로드해주세요.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      // 파일명과 크기 정보만 전송 (실제 파일 업로드는 별도 구현 필요)
      const documentInfo = formData.documents.map(doc => ({
        name: doc.name,
        size: doc.size,
        type: doc.type,
        uploaded_at: new Date().toISOString()
      }));

      const requestData = {
        verification_type: formData.verificationType,
        reason: formData.reason,
        documents: documentInfo
      };

      console.log('인증 요청 데이터:', requestData);

      // 실제 API 호출
      const response = await apiClient.post('/auth/verification-request', requestData);
      
      console.log('인증 요청 응답:', response.data);
      
      if (response.data.success) {
        alert(`인증 요청이 성공적으로 제출되었습니다.\n요청 번호: ${response.data.request_number}`);
        
        if (onVerificationRequest) {
          onVerificationRequest();
        }
        
        onClose();
      } else {
        alert('인증 요청 제출에 실패했습니다.');
      }
    
    } catch (error) {
      console.error('인증 요청 실패:', error);
      
      let errorMessage = '인증 요청 제출에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Pydantic 유효성 검사 오류
          const validationErrors = error.response.data.detail.map(err => 
            `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
          ).join('\n');
          errorMessage = `입력 데이터 오류:\n${validationErrors}`;
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ 인증 요청 실패:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const currentRole = user?.role;
  const currentRoleText = {
    'student': '재학생',
    'professor': '교수',
    'admin': '관리자',
    'unverified': '미인증유저'
  }[currentRole] || '미인증유저';

  const getDocumentRequirements = () => {
    if (formData.verificationType === 'student') {
      return [
        '재학증명서 (최근 3개월 이내 발급)',
        '학생증 사진 (양면)',
        '성적증명서 (선택사항)',
        '등록금 고지서 (선택사항)'
      ];
    } else {
      return [
        '대학 홈페이지 교수 소개 페이지 캡처',
        '교직원증 사진 (양면)',
        '임용장 또는 재직증명서',
        '강의계획서 (선택사항)'
      ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 w-[600px] max-w-full mx-4 shadow-2xl transform animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 ml-4">학교 인증 신청</h3>
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

        {/* 현재 상태 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-800 text-sm">
              현재 역할: <span className="font-semibold">{currentRoleText}</span> • 
              인증을 통해 모든 서비스를 이용하실 수 있습니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 인증 유형 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">인증 유형</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, verificationType: 'student' }))}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.verificationType === 'student'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <span className="text-2xl mb-2 block">🎓</span>
                  <p className="font-medium">재학생 인증</p>
                  <p className="text-xs text-gray-500 mt-1">재학 중인 학생</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, verificationType: 'professor' }))}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.verificationType === 'professor'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <span className="text-2xl mb-2 block">👨‍🏫</span>
                  <p className="font-medium">교수 인증</p>
                  <p className="text-xs text-gray-500 mt-1">대학 교수/강사</p>
                </div>
              </button>
            </div>
          </div>

          {/* 신청 사유 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              신청 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder={`${formData.verificationType === 'student' ? '재학생' : '교수'} 인증을 신청하는 사유를 자세히 작성해주세요. (최소 10자)`}
              className={`w-full h-32 p-4 border-2 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                errors.reason ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.reason && (
                <p className="text-red-600 text-sm">{errors.reason}</p>
              )}
              <p className="text-gray-500 text-sm ml-auto">
                {formData.reason.length}/1000자
              </p>
            </div>
          </div>

          {/* 필요 서류 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              {formData.verificationType === 'student' ? '재학생' : '교수'} 인증 필요 서류
            </h4>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              {getDocumentRequirements().map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          {/* 파일 업로드 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              증빙 서류 업로드 <span className="text-red-500">*</span>
            </label>
            
            <FileUploadDropzone
              onFilesSelected={handleFilesSelected}
              acceptedFormats={['.jpg', '.jpeg', '.png', '.pdf']}
              maxFileSize={10 * 1024 * 1024} // 10MB
              multiple={true}
              disabled={loading}
              className={errors.documents ? 'border-red-300' : ''}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-gray-600 mb-2">파일을 드래그하여 업로드하거나 클릭하세요</p>
              <div className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 cursor-pointer transition-colors inline-block">
                파일 선택
              </div>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG, PDF 파일만 가능 (최대 10MB)</p>
            </FileUploadDropzone>

            {errors.files && (
              <div className="mt-2 text-red-600 text-sm">
                {errors.files.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {errors.documents && (
              <p className="mt-2 text-red-600 text-sm">{errors.documents}</p>
            )}

            {/* 업로드된 파일 목록 */}
            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h5 className="font-medium text-gray-700">업로드된 파일:</h5>
                {formData.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(doc.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 처리 안내 */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">처리 절차 안내</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
                <span>신청서 및 서류 제출</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
                <span>관리자 검토 (영업일 기준 3-5일)</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
                <span>승인 시 이메일 알림 및 권한 부여</span>
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || formData.documents.length === 0 || !formData.reason.trim() || formData.reason.trim().length < 10}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                !loading && formData.documents.length > 0 && formData.reason.trim() && formData.reason.trim().length >= 10
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  제출 중...
                </div>
              ) : (
                '인증 신청'
              )}
            </button>
          </div>
        </form>
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

export default VerificationRequest; 