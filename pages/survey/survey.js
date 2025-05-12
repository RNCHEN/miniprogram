Page({
    data: {},
  
    onLoad() {
      // 直接加载问卷页面，不需要额外的处理
      console.log('问卷页面加载完成');
    },
  
    // 监听页面卸载
    onUnload() {
      // 页面卸载时的清理工作
      console.log('问卷页面卸载');
    },

    // 跳转到其他小程序
    navigateToOtherMiniProgram() {
      wx.navigateToMiniProgram({
        appId: 'wxd947200f82267e58',
        path: 'pages/wjxqList/wjxqList?activityId=wD7i1cY',
        success(res) {
          console.log('跳转成功', res);
        },
        fail(err) {
          console.error('跳转失败', err);
        }
      });
    }
});