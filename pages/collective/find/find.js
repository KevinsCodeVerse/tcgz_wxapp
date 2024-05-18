const app = getApp()
const areaList= require('../../../utils/area')

Page({
  data: {
    value: '',
    searchList: [],
    showSearch: false,
    showAgain: false,

    // 分页列表
    list: [],
    loading: false,
    finish: false,
    pageNo: 0,
    pageSize: 10,
    // 地址筛选
    address: '',
    cityName: '',
    areaList: {},
    // 行业筛选
    showIndustry: false,
    industryName: '',
    industryId: '',
    columns: [],
    isFrim:'',
  },
  //监听页面初次加载
  onLoad: function (options) {
    let address=wx.getStorageSync('address')
    if(address){
      address= address.split('-')
      this.setData({
        address: address.join(''),
        cityName: address[1]
      })
    }
    this.getList();
    this.getIndustryList();
    this.setData({
      areaList: areaList.default
    })
  },
  //监听页面显示
  onShow: function () {
    this.setData({
			isFrim: wx.getStorageSync("isFirm"),
		});
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  // ----------------------行业选择-----------------------------
  toIndustryCal(){
    this.setData({showIndustry: !this.data.showIndustry})
  },
  toIndustryCrm(e){
    console.log(e.detail)
    if(e.detail.value){
      this.setData({
        industryName: e.detail.value.text,
        industryId: e.detail.value.id,
        list: [],
        loading: false,
        finish: false,
        pageNo: 0,
      })
      this.getList();
    }
    this.setData({
      showIndustry: !this.data.showIndustry,
    })
  },
  onChange(event) {
    console.log(event)
  },
  // 地址选择
  addressChange(e){
    console.log(e);
    let arr= e.detail.value
    this.setData({
      address: arr[0] + arr[1],
      cityName: arr[1],
      list: [],
      loading: false,
      finish: false,
      pageNo: 0,
    })
    this.getList();
  },
  //-------------地址选择--------------------------
  toAreaCal(e){
    this.setData({showArea: !this.data.showArea})
    console.log(e);
  },
  toAreaCrm(e){
    console.log(e)
    if(e.detail.values){
      this.setData({
        address: e.detail.values[0].name + e.detail.values[1].name,
        cityName: e.detail.values[1].name,
        list: [],
        loading: false,
        finish: false,
        pageNo: 0,
      })
      this.getList();
    }
    this.setData({
      showArea: !this.data.showArea,
    })
  },

  // 搜索
  onSearch(e){
    this.setData({
      value: e.detail.value,
    })
    this.setData({showSearch: true})
    this.setData({showAgain: false})
    this.getSearchList(e.detail.value);
  },
  toAssign(e){
    let name= e.currentTarget.dataset.name
    this.setData({
      value: name,
      showSearch: false,
      showAgain: true
    })
  },
  startSearch(){
    this.setData({
      list: [],
      loading: false,
      finish: false,
      pageNo: 0
    })
    this.getList();
  },
  toColse(){
    this.setData({
      value: '',
      showSearch: false
    })
  },
  toIndustry(){
    this.setData({
      showIndustry: !this.data.showIndustry
    })
  },

  goDetail(e){
    let id= e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/collective/detail/detail?id='+id,
    })
    // wx.navigateTo({
    //   url: '/pages/collective/detail_my/index?id='+id,
    // })
  },
  
  toPublicJoin(){
    wx.navigateTo({
      url: '/pages/collective/settled/settled',
    })
  },

  // 自动补全列表
  getSearchList(keyword){
    if(!keyword) return
    app.request.post({
      url: 'user/firm/public/info/autoComplete',
      params: {
        keyword,
      },
      success: res => {
        this.setData({
          searchList: res
        })
      },
    })
  },

  // 全部集体
  toAll(){
    this.setData({
      list: [],
      loading: false,
      finish: false,
      pageNo: 0
    })
    this.setData({
      industryName: '',
      address: '',
      cityName: ''
    })
    this.getList();
  },
  // -------------------------------------------接口---------------------------------------------------------------
  // 获取列表
  getList() {
    if(this.data.loading || this.data.finish) return;
    this.setData({
      pageNo: this.data.pageNo + 1,
      loading: true
    })
    app.request.post({
      url: 'user/firm/public/Info/list',
      params: {
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        industryName: this.data.industryName,
        industryId: this.data.industryId,
        cityName: this.data.address,
        keyWord: this.data.value
      },
      success: res => {
        console.log('res',res)
        if(res.list.length < this.data.pageSize) {
          this.setData({
            finish: true
          })
        }
        let list = this.data.list.concat(res.list);
        this.setData({
          list: list
        })
      },
      finally: () => {
        this.setData({
          loading: false
        })
      }
    })
  },
  // 获取行业列表
  getIndustryList(){
    app.request.post({
      url: 'user/sysIndustry/public/list',
      success: res => {
        let columns = [];
        res.forEach(item => {
          var obj={
            text: item.name,
            id: item.id
          }
          columns.push(obj)
        });
        this.setData({
          columns: columns
        })
      }
    })
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
    this.getList()
  },
  //用户点击右上角转发
  onshareAppMessage: function () {},
})