<template>
    <div class="database-status">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              데이터베이스 상태
              <v-spacer></v-spacer>
              <v-btn
                icon
                @click="fetchDatabaseStatus"
                :loading="loading"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            
            <v-card-text>
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>상태</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        :color="getStatusColor(dbStatus.status)"
                        dark
                        small
                      >
                        {{ dbStatus.status }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
  
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>연결 수</v-list-item-title>
                    <v-list-item-subtitle>{{ dbStatus.connections }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
  
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>활성 트랜잭션</v-list-item-title>
                    <v-list-item-subtitle>{{ dbStatus.active_transactions }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
  
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>데이터베이스 크기</v-list-item-title>
                    <v-list-item-subtitle>{{ formatSize(dbStatus.size) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
  
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>마지막 백업</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(dbStatus.last_backup) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
  
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              테이블 통계
            </v-card-title>
            
            <v-card-text>
              <v-data-table
                :headers="tableHeaders"
                :items="dbStatus.tables"
                :loading="loading"
                hide-default-footer
                class="elevation-1"
              >
                <template v-slot:item="{ item }">
                  <tr>
                    <td>{{ item.name }}</td>
                    <td>{{ item.rows }}</td>
                    <td>{{ formatSize(item.size) }}</td>
                    <td>{{ item.last_update }}</td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
  
          <v-card class="mt-4">
            <v-card-title>
              성능 모니터링
            </v-card-title>
            
            <v-card-text>
              <v-chart :options="chartOptions" style="width: 100%; height: 300px;" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 백업 다이얼로그 -->
      <v-dialog v-model="backupDialog" max-width="500px">
        <v-card>
          <v-card-title>
            데이터베이스 백업
            <v-spacer></v-spacer>
            <v-btn icon @click="backupDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="backupForm" v-model="valid">
              <v-text-field
                v-model="backupName"
                label="백업 이름"
                required
              ></v-text-field>
              <v-checkbox
                v-model="includeData"
                label="데이터 포함"
              ></v-checkbox>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="createBackup"
              :loading="backupLoading"
            >
              백업 시작
            </v-btn>
            <v-btn
              color="grey darken-1"
              text
              @click="backupDialog = false"
            >
              취소
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import moment from 'moment'
  import 'echarts'
  import ECharts from 'vue-echarts'
  
  export default {
    name: 'DatabaseStatus',
    components: {
      'v-chart': ECharts
    },
    data() {
      return {
        loading: false,
        backupDialog: false,
        backupLoading: false,
        valid: true,
        backupName: '',
        includeData: true,
        dbStatus: {
          status: 'unknown',
          connections: 0,
          active_transactions: 0,
          size: 0,
          last_backup: null,
          tables: []
        },
        tableHeaders: [
          { text: '테이블명', value: 'name' },
          { text: '행 수', value: 'rows' },
          { text: '크기', value: 'size' },
          { text: '마지막 업데이트', value: 'last_update' }
        ],
        chartOptions: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: ['쿼리 수', '응답 시간']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: []
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '쿼리 수',
              type: 'line',
              stack: '총량',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: []
            },
            {
              name: '응답 시간',
              type: 'line',
              stack: '총량',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: []
            }
          ]
        }
      }
    },
    methods: {
      formatDate(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
      },
      formatSize(bytes) {
        if (!bytes) return '0 B'
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
      },
      getStatusColor(status) {
        const colors = {
          'online': 'success',
          'offline': 'error',
          'maintenance': 'warning',
          'unknown': 'grey'
        }
        return colors[status] || 'grey'
      },
      async fetchDatabaseStatus() {
        try {
          this.loading = true
          const token = localStorage.getItem('admin_token')
          const response = await axios.get('http://localhost:8000/api/admin/database/status', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          this.dbStatus = response.data
          this.updateChart(response.data.performance)
        } catch (error) {
          console.error('Failed to fetch database status:', error)
        } finally {
          this.loading = false
        }
      },
      updateChart(performance) {
        if (!performance) return
  
        this.chartOptions.xAxis[0].data = performance.timestamps
        this.chartOptions.series[0].data = performance.queries
        this.chartOptions.series[1].data = performance.response_times
      },
      async createBackup() {
        if (this.$refs.backupForm.validate()) {
          try {
            this.backupLoading = true
            const token = localStorage.getItem('admin_token')
            await axios.post('http://localhost:8000/api/admin/database/backup', {
              name: this.backupName,
              include_data: this.includeData
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })
            
            this.backupDialog = false
            this.fetchDatabaseStatus()
          } catch (error) {
            console.error('Failed to create backup:', error)
          } finally {
            this.backupLoading = false
          }
        }
      }
    },
    created() {
      this.fetchDatabaseStatus()
      // 실시간 업데이트를 위해 30초마다 데이터를 새로 가져옵니다
      this.updateInterval = setInterval(this.fetchDatabaseStatus, 30000)
    },
    beforeUnmount() {
      clearInterval(this.updateInterval)
    }
  }
  </script>
  
  <style scoped>
  .database-status {
    padding: 20px;
  }
  </style>