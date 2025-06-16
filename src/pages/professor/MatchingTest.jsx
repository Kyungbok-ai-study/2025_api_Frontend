import React, { useState, useEffect } from 'react';

const MatchingTest = () => {
  const [matchingData, setMatchingData] = useState({
    professor: {
      id: 1,
      name: "김교수",
      school: "경복대학교",
      department: "물리치료학과"
    },
    students: [
      {
        student_id: 1,
        student_name: "물리치료 학생",
        student_school: "경복대학교",
        student_department: "물리치료학과",
        match_status: "approved",
        test_count: 8,
        recent_score: 85,
        activity_status: "active",
        diagnosis_stats: {
          night_tests: 8,
          recent_24h: 3,
          avg_score: 87.5
        }
      },
      {
        student_id: 2,
        student_name: "새벽활동 학생",
        student_school: "경복대학교", 
        student_department: "물리치료학과",
        match_status: "approved",
        test_count: 12,
        recent_score: 92,
        activity_status: "active",
        diagnosis_stats: {
          night_tests: 9,
          recent_24h: 5,
          avg_score: 90.2
        }
      }
    ],
    pending_matches: [
      {
        match_id: 3,
        student_name: "간호학 학생",
        student_school: "경복대학교",
        student_department: "간호학과",
        match_status: "pending"
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎯 학교-학과 매칭 테스트
          </h1>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg inline-block">
            교수: {matchingData.professor.name} ({matchingData.professor.school} - {matchingData.professor.department})
          </div>
        </div>

        {/* 매칭된 학생들 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            ✅ 승인된 학생 ({matchingData.students.length}명)
          </h2>
          
          <div className="space-y-4">
            {matchingData.students.map((student) => {
              const isNightActive = student.diagnosis_stats.night_tests >= 7;
              const isMatched = student.student_school === matchingData.professor.school && 
                               student.student_department === matchingData.professor.department;
              
              return (
                <div
                  key={student.student_id}
                  className={`p-4 rounded-xl border-l-4 ${
                    isNightActive ? 'border-purple-500 bg-purple-50' : 'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        isNightActive ? 'bg-purple-600' : 'bg-green-600'
                      }`}>
                        {student.student_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center space-x-2">
                          <span>{student.student_name}</span>
                          {isNightActive && <span>🌙</span>}
                          {isMatched && <span className="text-green-600">✅</span>}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center space-x-3">
                          <span className="font-medium">{student.student_school}</span>
                          <span>•</span>
                          <span>{student.student_department}</span>
                          <span>•</span>
                          <span>{student.test_count}회 테스트</span>
                          {student.diagnosis_stats.night_tests > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600 font-medium">
                                🌙 새벽 {student.diagnosis_stats.night_tests}회
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded text-white ${
                            isMatched ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isMatched ? '✅ 학교-학과 매칭 성공' : '❌ 학교-학과 불일치'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {student.recent_score}점
                      </div>
                      <div className="text-sm text-gray-500">
                        평균: {student.diagnosis_stats.avg_score}점
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 대기 중인 매칭 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            ⏳ 매칭 대기 중 ({matchingData.pending_matches.length}명)
          </h2>
          
          <div className="space-y-3">
            {matchingData.pending_matches.map((match) => {
              const isSchoolMatch = match.student_school === matchingData.professor.school;
              const isDeptMatch = match.student_department === matchingData.professor.department;
              const isFullMatch = isSchoolMatch && isDeptMatch;
              
              return (
                <div key={match.match_id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{match.student_name}</div>
                      <div className="text-sm text-gray-600 flex items-center space-x-3">
                        <span className={isSchoolMatch ? 'text-green-600 font-medium' : 'text-red-600'}>
                          {match.student_school} {isSchoolMatch ? '✅' : '❌'}
                        </span>
                        <span>•</span>
                        <span className={isDeptMatch ? 'text-green-600 font-medium' : 'text-red-600'}>
                          {match.student_department} {isDeptMatch ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-1 rounded text-white ${
                          isFullMatch ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {isFullMatch ? '✅ 자동 승인 가능' : '⚠️ 다른 학과 (수동 검토 필요)'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                        ✅ 승인
                      </button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                        ❌ 거부
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 매칭 통계 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {matchingData.students.filter(s => 
                s.student_school === matchingData.professor.school && 
                s.student_department === matchingData.professor.department
              ).length}
            </div>
            <div className="text-sm text-green-700">완벽 매칭</div>
          </div>
          
          <div className="bg-yellow-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {matchingData.pending_matches.length}
            </div>
            <div className="text-sm text-yellow-700">대기 중</div>
          </div>
          
          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {matchingData.students.filter(s => s.diagnosis_stats.night_tests >= 7).length}
            </div>
            <div className="text-sm text-purple-700">새벽 활동 감지</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingTest; 