Page({
    data: {},
  
    onLoad() {
      // 获取存储的用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo) {
        wx.showToast({
          title: '用户信息不存在',
          icon: 'none'
        });
        return;
      }

      // 注册问卷完成的回调函数
      wx.window.surveyCompleted = () => {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
          // 问卷完成后自动跳转到 chatBot 页面
          wx.reLaunch({
            url: `/pages/chatBot/chatBot?phoneNumber=${encodeURIComponent(userInfo.phoneNumber)}&name=${encodeURIComponent(userInfo.name)}`,
            success: () => {
              // 清除存储的数据
              wx.removeStorageSync('userInfo');
            }
          });
        }
      };
    },
  
    // 监听页面卸载
    onUnload() {
      // 清理回调函数
      if (wx.window.surveyCompleted) {
        delete wx.window.surveyCompleted;
      }
    }
  });