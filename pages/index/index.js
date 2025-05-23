const CONFIG = {
  API_BASE_URL: 'https://momecho.work',
  // API_BASE_URL: 'http://43.154.199.91:8000',
  TIMEOUT_DURATION: 8 * 60 * 1000 // 8分钟，单位为毫秒
};

Page({
  data: {
    phoneNumber: '', // 存储用户输入的手机号
    name: '', // 存储用户输入的姓名
    // ... 其他数据
  },

  // 监听姓名输入
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 监听手机号输入
  onPhoneInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 登录
  handleLogin() {
    const { phoneNumber, name } = this.data;
    console.log(phoneNumber, name);
    
    // 检查手机号和姓名是否都有值
    if (!phoneNumber || !name) {
      wx.showToast({
        title: '请填写手机号和姓名',
        icon: 'none'
      });
      return;
    }

    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 随机确定聊天模型
    const chatModel = Math.random() > 0.5 ? "professional" : "gentle";
    console.log(`为用户分配聊天模型: ${chatModel}`);

    // 调用后端接口注册用户
    wx.request({
      url: `${CONFIG.API_BASE_URL}/api/users/create_user`,
      method: 'POST',
      data: {
        phone: parseInt(phoneNumber),
        name: name,
        chat_model: chatModel // 将聊天模型传递给后端
      },
      success: (res) => {
        console.log('注册成功:', res);
        
        // 登录成功后的处理
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
              wx.reLaunch({
                url: `/pages/chatBot/chatBot?phoneNumber=${encodeURIComponent(phoneNumber)}&name=${encodeURIComponent(name)}&chatModel=${encodeURIComponent(chatModel)}`,
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
      fail: (err) => {
        console.error('注册失败:', err);
        wx.showToast({
          title: '注册失败，请重试',
          icon: 'none'
        });
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
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: 'Mom Echo - 专为新手妈妈设计的AI支持小助手',
      path: '/pages/index/index',
      imageUrl: '/imgs/1.jpg'
    }
  },

  // 处理退出
  handleExit() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出小程序吗？',
      success: (res) => {
        if (res.confirm) {
          wx.exitMiniProgram();
        }
      }
    });
  }
});
