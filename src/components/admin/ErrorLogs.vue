<template>
  <div class="error-logs">
    <v-card>
      <v-card-title>
        오류 로그
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
        :items="errors"
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
            <td>{{ item.status }}</td>
            <td>
              <v-btn
                icon
                small
                @click="showDetails(item)"
              >
                <v-icon>mdi-information</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- 오류 상세 정보 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          오류 상세 정보
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>시간:</strong> {{ formatDate(selectedError.timestamp) }}
            </v-col>
            <v-col cols="12">
              <strong>심각도:</strong>
              <v-chip
                :color="getLevelColor(selectedError.level)"
                dark
                small
                class="ml-2"
              >
                {{ selectedError.level }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <strong>메시지:</strong>
              <pre class="error-message">{{ selectedError.message }}</pre>
            </v-col>
            <v-col cols="12">
              <strong>스택 트레이스:</strong>
              <pre class="stack-trace">{{ selectedError.stack_trace }}</pre>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="markAsResolved(selectedError.id)"
          >
            해결됨으로 표시
          </v-btn>
          <v-btn
            color="grey darken-1"
            text
            @click="dialog = false"
          >
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'ErrorLogs',
  data() {
    return {
      search: '',
      loading: false,
      dialog: false,
      headers: [
        { text: '시간', value: 'timestamp' },
        { text: '심각도', value: 'severity' },
        { text: '메시지', value: 'message' },
        { text: '소스', value: 'source' },
        { text: '상태', value: 'status' },
        { text: '작업', value: 'actions', sortable: false }
      ],
      errors: [],
      selectedError: {}
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    getLevelColor(level) {
      const colors = {
        CRITICAL: 'deep-purple darken-4',
        HIGH: 'error',
        MEDIUM: 'warning',
        LOW: 'info'
      }
      return colors[level] || 'grey'
    },
    async fetchErrors() {
      try {
        this.loading = true
        const token = localStorage.getItem('admin_token')
        const response = await axios.get('http://localhost:8000/api/admin/logs/errors', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.errors = response.data
      } catch (error) {
        console.error('Failed to fetch error logs:', error)
      } finally {
        this.loading = false
      }
    },
    showDetails(error) {
      this.selectedError = error
      this.dialog = true
    },
    async markAsResolved(errorId) {
      try {
        const token = localStorage.getItem('admin_token')
        await axios.put(`http://localhost:8000/api/admin/logs/errors/${errorId}/resolve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.dialog = false
        this.fetchErrors()
      } catch (error) {
        console.error('Failed to mark error as resolved:', error)
      }
    }
  },
  created() {
    this.fetchErrors()
    // 실시간 업데이트를 위해 30초마다 오류를 새로 가져옵니다
    this.updateInterval = setInterval(this.fetchErrors, 30000)
  },
  beforeUnmount() {
    clearInterval(this.updateInterval)
  }
}
</script>

<style scoped>
.error-logs {
  padding: 20px;
}
.error-message {
  white-space: pre-wrap;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
}
.stack-trace {
  white-space: pre-wrap;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
  font-family: monospace;
  font-size: 12px;
}
</style>
