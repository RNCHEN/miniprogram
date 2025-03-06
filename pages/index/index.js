Page({
  data: {
    phoneNumber: '' // 存储用户输入的手机号
  },

  // 监听手机号输入
  onPhoneInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 登录
  handleLogin() {
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(this.data.phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 这里需要调用后端接口验证
    console.log('登录手机号:', this.data.phoneNumber);
    // TODO 调用后端接口验证


    // 登录成功后的处理
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/chatBot/chatBot',
            fail: (err) => {
              console.error('跳转失败:', err);
              wx.showToast({
                title: '跳转失败',
                icon: 'none'
              });
            }
          });
        }, 1500);
      }
    });
  },

  expandAgent: function () {
    this.setData({ agentExpand: !this.data.agentExpand })
  },
  expandModel: function () {
    this.setData({ modelExpand: !this.data.modelExpand })
  },
  goChatBot: function () {
    wx.navigateTo({
      url: '/pages/chatBot/chatBot',
    })
  },
  scrollToAnchor: function (e) {
    // 获取点击的锚点 ID
    const anchorId = e.currentTarget.dataset.anchor;
    // 使用 wx.createSelectorQuery() 获取锚点元素的位置
    const query = wx.createSelectorQuery();
    query.select('#' + anchorId).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      if (res[0]) {
        // 获取锚点元素距离页面顶部的距离
        const scrollTop = res[1].scrollTop + res[0].top;
        // 使用 wx.pageScrollTo 方法将页面滚动到锚点位置
        wx.pageScrollTo({
          scrollTop: scrollTop,
          duration: 300 // 滚动动画的持续时间，单位为毫秒
        });
      }
    });
  },
  copyUrl: function () {
    wx.setClipboardData({
      data: "https://tcb.cloud.tencent.com/dev",
      success: function (res) {
        wx.showToast({
          title: '链接复制成功',
          icon: 'success'
        });
      },
      fail: function (err) {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },
  onHandlePhoneLogin(e) {
    const detail = e.detail;
    if (detail.errCode) {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
      console.log('phoneOneClickLogin errCode:', detail.errCode);
      return;
    }

    if (detail.code) {
      console.log('Got phone login code:', detail.code);
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    }
  },

  getPhoneMask() {
    wx.getPhoneMask({
      success: (res) => {
        console.log('Got phone mask:', res.mask);
      },
      fail: (err) => {
        console.error('Failed to get phone mask:', err);
        wx.showToast({
          title: '获取手机号失败',
          icon: 'none'
        });
      }
    });
  }
});
