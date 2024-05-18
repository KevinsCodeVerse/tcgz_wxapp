// custom-tabbar.js

// 在需要用到的地方引入app

const app = getApp();
Component({
  data: {
    active: 0,
    showVip: false,
    tabs: [
      {
        text: "名片",
        icon: {
          normal: "/img/card/tab-home.png",
          active: "/img/card/tab-ahome.png",
        },
        url: "/pages/card/myCard/myCard",
      },
      {
        text: "人脉",
        icon: {
          normal: "/img/card/tab-user.png",
          active: "/img/card/tab-auser.png",
        },
        url: "/pages/card/contacts/contacts",
      },
      {
        text: "VIP",
        icon: {
          normal: "/img/card/tab-vip.png",
          active: "/img/card/tab-avip.png",
        },
        url: "/pages/card/vip/vip",
      },
      {
        text: "消息",
        icon: {
          normal: "/img/card/tab-msg.png",
          active: "/img/card/tab-amsg.png",
        },
        // url: "/pages/card/Message/Message",
        url: "/pages/card/vipMessage/vipMessage",
      },
    ],
  },
  attached() {
    // 在 attached 生命周期中判断当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentUrl = `/${currentPage.route}`;
    const activeIndex = this.data.tabs.findIndex(
      (tab) => tab.url === currentUrl
    );
    if (activeIndex !== -1) {
      this.setData({ active: activeIndex });
    }
  },
  methods: {

    onChange(e) {
      const { detail } = e; 
      this.setData({ active: detail });
      // 获取当前点击的 Tab 对应的路径
      const currentUrl = this.data.tabs[detail].url;
      // 如果存在路径，则切换标签栏
      if (currentUrl) {
        console.log("currentUrl", currentUrl);   
          wx.reLaunch({
            url: currentUrl,
          }).catch((res)=>{
            console.log("跳转失败：",res)
          });       
      } else {
        wx.showToast({
          title: "敬请期待",
          icon: "none",
        });
      }
    },
  },
});
