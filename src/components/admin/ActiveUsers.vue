<template>
  <div class="active-users">
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <template v-slot:header>
            <v-card-title>
              현재 활성 사용자
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="검색"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
          </template>

          <v-data-table
            :headers="headers"
            :items="activeUsers"
            :search="search"
            :loading="loading"
            class="elevation-1"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.student_id }}</td>
                <td>{{ item.name }}</td>
                <td>
                  <v-chip
                    :color="getActivityColor(item.status)"
                    dark
                    small
                  >
                    {{ item.status }}
                  </v-chip>
                </td>
                <td>{{ formatDate(item.last_activity) }}</td>
                <td>{{ formatDuration(item.duration) }}</td>
              </tr>
            </template>

            <template v-slot:footer>
              <v-card-text>
                <div class="text-h6 mb-2">실시간 통계</div>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>총 활성 사용자</v-list-item-title>
                      <v-list-item-subtitle>{{ statistics.totalActive }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>학습 중</v-list-item-title>
                      <v-list-item-subtitle>{{ statistics.studying }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>과제 수행 중</v-list-item-title>
                      <v-list-item-subtitle>{{ statistics.doingAssignment }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-text>
            <div class="text-h6 mb-2">활동 분포</div>
            <v-chart :options="chartOptions" style="width: 100%; height: 300px;" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import 'echarts'
import ECharts from 'vue-echarts'

export default {
  name: 'ActiveUsers',
  components: {
    'v-chart': ECharts
  },
  data() {
    return {
      search: '',
      loading: false,
      headers: [
        { text: '학번', value: 'student_id' },
        { text: '이름', value: 'name' },
        { text: '현재 활동', value: 'status' },
        { text: '마지막 활동', value: 'last_activity' },
        { text: '세션 시간', value: 'duration' }
      ],
      activeUsers: [],
      statistics: {
        totalActive: 0,
        studying: 0,
        doingAssignment: 0
      },
      chartOptions: {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: []
        }]
      }
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('HH:mm:ss')
    },
    formatDuration(minutes) {
      if (!minutes) return '0분'
      if (minutes < 60) return `${minutes}분`
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}시간 ${remainingMinutes}분`
    },
    getActivityColor(status) {
      const colors = {
        '학습 중': 'success',
        '과제 수행 중': 'info',
        '휴식 중': 'warning',
        '자리비움': 'grey'
      }
      return colors[status] || 'grey'
    },
    async fetchActiveUsers() {
      try {
        this.loading = true
        const token = localStorage.getItem('admin_token')
        const response = await axios.get('http://localhost:8000/api/admin/active-users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        this.activeUsers = response.data.users
        this.updateStatistics(response.data.statistics)
        this.updateChart(response.data.statistics)
      } catch (error) {
        console.error('Failed to fetch active users:', error)
      } finally {
        this.loading = false
      }
    },
    updateStatistics(stats) {
      this.statistics = {
        totalActive: stats.total_active,
        studying: stats.studying,
        doingAssignment: stats.doing_assignment
      }
    },
    updateChart(stats) {
      this.chartOptions.series[0].data = [
        { value: stats.studying, name: '학습 중' },
        { value: stats.doing_assignment, name: '과제 수행 중' },
        { value: stats.total_active - (stats.studying + stats.doing_assignment), name: '기타' }
      ]
    }
  },
  created() {
    this.fetchActiveUsers()
    // 실시간 업데이트를 위해 10초마다 데이터를 새로 가져옵니다
    this.updateInterval = setInterval(this.fetchActiveUsers, 10000)
  },
  beforeUnmount() {
    // Clear the interval when component is destroyed
    clearInterval(this.updateInterval)
  }
}
</script>

<style scoped>
.active-users {
  padding: 20px;
}
</style>
