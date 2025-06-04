import React, { useState, useRef } from 'react';
import apiClient from '../../../services/api';

const ProfileImageUpload = ({ user, onImageUpdate, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await apiClient.post('/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('프로필 사진이 성공적으로 업로드되었습니다.');
      
      // 사용자 정보 업데이트 (서버에서 받은 최신 사용자 정보 사용)
      if (onImageUpdate && response.data.user) {
        onImageUpdate(response.data.user);
      }
      
      onClose();
    } catch (error) {
      console.error('업로드 실패:', error);
      alert(error.response?.data?.detail || '프로필 사진 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!user?.profile_image) {
      alert('삭제할 프로필 사진이 없습니다.');
      return;
    }

    if (!window.confirm('현재 프로필 사진을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete('/auth/delete-profile-image');
      alert('프로필 사진이 성공적으로 삭제되었습니다.');
      
      // 사용자 정보 업데이트 (프로필 이미지 제거)
      if (onImageUpdate) {
        onImageUpdate(null);
      }
      
      onClose();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert(error.response?.data?.detail || '프로필 사진 삭제에 실패했습니다.');
    }
  };

  // 현재 프로필 이미지 URL 생성 (캐시 무효화를 위한 타임스탬프 추가)
  const getCurrentProfileImageUrl = () => {
    if (!user?.profile_image_url) return null;
    const timestamp = new Date().getTime();
    return `http://localhost:8000${user.profile_image_url}?t=${timestamp}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 w-[600px] max-w-full mx-4 shadow-2xl transform animate-slideUp">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 ml-4">프로필 사진 변경</h3>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 현재 프로필 사진 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">현재 프로필 사진</h4>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profile_image_url ? (
                  <img 
                    src={getCurrentProfileImageUrl()}
                    alt="현재 프로필" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div style={{ display: user?.profile_image_url ? 'none' : 'block' }}>
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {user?.profile_image_url && (
                <button
                  onClick={handleDeleteImage}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  현재 사진 삭제
                </button>
              )}
            </div>
          </div>

          {/* 새 프로필 사진 업로드 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">새 프로필 사진</h4>
            
            {/* 드래그 앤 드롭 영역 */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragActive 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="space-y-4">
                  <img 
                    src={preview} 
                    alt="미리보기" 
                    className="w-32 h-32 mx-auto rounded-full object-cover"
                  />
                  <p className="text-sm text-gray-600">클릭하여 다른 파일 선택</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">파일을 드래그하거나 클릭하여 선택</p>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG, GIF (최대 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex space-x-4 mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              selectedFile && !uploading
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                업로드 중...
              </div>
            ) : (
              '사진 업로드'
            )}
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

export default ProfileImageUpload; 