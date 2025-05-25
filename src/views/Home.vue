<template>
  <div class="home">
    <h1>경복대학교 학습 지원 플랫폼</h1>
    <div v-if="loading">서버 연결 확인 중...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div class="success-message">백엔드 서버가 정상적으로 연결되었습니다!</div>
      <div class="server-info">
        <h2>서버 정보</h2>
        <p>{{ serverInfo }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  data() {
    return {
      loading: true,
      error: null,
      serverInfo: null
    }
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:8000/')
      this.serverInfo = response.data
      this.loading = false
    } catch (err) {
      this.error = '백엔드 서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.'
      this.loading = false
      console.error('Error:', err)
    }
  }
}
</script>

<style scoped>
.home {
  margin-top: 60px;
  padding: 20px;
}

.success-message {
  color: #42b983;
  font-size: 1.2em;
  margin: 20px 0;
  padding: 10px;
  background-color: #f0f9f4;
  border-radius: 4px;
}

.server-info {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  color: #34495e;
}

h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}
</style> 