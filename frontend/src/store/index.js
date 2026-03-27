import { reactive, readonly } from 'vue';

const state = reactive({
  openid: null,
  user: null,
  isLoggedIn: false,
  cycleLength: 28,
  periodLength: 5
});

const actions = {
  setOpenid(openid) {
    state.openid = openid;
    uni.setStorageSync('openid', openid);
  },
  setUser(user) {
    state.user = user;
    state.cycleLength = user?.cycle_length || 28;
    state.periodLength = user?.period_length || 5;
    state.isLoggedIn = true;
  },
  updateSettings(cycleLength, periodLength) {
    state.cycleLength = cycleLength;
    state.periodLength = periodLength;
  },
  initFromStorage() {
    const openid = uni.getStorageSync('openid');
    if (openid) {
      state.openid = openid;
      state.isLoggedIn = true;
    }
  },
  logout() {
    state.openid = null;
    state.user = null;
    state.isLoggedIn = false;
    uni.removeStorageSync('openid');
  }
};

export const store = {
  state: readonly(state),
  ...actions
};