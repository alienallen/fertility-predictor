<template>
  <view class="page">
    <view class="header">
      <text class="greeting">{{ greeting }}</text>
      <text class="date">{{ currentDate }}</text>
    </view>
    
    <view class="content">
      <view class="placeholder">
        <text>首页内容待开发</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const currentDate = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #F8F8F8;
}

.header {
  padding: 40rpx 30rpx 30rpx;
  background-color: #FFFFFF;
  
  .greeting {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
  }
  
  .date {
    font-size: 26rpx;
    color: #999;
  }
}

.content {
  padding: 30rpx;
  
  .placeholder {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
  }
}
</style>
