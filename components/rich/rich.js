// components/rich-editor/rich-editor.js
const utils = require("../../utils/common");
const app = getApp();
Component({
  options: {
    styleIsolation: "apply-shared",
  },
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时发起请求
      this.loadData();
    },
  },
  data: {
    elements: [], // 存储所有元素
    textInputs: [], // 存储文字输入框的内容和状态
    showTextInput: false, // 是否显示文字输入框
    currentEditIndex: -1, // 当前正在编辑的元素索引
    currentMoveIndex: -1, // 当前正在移动的元素索引
    isVip: 0,
  },

  methods: {
    loadData() {
      app.request.post({
        url: "user/vip/getInfo",
        success: (res) => {
          if (res) {
            console.log("组件", res);
            this.setData({
              isVip:res.vipInfo.isVip
            })
          }
        },
      });
    },
    modifyArray(newArray) {
      this.setData({
        elements: newArray,
      });
    },
    clear() {
      this.setData({
        elements: [],
      });
    },
    getData() {
      return this.data.elements;
    },
    // 显示操作菜单
    showActionSheet() {
      wx.showActionSheet({
        // itemList: ["文字", "图片"],
        itemList: ["文字", "图片", "视频"],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 文字
            this.setData({
              showTextInput: true,
            });
            this.addTextInput();
          } else if (res.tapIndex === 1) {
            // 图片
            this.chooseImage();
          } else if (res.tapIndex === 2) {
            // 视频
            if (this.data.isVip === 0) {
              this.triggerEvent("checkVip","开通VIP，解锁名片视频介绍，丰富名片内容，更直观您的价值");
              return;
            } else {
              this.chooseVideo();
            }
          }
        },
      });
    },
    // 添加文字输入框
    addTextInput() {
      const textInputs = this.data.textInputs;
      const newTextInput = {
        type: "text", // 标记为文字类型
        content: "",
      };

      textInputs.push(newTextInput);
      this.setData({
        textInputs: textInputs,
      });
      // 同时添加一个文字元素
      this.addElement("text", "");
    },

    // 文字输入框输入事件
    onTextInput(e) {
      const index = e.currentTarget.dataset.index;
      const type = "text";
      const content = e.detail;
      const elements = this.data.elements;
      elements.forEach((item, i) => {
        if (item.type === type && i === index) {
          item.content = content;
        }
      });
      this.setData({
        elements: elements,
      });
    },
    // 更新 elements 数组中的文字元素内容
    updateElements(type, index, content) {
      const elements = this.data.elements;
      elements.forEach((item, i) => {
        if (item.type === type && i === index) {
          item.content = content;
        }
      });
      this.setData({
        elements: elements,
      });
    },

    // 选择图片
    chooseImage(e) {
      wx.chooseImage({
        count: 1,
        success: (res) => {
          console.log("res", res);
          const file = res.tempFiles[0];
          let base64 = wx
            .getFileSystemManager()
            .readFileSync(file.path, "base64");
          base64 = "data:image/jpeg;base64," + base64;
          this.addElement("image", base64);
        },
      });
    },

    // 选择视频
    chooseVideo() {
    var that =this
      wx.chooseVideo({
        sourceType: ["album", "camera"],
        maxDuration: 60,
        camera: "back",
        success: (res) => {
          wx.showLoading({ title: "上传中", mask: true });
          console.log("视频res", res);
          wx.uploadFile({
            url:utils.default.baseUrl+ "us/cardInfo/public/videoUpload",
            filePath: res.tempFilePath,
            name: "file",
            formData: {},
            success(res) {
              wx.showToast({
                title: "上传成功",
                icon: "success",
                duration: 2000,
              });
             console.log('上传res',res);
             const data = JSON.parse(res.data)
             console.log('data',data);
             that.addElement("video", data.result);
            },
            fail(err){
              wx.showToast({
                title: '上传失败',
                icon:'error'
              })
              console.log('err',err);
            }
          });
      
        },
      });
    },
    // 添加元素到列表
    addElement(type, content) {
      const elements = this.data.elements;
      const newElement = {
        type: type,
        content: content,
        // src: type === "image" ? content : "",
        src: "",
      };

      elements.push(newElement);
      this.setData({
        elements: elements,
      });
    },

    // 编辑元素
    editElement(e) {
      const index = e.currentTarget.dataset.index;
      this.setData({
        currentEditIndex: index,
      });
    },

    // 删除元素
    deleteElement(e) {
      const index = e.currentTarget.dataset.index;
      const elements = this.data.elements;
      elements.splice(index, 1);
      this.setData({
        elements: elements,
      });
    },

    // 上移元素
    moveUp(e) {
      const index = e.currentTarget.dataset.index;
      if (index > 0) {
        this.swapElements(index, index - 1);
      }
    },
    // 下移元素
    moveDown(e) {
      const index = e.currentTarget.dataset.index;
      const elementsCount = this.data.elements.length;
      if (index < elementsCount - 1) {
        this.swapElements(index, index + 1);
      }
    },

    // 交换元素位置
    swapElements(index1, index2) {
      const elements = this.data.elements;
      const temp = elements[index1];
      elements[index1] = elements[index2];
      elements[index2] = temp;
      this.setData({
        elements: elements,
      });
    },
  },
});
