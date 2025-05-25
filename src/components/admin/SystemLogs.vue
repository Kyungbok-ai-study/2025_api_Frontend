<template>
  <div class="system-logs">
    <v-card>
      <v-card-title>
        시스템 로그
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="검색"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="logs"
        :search="search"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ formatDate(item.timestamp) }}</td>
            <td>
              <v-chip
                :color="getLevelColor(item.level)"
                dark
                small
              >
                {{ item.level }}
              </v-chip>
            </td>
            <td>{{ item.message }}</td>
            <td>{{ item.source }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'SystemLogs',
  data() {
    return {
      search: '',
      loading: false,
      headers: [
        { text: '시간', value: 'timestamp' },
        { text: '레벨', value: 'level' },
        { text: '메시지', value: 'message' },
        { text: '소스', value: 'source' }
      ],
      logs: []
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    getLevelColor(level) {
      const colors = {
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info',
        DEBUG: 'success'
      }
      return colors[level] || 'grey'
    },
    async fetchLogs() {
      try {
        this.loading = true
        const token = localStorage.getItem('admin_token')
        const response = await axios.get('http://localhost:8000/api/admin/logs/system', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.logs = response.data
      } catch (error) {
        console.error('Failed to fetch system logs:', error)
      } finally {
        this.loading = false
      }
    }
  },
  created() {
    this.fetchLogs()
    // 실시간 업데이트를 위해 30초마다 로그를 새로 가져옵니다
    this.updateInterval = setInterval(this.fetchLogs, 30000)
  },
  beforeUnmount() {
    clearInterval(this.updateInterval)
  }
}
</script>

<style scoped>
.system-logs {
  padding: 20px;
}
</style> 