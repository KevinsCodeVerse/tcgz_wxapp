const app = getApp();
Page({
    data: {
        id: "",
        active: 3,
        info: {},
        attentList: [],
        attent: {},
        notice: "",
        noticeId: "",
        isFrim: "-1",
        bannerList: [],

        background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    },
    //监听页面初次加载
    onLoad: function (options) {
        // options.id=1
        if (options.active) {            
            let active = Number(options.active);
            this.setData({
                active: active,
                id: options.id,
            });
        } else {
            this.setData({
                id: options.id
            });
        }

        this.getAttent();
    },
    //监听页面显示
    onShow: function () {
        this.setData({
            isFrim: wx.getStorageSync("isFirm"),
        });
    },
    // 选择器改变时
    attentChange(e) {
        let obj = this.data.attentList[e.detail.value];
        console.log(obj);
        this.setData({
            index: e.detail.value,
            attent: obj,
            id: obj.id,
        });

        let activity = this.selectComponent("#activity");
        let news = this.selectComponent("#news");
        let phone = this.selectComponent("#phone");

        this.getDetail();
        this.getNotice();
        activity.setData({
            pageNo: 1,
            isMax: false,
            loading: false,
            list: [],
        });
        activity.getList();
        phone.getList();
        news.getNews();
    },

    goSearch() {
        wx.navigateTo({
            url: "/pages/collective/find/find",
        });
    },
    goMap() {
        wx.navigateTo({
            url: "/pages/collective/map/map",
        });
    },
    goDetail() {
        wx.navigateTo({
            url: "/pages/collective/news_detail/news_detail?id=" + this.data.noticeId,
        });
    },
    // 打电话
    freeTell() {
        if (!this.data.info.phone) {
            wx.showToast({
                title: "该集体没有填电话",
                icon: "none",
            });
            return;
        }
        wx.makePhoneCall({
            phoneNumber: this.data.info.phone,
        });
    },
    // 导航
    toOpenNav() {
        let latitude = parseFloat(this.data.info.latitude);
        let longitude = parseFloat(this.data.info.longitude);
        let name = this.data.info.name;
        let address = this.data.info.address;
        wx.openLocation({
            latitude: latitude,
            longitude: longitude,
            name: name,
            address: address,
            scale: 16,
        });
    },
    // -----------------------------------------接口---------------------------------------
    // 关注集体列表
    getAttent() {
        app.request.post({
            url: "user/firm/merchantFocusIn/list",
            success: (res) => {
                let attentList = [];
                let attent = {};
                res.forEach((item) => {
                    attentList.push(item.firmInfo);
                });
                if (attentList.length > 0) {
                    this.getDetail();
                    this.getNotice();
                }
                this.setData({
                    attentList
                });
                console.log(this.data.attent);
            },
        });
    },
    // 获取详情
    getDetail(id) {
        app.request.post({
            url: "user/firm/public/info/details",
            params: {
                id: this.data.id,
            },
            success: (res) => {
                let firm = res.firmInfo;
                // console.log("bannerList", this.data.bannerList);
                this.setData({
                    bannerList: res.firmBanners
                });
                console.log("bannerList", this.data.bannerList);
                console.log(firm);
                if (firm.description) {
                    firm.description = firm.description.replace(/\<img/g, '<img style="max-width:100%;height:auto;display:block;" class="graphic"');
                }
                this.setData({
                    info: firm,
                    isJoin: res.status,
                    attent: firm,
                });
            },
            finally: () => {},
        });
    },
    // 获取公告
    getNotice(firmId) {
        app.request.post({
            url: "user/firm/public/news/notice",
            params: {
                firmId: this.data.id,
            },
            success: (res) => {
                this.setData({
                    notice: res.title,
                    noticeId: res.id,
                });
            },
        });
    },
    toPublicJoin() {
        wx.navigateTo({
            url: "/pages/collective/settled/settled",
        });
    },

    //监听页面初次加载完成
    onReady: function () {},
    //监听页面隐藏
    onHide: function () {},
    //监听页面卸载
    onUnload: function () {},
    //监听用户下拉动作
    onPullDownRefresh: function () {},
    //监听用户下拉动作
    onPullDownRefresh: function () {},
    //用户上拉触底事件的处理函数
    onReachBottom: function () {
        if (this.data.active == 0) this.selectComponent("#activity").getList();
    },
    //用户点击右上角转发
    onShareAppMessage: function () {
        let id = this.data.id; // 分享产品的Id
        return {
            imageUrl: app.common.imgUrl + this.data.attent.banner,
            title: this.data.info.name,
            path: `pages/collective/detail/detail?id=${id}`, // 分享后打开的页面
        };
    },
});