// pages/chatBot/chatBot.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    agentConfig: {
      type: "bot", // 值为'bot'或'model'。当type='bot'时，botId必填；当type='model'时，modelName和model必填
      botId: "bot-e7d1e736", // agent id
      modelName: "deepseek", // 大模型服务商 //
      model: "deepseek-v3", // 具体的模型版本 //
      logo: "https://docs.cloudbase.net/img/logo.svg", // 图标(只在model模式下生效)
      welcomeMessage: "欢迎使用健康小助手!", // 欢迎语(只在model模式下生效)
      allowWebSearch: true, // 允许界面呈现联网配置开关
    },
    phoneNumber: '',
    name: '',
    chatModel: '',
    // 添加一个标志来控制是否显示调试信息
    showDebugInfo: true
  },

  // modelName: "hunyuan-open", // 大模型服务商
  // model: "hunyuan-lite", // 具体的模型版本

  // modelName: "deepseek", // 大模型服务商
  // model: "deepseek-r1", // 具体的模型版本

  // modelName: "deepseek", // 大模型服务商
  // model: "deepseek-v3", // 具体的模型版本
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('chatBot onLoad 接收到的参数:', options);
    
    const { phoneNumber, name, chatModel } = options;
    
    // 验证接收到的数据
    console.log('接收到的手机号:', phoneNumber);
    console.log('接收到的姓名:', name);
    console.log('接收到的聊天模型:', chatModel);
    
    // 将接收到的数据存储在页面的 data 中
    this.setData({
      'agentConfig.welcomeMessage': '新的欢迎语!',
      'phoneNumber': phoneNumber || '',
      'name': name || '',
      'chatModel': chatModel || ''
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  // 添加一个方法来切换调试信息的显示
  toggleDebugInfo() {
    this.setData({
      showDebugInfo: !this.data.showDebugInfo
    });
  }
});
