// components/agent-ui/index.js
import {
  guide,
  checkConfig,
  randomSelectInitquestion
} from "./tools";

// 在组件外部定义全局配置变量
const CONFIG = {
  // API_BASE_URL: 'https://momecho.work',
  API_BASE_URL: 'http://127.0.0.1:8000',
  TIMEOUT_DURATION: 2 * 60 * 1000 // 8分钟，单位为毫秒
};

Component({
  properties: {
    showBotAvatar: {
      type: Boolean,
      value: false,
    },
    agentConfig: {
      type: Object,
      value: {
        type: "", // 值为'bot'或'model'。当type='bot'时，botId必填；当type='model'时，model必填
        botId: "", // agent id
        modelName: "", // 大模型服务商
        model: "", // 具体的模型版本
        logo: "", // 图标(只在model模式下生效)
        welcomeMessage: "有什么事情都可以和我说哦", // 欢迎语(只在model模式下生效)
        allowWebSearch: Boolean,
      },
    },
    phoneNumber: {
      type: String,
      value: ''
    },
    name: {
      type: String,
      value: ''
    },
    chatModel: String // 添加 chatModel 属性
  },

  observers: {
    showWebSearchSwitch: function (showWebSearchSwitch) {
      this.setData({
        showFeatureList: showWebSearchSwitch,
      });
    },
    showTools: function (isShow) {
      console.log('showTools', isShow)
      if (isShow) {
        this.setData({
          footerHeight: this.data.footerHeight + 80,
        });
      } else {
        this.setData({
          footerHeight: this.data.footerHeight - 80,
        });
      }
    },
    showFileList: function (isShow) {
      console.log('showFileList', isShow)
      if (isShow) {
        this.setData({
          footerHeight: this.data.footerHeight + 80,
        });
      } else {
        this.setData({
          footerHeight: this.data.footerHeight - 80,
        });
      }
    },
    showFeatureList: function (isShow) {
      console.log('showFeatureList', isShow)
      if (isShow) {
        this.setData({
          footerHeight: this.data.footerHeight + 30,
        });
      } else {
        const subHeight = this.data.footerHeight - 30
        this.setData({
          footerHeight: subHeight >= 80 ? subHeight : 80,
        });
      }
    },
  },

  data: {
    isLoading: true, // 判断是否尚在加载中
    article: {},
    windowInfo: wx.getWindowInfo(),
    bot: {},
    inputValue: "",
    output: "",
    chatRecords: [],
    scrollTop: 0,
    setPanelVisibility: false,
    questions: [],
    scrollTop: 0,
    guide,
    showGuide: false,
    imageList: [],
    scrollTop: 0, // 文字撑起来后能滚动的最大高度
    viewTop: 0, // 根据实际情况，可能用户手动滚动，需要记录当前滚动的位置
    scrollTo: "", // 快速定位到指定元素，置底用
    scrollTimer: null, //
    manualScroll: false, // 当前为手动滚动/自动滚动
    showTools: false, // 展示底部工具栏
    showFileList: false, // 展示输入框顶部文件行
    showTopBar: false, // 展示顶部bar
    sendFileList: [],
    footerHeight: 73,
    lastScrollTop: 0,
    enableUpload: false, // 文件待支持
    showWebSearchSwitch: false,
    useWebSearch: false,
    showFeatureList: false,
    chatStatus: 0, // 页面状态： 0-正常状态，可输入，可发送， 1-发送中 2-思考中 3-输出content中
    triggered: false,
    page: 1,
    size: 10,
    total: 0,
    refreshText: '欢迎您的使用',
    contentHeightInScrollViewTop: 0, // scroll区域顶部固定区域高度
    shouldAddScrollTop: false,
    displayPhoneNumber: '',
    displayName: '',
    showRating: true, // 一开始就显示评分
    emotionRating: '',
    scaleRating: null,
    timer: null,
    secondRatingShown: false, // 标记第二次评分是否已显示
    firstRatingTitle: '现在，我们希望你回想⼀下你作为新⼿妈妈所经历的那些让你感到担忧或焦虑的时刻。请尽可能详细地回忆⼀个具体的情境或事件。\n例如，这个事件可能与以下⽅⾯相关：\n• 情感上的担忧： 如对宝宝的照顾感到不安，或感到孤独和缺乏⽀持。\n• 经济上的压⼒： 如养育孩⼦的费⽤、家庭开⽀增加或⼯作与育⼉的平衡问题。\n• 健康上的顾虑： 如⾃⼰的身体恢复问题、宝宝的健康状况或喂养的困难。\n请花⼀些时间来仔细回忆这个事件，并尝试回想当时你具体感受到的情绪（例如：焦虑、害怕、⽆助等）。\n当你做好准备后，请完成以下评分，这将帮助我们的健康⼩助⼿更好地理解你的感受，并为你提供更个性化的帮助。请放⼼，您的隐私和填写内容将得到严格保护，不会被泄露或⽤于未经授权的⽤途。',
    secondRatingTitle: '⾮常感谢你与健康⼩助⼿的互动！希望我们的对话能够为你带来⼀些安慰与⽀持。\n为了帮助我们更好地了解你在与⼩助⼿交流后的感受与想法，我们邀请你再⼀次填写以下评分表。这不仅能帮助我们优化服务，还能让你更清楚地看到⾃⼰的情绪变化与改善。\n现在，请根据你的当前感受，完成以下评分。⽆论你的情绪是否有所好转，我们都⾮常珍视你的反馈。谢谢你的参与与信任！',
    // 欢迎消息
    customWelcomeMessage: '感谢你分享你的感受。我们的健康小助手随时在这里支持你。你可以：\n\n 向小助手倾诉你的担忧与压力，表达你的情绪与想法。\n\n 提出你在育儿过程中遇到的具体问题或困惑。\n\n 询问与健康、情感支持或日常护理相关的建议。\n\n我们的小助手会根据你的感受和需求，提供更贴合你情况的个性化帮助。希望能为你带来更多的支持与安慰。\n\n请随时与健康小助手开始对话。',
    // 情绪强度选项
    emotionOptions: [
      { value: '1', label: '1-完全没有' },
      { value: '2', label: '2-⾮常轻微' },
      { value: '3', label: '3-轻微' },
      { value: '4', label: '4-中等' },
      { value: '5', label: '5-较强烈' },
      { value: '6', label: '6-⾮常强烈' },
      { value: '7', label: '7-极其强烈' }
    ],
    // 情绪状态选项
    scaleOptions: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
    // 第二次问卷的问题
    firstQuestion: {
      first: '请根据你刚刚回忆的事件，评价你此刻感受到的情绪强度。',
      second: '请回想你之前提到的那个让你感到担忧或焦虑的事件。现在，当你再次回忆起这个事件时，你的情绪感受是怎样的？'
    },
    secondQuestion: {
      first: '请评价你当前的整体情绪状态。请根据你现在整体上感到多么积极或消极，在下⽅的评分表中选择最符合的分数。',
      second: '现在，请评价你在与⼩助⼿互动后的整体情绪状态。请根据你此刻整体上感到多么积极或消极，在下⽅的评分表中选择最符合的分数。'
    },
  },

  attached: async function () {
    console.log('attached  this.data', this.data)
    console.log('attached', this.properties)
    const { botId, type } = this.data.agentConfig;

    // 检查配置
    const [check, message] = checkConfig(this.data.agentConfig);
    console.log('attached  check', check)
    console.log('attached  message', message)
    console.log('attached  type', type)

    // 使用传入的聊天模型

    //   url: `https://momecho.work/api/chatRecords/${this.properties.phoneNumber}`,




    
    const chatModel =
    console.log(`使用聊天模型: ${chatModel}`);
    
    this.setData({
      chatModel: chatModel
    });

    // 根据不同的用户mode来设置不同的欢迎消息
    // let customWelcomeMessage = '感谢你分享你的感受。我们的健康小助手随时在这里支持你。你可以：\n\n• 向小助手倾诉你的担忧与压力，表达你的情绪与想法。\n• 提出你在育儿过程中遇到的具体问题或困惑。\n• 询问与健康、情感支持或日常护理相关的建议。\n\n我们的小助手会根据你的感受和需求，提供更贴合你情况的个性化帮助。希望能为你带来更多的支持与安慰。\n\n请随时与健康小助手开始对话。';
    let res = null;
    // try {
    //   res = await new Promise((resolve, reject) => {
    //     wx.request({
    //       url: 'https://momecho.work/api/users/${phoneNumber}', // 替换为你的后端 API 地址
    //       method: 'GET',
    //       header: {
    //         'Content-Type': 'application/json',
    //       },
    //       success: (response) => {
    //         if (response.statusCode === 200) {
    //           resolve(response.data);
    //         } else {
    //           console.error("HTTP 错误:", response.statusCode);
    //           reject(new Error("HTTP 错误: " + response.statusCode));
    //         }
    //       },
    //       fail: (error) => {
    //         console.error("请求失败:", error);
    //         reject(error);
    //       }
    //     });
    //   });
    // } catch (error) {
    //   console.error('请求失败:', error);
    //   res = {
    //     response: "网络连接失败"
    //   }; // 发生错误时，提供默认值
    // }
    const responseMessage = res.response || "hello world";
    //  get the user mode
    // TODO test

    // get chatRecords here 
    let chatRecordsRes = null;
    let chatRecords = [];
    try {
      chatRecordsRes = await new Promise((resolve, reject) => {
        wx.request({
          url: `https://momecho.work/api/chatRecords/${this.properties.phoneNumber}`, // 使用模板字符串构建 URL
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
          },
          success: (response) => {
            if (response.statusCode === 200) {
              resolve(response.data);
            } else {
              console.error("HTTP 错误:", response.statusCode);
              reject(new Error("HTTP 错误: " + response.statusCode));
            }
          },
          fail: (error) => {
            console.error("请求失败:", error);
            reject(error);
          }
        });
      });

      // 处理获取到的聊天记录
      chatRecords = chatRecordsRes || [];
      console.log('获取到的聊天记录:', chatRecords);
      this.setData({
        chatRecords: chatRecords // 将聊天记录存储到组件的状态中
      });
    } catch (error) {
      console.error('请求失败:', error);
    }

    console.log('attached  chatRecords', chatRecords)
    const welcomeMessage = {
      content: this.data.customWelcomeMessage, // 设置欢迎消息
      record_id: "record_id" + String(+new Date() + 10),
      role: "assistant",
      hiddenBtnGround: false,
    };

    this.setData({
      chatRecords: [welcomeMessage, ...chatRecords], // 将欢迎消息添加到聊天记录
    });


    console.log('attached  chatRecords', chatRecords)
    const topHeight = await this.calculateContentInTop();
    console.log('topHeight', topHeight);
    this.setData({
      contentHeightInScrollViewTop: topHeight
    });

    // 在组件加载时使用传递的参数
    const { phoneNumber, name } = this.properties;

    console.log(' attached 接收到的手机号:', phoneNumber);
    console.log(' attached 接收到的姓名:', name);

    // 你可以在这里使用这些参数，例如更新组件的状态
    this.setData({
      // 例如，更新显示的内容
      displayPhoneNumber: phoneNumber,
      displayName: name
    });

    console.log('attached displayPhoneNumber', this.data.displayPhoneNumber)
    console.log('attached displayName', this.data.displayName)

    // 监听聊天记录变化
    this._observer = this.createIntersectionObserver();
    this._observer
      .relativeToViewport()
      .observe('.system', (res) => {
        if (res.intersectionRatio > 0 && !this.data.showRating) {
          // 当第一条机器人消息出现在视图中时显示评分
          this.setData({
            showRating: true
          });
        }
      });
    
    // 开始计时， 8分钟 后显示第二次评分
    const timer = setTimeout(() => {
      console.log('8min已到，显示第二次评分');
      if (!this.data.secondRatingShown) {
        this.setData({
          showRating: true,
          secondRatingShown: true,
          emotionRating: '', // 重置评分
          scaleRating: null
        });
      }
    }, CONFIG.TIMEOUT_DURATION); // 8分钟
    
    this.setData({ timer });

    // 在组件创建时初始化超时定时器
    this.timeoutTimer = setTimeout(() => {
      console.log('会话超时，准备跳转到 survey 页面');
      wx.navigateTo({
        url: '/pages/survey/survey',
        success: () => {
          console.log('成功跳转到 survey 页面');
        },
        fail: (err) => {
          console.error('跳转到 survey 页面失败:', err);
        }
      });
    }, CONFIG.TIMEOUT_DURATION);
  },

  detached: function() {
    if (this._observer) this._observer.disconnect();
    
    // 清除计时器
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  methods: {
    // 滚动相关处理
    calculateContentHeight() {
      return new Promise((resolve) => {
        const query = wx.createSelectorQuery().in(this);
        query
          .selectAll(".main >>> .system, .main >>> .userContent")
          .boundingClientRect((rects) => {
            let totalHeight = 0;
            rects.forEach((rect) => {
              totalHeight += rect.height;
            });
            resolve(totalHeight);
          })
          .exec();
      });
    },
    calculateContentInTop() {
      console.log('执行top 部分计算')
      return new Promise((resolve) => {
        const query = wx.createSelectorQuery().in(this);
        query
          .selectAll(
            ".main >>> .nav, .main >>> .tips"
          )
          .boundingClientRect((rects) => {
            let totalHeight = 0;
            rects.forEach((rect) => {
              totalHeight += rect.height;
            });
            // console.log('top height', totalHeight);
            resolve(totalHeight);
          })
          .exec();
      });
    },
    onWheel: function (e) {
      // 解决小程序开发工具中滑动
      if (!this.data.manualScroll && e.detail.deltaY < 0) {
        this.setData({
          manualScroll: true,
        });
      }
    },
    onScroll: function (e) {
      if (e.detail.scrollTop < this.data.lastScrollTop) {
        // 鸿蒙系统上可能滚动事件，拖动事件失效，兜底处理
        this.setData({
          manualScroll: true,
        });
      }

      this.setData({
        lastScrollTop: e.detail.scrollTop,
      });

      // 针对连续滚动的最后一次进行处理，scroll-view的 scroll end事件不好判定
      if (this.data.scrollTimer) {
        clearTimeout(this.data.scrollTimer);
      }
      const {
        scrollTop,
        scrollHeight,
        height
      } = e.detail;

      this.setData({
        scrollTimer: setTimeout(() => {
          // console.log(
          //   'e.detail.scrollTop data.scrollTop',
          //   scrollTop,
          //   this.data.scrollTop,
          //   this.data.manualScroll
          // );
          const newTop = Math.max(this.data.scrollTop, e.detail.scrollTop);
          if (this.data.manualScroll) {
            this.setData({
              scrollTop: newTop,
            });
          } else {
            this.setData({
              scrollTop: newTop,
              viewTop: newTop,
            });
          }
        }, 100),
      });
    },
    handleScrollStart: function (e) {
      // console.log("drag start", e);
      if (e.detail.scrollTop > 0 && !this.data.manualScroll) {
        // 手动开始滚
        this.setData({
          manualScroll: true,
        });
      }
    },
    handleScrollToLower: function (e) {
      // console.log("scroll to lower", e);
      // 到底转自动
      this.setData({
        manualScroll: false,
      });
    },
    autoToBottom: function () {
      console.log("autoToBottom");
      this.setData({
        manualScroll: false,
        scrollTo: "scroll-bottom",
      });
      // console.log('scrollTop', this.data.scrollTop);
    },
    bindInputFocus: function (e) {
      this.setData({
        manualScroll: false,
      });
      this.autoToBottom();
    },
    bindKeyInput: function (e) {
      this.setData({
        inputValue: e.detail.value,
      });
    },
    onRefresherStatusChange(e) {
      console.log('status change e', e)
    },
    handelRefresh: function (e) {
      this.setData({
        triggered: true,
        refreshText: '刷新中'
      }, async () => {
        // 模拟请求回数据后 停止加载
        console.log('this.data.agentConfig.type', this.data.agentConfig.type)
        if (this.data.agentConfig.type === 'bot') {
          // 判断当前是否大于一条 （一条则为系统默认提示，直接从库里拉出最近的一页）
          if (this.data.chatRecords.length > 1) {
            const newPage = Math.floor(this.data.chatRecords.length / this.data.size) + 1
            this.setData({
              page: newPage
            })
          }
          const res = await wx.cloud.extend.AI.bot.getChatRecords({
            botId: this.data.agentConfig.botId,
            pageNumber: this.data.page,
            pageSize: this.data.size,
            sort: "desc",
          });
          console.log('getChatRecords', res)
          this.setData({
            triggered: false,
            total: res.total,
            refreshText: '下拉加载历史记录'
          })

          // 找出新获取的一页中，不在内存中的数据
          const freshNum = this.data.size - (this.data.chatRecords.length - 1) % this.data.size
          const freshChatRecords = res.recordList.reverse().slice(0, freshNum)
          this.setData({
            chatRecords: [...freshChatRecords, ...this.data.chatRecords]
          })
          console.log('totalChatRecords', this.data.chatRecords)
        }
      })
    },
    clearChatRecords: function () {
      const {
        type
      } = this.data.agentConfig;
      const {
        bot
      } = this.data;
      this.setData({
        showTools: false
      });
      if (type === "model") {
        this.setData({
          chatRecords: [],
          chatStatus: 0,
        });
        return;
      }
      // 只有一条不需要清
      if (this.data.chatRecords.length === 1) {
        return;
      }
      const record = {
        content: "你好，任何事情都可以告诉我22",
        record_id: "record_id" + String(+new Date() + 10),
        role: "assistant",
        hiddenBtnGround: true,
      };
      const questions = randomSelectInitquestion(bot.initQuestions, 3);
      this.setData({
        chatRecords: [record],
        chatStatus: 0,
        questions,
        page: 1 // 重置分页页码
      });
    },
    handleUploadImg: function () {
      const self = this;
      wx.chooseMessageFile({
        count: 10,
        type: "image",
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          // const tempFilePaths = res.tempFiles;
          console.log("res", res);
          const tempFiles = res.tempFiles.map((item) => ({
            tempId: `${new Date().getTime()}-${item.name}`,
            rawType: item.type, // 微信选择默认的文件类型 image/video/file
            fileName: item.name, // 文件名
            tempPath: item.path,
            fileSize: item.size,
            fileUrl: "",
            fileId: "",
          }));
          // 过滤掉已选择中的 file 文件（保留image）
          const filterFileList = self.data.sendFileList.filter(
            (item) => item.rawType !== "file"
          );
          const finalFileList = [...filterFileList, ...tempFiles];
          console.log("final", finalFileList);
          self.setData({
            sendFileList: finalFileList, //
          });

          if (finalFileList.length) {
            self.setData({
              showFileList: true,
              showTools: false,
            });
          }
        },
      });
    },
    handleUploadFile: function () {
      const self = this;
      wx.chooseMessageFile({
        count: 10,
        type: "file",
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          // const tempFilePaths = res.tempFiles;
          console.log("res", res);
          const tempFiles = res.tempFiles.map((item) => ({
            tempId: `${new Date().getTime()}-${item.name}`,
            rawType: item.type, // 微信选择默认的文件类型 image/video/file
            fileName: item.name, // 文件名
            tempPath: item.path,
            fileSize: item.size,
            fileUrl: "",
            fileId: "",
          }));
          // 过滤掉已选择中的 image 文件（保留file)
          const filterFileList = self.data.sendFileList.filter(
            (item) => item.rawType !== "image"
          );
          const finalFileList = [...filterFileList, ...tempFiles];
          console.log("final", finalFileList);

          self.setData({
            sendFileList: finalFileList, //
          });

          if (finalFileList.length) {
            self.setData({
              showFileList: true,
              showTools: false,
            });
          }
        },
      });
    },
    handleCamera: function () {
      const self = this;
      wx.chooseMedia({
        count: 9,
        mediaType: ["image"],
        sourceType: ["camera"],
        maxDuration: 30,
        camera: "back",
        success(res) {
          console.log("res", res);
          // console.log(res.tempFiles[0].tempFilePath)
          // console.log(res.tempFiles[0].size)
          const tempFiles = res.tempFiles.map((item) => {
            let index = item.tempFilePath.lastIndexOf(".");
            const fileExt = item.tempFilePath.substring(index + 1);
            const randomFileName = new Date().getTime() + "." + fileExt;
            return {
              tempId: randomFileName,
              rawType: item.fileType, // 微信选择默认的文件类型 image/video/file
              fileName: randomFileName, // 文件名
              tempPath: item.tempFilePath,
              fileSize: item.size,
              fileUrl: "",
              fileId: "",
            };
          });
          // 过滤掉已选择中的 file 文件（保留image）
          const filterFileList = self.data.sendFileList.filter(
            (item) => item.rawType !== "file"
          );
          const finalFileList = [...filterFileList, ...tempFiles];
          console.log("final", finalFileList);
          self.setData({
            sendFileList: finalFileList, //
          });
          if (finalFileList.length) {
            self.setData({
              showTools: false,
              showFileList: true,
            });
          }
        },
      });
    },
    stop: function () {
      this.autoToBottom();
      const {
        chatRecords,
        chatStatus
      } = this.data;
      const newChatRecords = [...chatRecords];
      const record = newChatRecords[newChatRecords.length - 1];
      if (chatStatus === 1) {
        record.content = "已暂停生成";
      }
      // 暂停思考
      if (chatStatus === 2) {
        record.pauseThinking = true;
      }
      this.setData({
        chatRecords: newChatRecords,
        manualScroll: false,
        chatStatus: 0, // 暂停之后切回正常状态
      });
    },
    openSetPanel: function () {
      this.setData({
        setPanelVisibility: true
      });
    },
    closeSetPanel: function () {
      this.setData({
        setPanelVisibility: false
      });
    },
    // TODO send to backend api https://momecho.work/chat
    sendMessage: async function (event) {
      const { phoneNumber, name } = this.properties;
      console.log('发送消息 sendMessage', phoneNumber, name)
      if (this.data.showFileList) {
        this.setData({
          showFileList: !this.data.showFileList,
        });
      }
      if (this.data.showTools) {
        this.setData({
          showTools: !this.data.showTools,
        });
      }
      const {
        message
      } = event.currentTarget.dataset;
      let {
        inputValue,
        bot,
        agentConfig,
        chatRecords,
        chatStatus,
        imageList
      } =
        this.data;
      // 如果正在进行对话，不让发送消息
      if (chatStatus !== 0) {
        return;
      }
      // 将传进来的消息给到inputValue
      if (message) {
        inputValue = message;
      }
      // 空消息返回
      if (!inputValue) {
        return;
      }
      // 图片上传没有完成，返回
      if (imageList.length) {
        if (imageList.filter((item) => !item.base64Url).length) {
          return;
        }
      }
      const {
        type,
        modelName,
        model
      } = agentConfig;
      // console.log(inputValue,bot.botId)
      const userRecord = {
        content: inputValue,
        record_id: "record_id" + String(+new Date() - 10),
        role: "user",
        imageList: [...imageList],
      };

      userRecord.fileList = this.data.sendFileList;
      if (this.data.sendFileList.length) {
        this.setData({
          sendFileList: [],
        });
      }
      // 使用已存储的聊天模型，而不是每次重新随机
      const chatModel = this.data.chatModel;
      console.log('AAAAAAAchatModel', chatModel) 
      
      // 调用后端接口
      // 构建消息对象
      const messageBody = {
        usr_name: name,
        phone_number: phoneNumber,
        text: inputValue,
        sender: "user", // 发送者标识
        model: chatModel
      };
      // 确保 res 在 try-catch 外部定义
      let res = null;

      try {
        res = await new Promise((resolve, reject) => {
          wx.request({
            url: `${CONFIG.API_BASE_URL}/api/chat/chat`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
            },
            data: messageBody,
            success: (response) => {
              if (response.statusCode === 200) {
                resolve(response.data);
              } else {
                console.error("HTTP 错误:", response.statusCode);
                reject(new Error("HTTP 错误: " + response.statusCode));
              }
            },
            fail: (error) => {
              console.error("请求失败:", error);
              reject(error);
            }
          });
        });
      } catch (error) {
        console.error('请求失败:', error);
        res = {
          response: "网络连接失败"
        }; // 发生错误时，提供默认值
      }

      // 处理后端返回的响应
      const responseMessage = res.response || "hello world";
      console.log("后端返回:", responseMessage);


      const record = {
        content: responseMessage,
        record_id: "record_id" + String(+new Date() + 10),
        role: "assistant",
        hiddenBtnGround: true,
      };
      this.setData({
        inputValue: "",
        questions: [],
        chatRecords: [...chatRecords, userRecord, record],
        chatStatus: 0, // 聊天状态切换为正常
      });

      // 新增一轮对话记录时 自动往下滚底
      this.autoToBottom();

      if (type === "bot") {
        const ai = wx.cloud.extend.AI;
        const res = await ai.bot.sendMessage({
          data: {
            botId: bot.botId,
            // history: [
            //   ...chatRecords.map((item) => ({
            //     role: item.role,
            //     content: item.content,
            //   })),
            // ],
            msg: inputValue,
            fileList: this.data.enableUpload ? userRecord.fileList.map((item) => ({
              type: item.rawType,
              fileId: item.fileId,
            })) : undefined,
            searchEnable: this.data.useWebSearch,
          },
        });
        let contentText = "";
        let reasoningContentText = "";
        let isManuallyPaused = false; //这个标记是为了处理手动暂停时，不要请求推荐问题，不显示下面的按钮
        let startTime = null; //记录开始思考时间
        let endTime = null; // 记录结束思考时间
        let index = 0
        for await (let event of res.eventStream) {
          const {
            chatStatus
          } = this.data;
          if (chatStatus === 0) {
            isManuallyPaused = true;
            break;
          }
          if (index % 10 === 0) { // 更新频率降为1/10
            this.toBottom(40);
          }
          const {
            data
          } = event;
          try {
            const dataJson = JSON.parse(data);
            const {
              type,
              content,
              reasoning_content,
              record_id,
              search_info,
              role,
              knowledge_meta,
              finish_reason,
            } = dataJson;
            const newValue = [...this.data.chatRecords];
            // 取最后一条消息更新
            const lastValueIndex = newValue.length - 1
            const lastValue = newValue[lastValueIndex];
            lastValue.role = role || "assistant";
            lastValue.record_id = record_id || lastValue.record_id; // 这里是为了解决markdown渲染库有序列表的问题，每次计算新key
            // 优先处理错误,直接中断
            if (finish_reason === "error") {
              lastValue.search_info = null;
              lastValue.reasoning_content = "";
              lastValue.knowledge_meta = [];
              lastValue.content = "网络繁忙，请稍后重试!";
              this.setData({
                [`chatRecords[${lastValueIndex}].search_info`]: lastValue.search_info,
                [`chatRecords[${lastValueIndex}].reasoning_content`]: lastValue.reasoning_content,
                [`chatRecords[${lastValueIndex}].knowledge_meta`]: lastValue.knowledge_meta,
                [`chatRecords[${lastValueIndex}].content`]: lastValue.content,
              });
              break;
            }
            // 下面根据type来确定输出的内容
            // 只更新一次参考文献，后续再收到这样的消息丢弃
            if (type === "search" && !lastValue.search_info) {
              lastValue.search_info = search_info;
              this.setData({
                chatStatus: 2,
                [`chatRecords[${lastValueIndex}].search_info`]: lastValue.search_info
              }); // 聊天状态切换为思考中,展示联网的信息
            }
            // 思考过程
            if (type === "thinking") {
              if (!startTime) {
                startTime = +new Date();
                endTime = +new Date();
              } else {
                endTime = +new Date();
              }
              reasoningContentText += reasoning_content;
              lastValue.reasoning_content = reasoningContentText;
              lastValue.thinkingTime = Math.floor((endTime - startTime) / 1000);
              this.setData({
                [`chatRecords[${lastValueIndex}].reasoning_content`]: lastValue.reasoning_content,
                [`chatRecords[${lastValueIndex}].thinkingTime`]: lastValue.thinkingTime,
                chatStatus: 2
              }); // 聊天状态切换为思考中
            }
            // 内容
            if (type === "text") {
              contentText += content;
              lastValue.content = contentText;
              this.setData({
                [`chatRecords[${lastValueIndex}].content`]: lastValue.content,
                chatStatus: 3
              }); // 聊天状态切换为输出content中
            }
            // 知识库，这个版本没有文件元信息，展示不更新
            if (type === "knowledge") {
              // lastValue.knowledge_meta = knowledge_meta
              // this.setData({ chatRecords: newValue });
            }
          } catch (e) {
            // console.log('err', event, e)
            break;
          }
          index++
        }
        this.toBottom(40)
        const newValue = [...this.data.chatRecords];
        const lastValueIndex = newValue.length - 1
        // 取最后一条消息更新
        const lastValue = newValue[lastValueIndex];
        lastValue.hiddenBtnGround = isManuallyPaused;
        this.setData({
          chatStatus: 0,
          [`chatRecords[${lastValueIndex}].hiddenBtnGround`]: isManuallyPaused
        }); // 对话完成，切回0 ,并且修改最后一条消息的状态，让下面的按钮展示
        if (bot.isNeedRecommend && !isManuallyPaused) {
          const ai = wx.cloud.extend.AI;
          const chatRecords = this.data.chatRecords
          const lastPairChatRecord = chatRecords.length >= 2 ? chatRecords.slice(chatRecords.length - 2) : []
          const recommendRes = await ai.bot.getRecommendQuestions({
            data: {
              botId: bot.botId,
              history: lastPairChatRecord.map(item => ({
                role: item.role,
                content: item.content
              })),
              msg: inputValue,
              agentSetting: "",
              introduction: "",
              name: "",
            },
          });
          let result = "";
          for await (let str of recommendRes.textStream) {
            // this.toBottom();
            this.toBottom();
            result += str;
            this.setData({
              questions: result.split("\n").filter((item) => !!item),
            });
          }
        }
      }
      if (type === "model") {
        const aiModel = wx.cloud.extend.AI.createModel(modelName);
        let params = {};
        if (model === "hunyuan-vision") {
          params = {
            model: model,
            messages: [
              ...chatRecords.map((item) => ({
                role: item.role,
                content: [{
                  type: "text",
                  text: item.content,
                },
                ...(item.imageList || []).map((item) => ({
                  type: "image_url",
                  image_url: {
                    url: item.base64Url,
                  },
                })),
                ],
              })),
              {
                role: "user",
                content: [{
                  type: "text",
                  text: inputValue,
                },
                ...imageList.map((item) => ({
                  type: "image_url",
                  image_url: {
                    url: item.base64Url,
                  },
                })),
                ],
              },
            ],
          };
        } else {
          params = {
            model: model,
            messages: [
              ...chatRecords.map((item) => ({
                role: item.role,
                content: item.content,
              })),
              {
                role: "user",
                content: inputValue,
              },
            ],
          };
        }
        const res = await aiModel.streamText({
          data: params,
        });
        let contentText = "";
        let reasoningText = "";
        let chatStatus = 2;
        let isManuallyPaused = false;
        let startTime = null; //记录开始思考时间
        let endTime = null; // 记录结束思考时间
        for await (let event of res.eventStream) {
          if (this.data.chatStatus === 0) {
            isManuallyPaused = true;
            break;
          }
          this.toBottom();

          const {
            data
          } = event;
          try {
            const dataJson = JSON.parse(data);
            const {
              id,
              choices = []
            } = dataJson || {};
            const {
              delta,
              finish_reason
            } = choices[0] || {};
            if (finish_reason === "stop") {
              break;
            }
            const {
              content,
              reasoning_content,
              role
            } = delta;
            reasoningText += reasoning_content || "";
            contentText += content || "";
            const newValue = [...this.data.chatRecords];
            const lastValue = newValue[newValue.length - 1];
            lastValue.content = contentText;
            lastValue.reasoning_content = reasoningText;
            lastValue.record_id = "record_id" + String(id);
            if (!!reasoningText && !contentText) {
              // 推理中
              chatStatus = 2;
              if (!startTime) {
                startTime = +new Date();
                endTime = +new Date();
              } else {
                endTime = +new Date();
              }
            } else {
              chatStatus = 3;
            }
            lastValue.thinkingTime = endTime ?
              Math.floor((endTime - startTime) / 1000) :
              0;
            this.setData({
              chatRecords: newValue,
              chatStatus
            });
          } catch (e) {
            // console.log(e, event)
            break;
          }
        }
        const newValue = [...this.data.chatRecords];
        const lastValue = newValue[newValue.length - 1];
        lastValue.hiddenBtnGround = isManuallyPaused; // 用户手动暂停，不显示下面的按钮
        this.setData({
          chatRecords: newValue,
          chatStatus: 0
        }); // 回正
      }

      // 在消息发送完成后，显示评分组件
      if (this.data.chatRecords.length === 2) { // 假设第一条是系统消息，第二条是用户消息，第三条是回复
        this.setData({
          showRating: true
        });
      }
    },
    toBottom: async function (unit) {
      const addUnit = unit === undefined ? 4 : unit
      if (this.data.shouldAddScrollTop) {
        const newTop = this.data.scrollTop + addUnit;
        if (this.data.manualScroll) {
          this.setData({
            scrollTop: newTop,
          });
        } else {
          this.setData({
            scrollTop: newTop,
            viewTop: newTop,
          });
        }
        return
      }

      // 只有当内容高度接近scroll 区域视口高度时才开始增加 scrollTop
      const clientHeight =
        this.data.windowInfo.windowHeight - this.data.footerHeight - (this.data.agentConfig.type === 'bot' ? 40 : 0); // 视口高度
      const contentHeight =
        (await this.calculateContentHeight()) +
        (this.data.contentHeightInScrollViewTop || (await this.calculateContentInTop())); // 内容总高度
      // console.log(
      //   'contentHeight clientHeight newTop',
      //   contentHeight,
      //   clientHeight,
      //   this.data.scrollTop + 4
      // );
      if (clientHeight - contentHeight < 10) {
        this.setData({
          shouldAddScrollTop: true
        })
      }
    },
    copyChatRecord: function (e) {
      // console.log(e)
      const {
        content
      } = e.currentTarget.dataset;
      wx.setClipboardData({
        data: content,
        success: function (res) {
          wx.showToast({
            title: "复制成功",
            icon: "success",
          });
        },
      });
    },
    addFileList: function () {
      // 顶部文件行展现时，隐藏底部工具栏
      this.setData({});
    },
    subFileList: function () { },
    uploadImgs: function () {
      const that = this;
      wx.chooseMedia({
        count: 9,
        mediaType: ["image"],
        sourceType: ["album", "camera"],
        maxDuration: 30,
        camera: "back",
        success(media) {
          // console.log(media.tempFiles)
          const {
            tempFiles
          } = media;
          that.setData({
            imageList: [...tempFiles]
          });
          tempFiles.forEach((img, index) => {
            const lastDotIndex = img.tempFilePath.lastIndexOf(".");
            const fileExtension = img.tempFilePath.substring(lastDotIndex + 1);
            wx.getFileSystemManager().readFile({
              filePath: img.tempFilePath,
              encoding: "base64",
              success(file) {
                const base64String = file.data;
                const base64Url = `data:image/${fileExtension};base64,${base64String}`;
                const {
                  imageList
                } = that.data;
                const image = imageList[index];
                image.base64Url = base64Url;
                that.setData({
                  imageList: [...imageList]
                });
              },
            });
          });
        },
        fail(e) {
          console.log(e);
        },
      });
    },
    deleteImg: function (e) {
      const {
        currentTarget: {
          dataset: {
            index
          },
        },
      } = e;
      const {
        imageList
      } = this.data;
      const newImageList = imageList.filter((_, idx) => idx != index);
      this.setData({
        imageList: [...newImageList]
      });
    },
    copyUrl: function (e) {
      const {
        url
      } = e.currentTarget.dataset;
      console.log(url);
      wx.setClipboardData({
        data: url,
        success: function (res) {
          wx.showToast({
            title: "复制成功",
            icon: "success",
          });
        },
      });
    },
    handleRemoveChild: function (e) {
      console.log("remove", e.detail.tempId);
      if (e.detail.tempId) {
        const newSendFileList = this.data.sendFileList.filter(
          (item) => item.tempId !== e.detail.tempId
        );
        console.log("newSendFileList", newSendFileList);
        this.setData({
          sendFileList: newSendFileList,
        });
        if (newSendFileList.length === 0) {
          this.setData({
            showFileList: false,
          });
        }
      }
    },
    handleChangeChild: function (e) {
      console.log("change", e.detail);
      const {
        fileId,
        tempId
      } = e.detail;
      // const curFile = this.data.sendFileList.find(item => item.tempId === tempId)
      // curFile.fileId = fileId
      const newSendFileList = this.data.sendFileList.map((item) => {
        if (item.tempId === tempId) {
          return {
            ...item,
            fileId,
          };
        }
        return item;
      });
      this.setData({
        sendFileList: newSendFileList,
      });
    },
    handleClickTools: function () {
      this.setData({
        showTools: !this.data.showTools,
      });
    },
    handleClickWebSearch: function () {
      this.setData({
        useWebSearch: !this.data.useWebSearch,
      });
    },
    // 选择情绪评分
    selectEmotion: function(e) {
      const value = e.currentTarget.dataset.value;
      this.setData({
        emotionRating: value
      });
    },
    
    // 选择正负面评分
    selectScale: function(e) {
      const value = parseInt(e.currentTarget.dataset.value);
      this.setData({
        scaleRating: value
      });
    },
    
    // 提交评分
    submitRating: function() {
      const { emotionRating, scaleRating, secondRatingShown } = this.data;
      
      // 验证是否已选择
      if (!emotionRating || scaleRating === null) {
        wx.showToast({
          title: '请完成所有评价',
          icon: 'none'
        });
        return;
      }
      
      // 准备提交数据
      const ratingData = {
        phoneNumber: this.properties.phoneNumber,
        name: this.properties.name,
        emotionRating,
        scaleRating,
        isSecondRating: secondRatingShown,
        timestamp: new Date().toISOString()
      };
      
      console.log('准备提交评分数据:', ratingData);
      
      // 提交评分数据到服务器
      wx.request({
        url: `${CONFIG.API_BASE_URL}/api/users/${this.properties.phoneNumber}`, // 使用变量构建 URL
        method: 'POST',
        data: ratingData,
        success: (res) => {
          console.log('评分提交成功:', res.data);
          
          // 提交成功后隐藏评分组件
          wx.showToast({
            title: '评价已提交',
            icon: 'success'
          });
          
          this.setData({
            showRating: false
          });
          
          // 如果是第一次评分，添加欢迎消息到聊天记录，然后30秒后显示第二次评分
          if (!secondRatingShown) {
            console.log('第一次评分完成，添加欢迎消息到聊天记录');
            
            // 添加欢迎消息到聊天记录
            const welcomeMessage = {
              role: 'assistant',
              content: this.data.customWelcomeMessage
            };
            
            this.setData({
              chatRecords: [...this.data.chatRecords, welcomeMessage]
            });
            
            const timer = setTimeout(() => {
              this.setData({
                showRating: true,
                secondRatingShown: true,
                emotionRating: '',
                scaleRating: null
              });
            }, CONFIG.TIMEOUT_DURATION); // 8分钟
            
            this.setData({ timer });
          } else {
            // 如果是第二次评分，跳转到 survey 页面
            console.log('第二次评分完成，准备跳转到 survey 页面');
            
            // 使用 setTimeout 确保 Toast 显示完成后再跳转
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/survey/survey',
                success: () => {
                  console.log('成功跳转到 survey 页面');
                },
                fail: (err) => {
                  console.error('跳转到 survey 页面失败:', err);
                }
              });
            }, 1500); // 等待 Toast 显示完成
          }
        },
        fail: (err) => {
          console.error('评分提交失败:', err);
          wx.showToast({
            title: '提交失败，请重试',
            icon: 'none'
          });
        }
      });
    },
    // 在接收到机器人回复后显示评分
    onMessageReceived: function(message) {
      if (message.role === 'assistant' && !this.data.showRating && !this.data.secondRatingShown) {
        this.setData({
          showRating: true
        });
      }
    }
  },
});