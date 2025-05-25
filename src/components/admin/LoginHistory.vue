<template>
  <div class="login-history">
    <v-card>
      <v-card-title>
        로그인 기록
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
        :items="loginHistory"
        :search="search"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ formatDate(item.timestamp) }}</td>
            <td>{{ item.student_id }}</td>
            <td>
              <v-chip
                :color="getStatusColor(item.status)"
                dark
                small
              >
                {{ item.status }}
              </v-chip>
            </td>
            <td>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    {{ item.ip_address }}
                  </span>
                </template>
                <span>위치: {{ item.location || '알 수 없음' }}</span>
              </v-tooltip>
            </td>
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

      <!-- 필터 및 통계 -->
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="상태 필터"
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-menu
              ref="dateMenu"
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="dateRangeText"
                  label="날짜 범위"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange"
                range
                no-title
                @input="dateMenu = false"
                @change="applyFilters"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" md="4">
            <v-card outlined>
              <v-card-text>
                <div class="text-h6">총 로그인 시도</div>
                <div class="text-h4">{{ statistics.totalAttempts }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card outlined>
              <v-card-text>
                <div class="text-h6">성공률</div>
                <div class="text-h4">{{ statistics.successRate }}%</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card outlined>
              <v-card-text>
                <div class="text-h6">실패한 시도</div>
                <div class="text-h4">{{ statistics.failedAttempts }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'LoginHistory',
  data() {
    return {
      search: '',
      loading: false,
      headers: [
        { text: '시간', value: 'timestamp' },
        { text: '학번', value: 'student_id' },
        { text: '상태', value: 'status' },
        { text: 'IP 주소', value: 'ip_address' },
        { text: '기기', value: 'device' }
      ],
      loginHistory: [],
      selectedStatus: 'all',
      statusOptions: [
        { text: '전체', value: 'all' },
        { text: '성공', value: 'success' },
        { text: '실패', value: 'failed' }
      ],
      dateMenu: false,
      dateRange: [],
      statistics: {
        totalAttempts: 0,
        successRate: 0,
        failedAttempts: 0
      }
    }
  },
  computed: {
    dateRangeText() {
      if (!this.dateRange || this.dateRange.length !== 2) return ''
      const [start, end] = this.dateRange
      return `${start} ~ ${end}`
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    getStatusColor(status) {
      return status === 'success' ? 'success' : 'error'
    },
    async fetchLoginHistory() {
      try {
        this.loading = true
        const token = localStorage.getItem('admin_token')
        const params = {
          status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
          start_date: this.dateRange[0],
          end_date: this.dateRange[1]
        }
        const response = await axios.get('http://localhost:8000/api/admin/login-history', {
          headers: { Authorization: `Bearer ${token}` },
          params
        })
        this.loginHistory = response.data.history
        this.updateStatistics(response.data.statistics)
      } catch (error) {
        console.error('Failed to fetch login history:', error)
      } finally {
        this.loading = false
      }
    },
    updateStatistics(stats) {
      this.statistics = {
        totalAttempts: stats.total_attempts,
        successRate: ((stats.successful_attempts / stats.total_attempts) * 100).toFixed(1),
        failedAttempts: stats.failed_attempts
      }
    },
    applyFilters() {
      this.fetchLoginHistory()
    }
  },
  created() {
    // 초기 날짜 범위 설정 (최근 7일)
    const end = moment().format('YYYY-MM-DD')
    const start = moment().subtract(7, 'days').format('YYYY-MM-DD')
    this.dateRange = [start, end]
    
    this.fetchLoginHistory()
  }
}
</script>

<style scoped>
.login-history {
  padding: 20px;
}
</style>
