// pages/attention/noattent/index.js
const app = getApp()
const areaList= require('../../../utils/area')

const citys = {
  '商标/专利': ['商标担保注册', '专利查询', '版权登记'],
  '品牌设计': ['威尼斯', '清雅'],
};

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
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
    showArea: false,
    // 行业筛选
    showIndustry: false,
    industryName: '',
    columns: [
      // {
      //   values: Object.keys(citys),
      //   className: 'column1',
      // },
      // {
      //   values: citys['商标/专利'],
      //   className: 'column2',
      //   // defaultIndex: 2,
      // },
    ],
    areaList: {},
    isFirm: '-1'
  },

  ready(){
    this.getSite();
    this.getList();
    this.getIndustryList();
    this.setData({
      areaList: areaList.default,
    })
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // ----------------------行业选择-----------------------------
    toIndustryCal(){
      this.setData({showIndustry: !this.data.showIndustry})
    },
    toIndustryCrm(e){
      if(e.detail.value){
        this.setData({
          industryName: e.detail.value,
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
      const { picker, value, index } = event.detail;
      picker.setColumnValues(1, citys[value[0]]);
      console.log(event.detail)
    },
    // 地址选择
    // addressChange(e){
    //   let arr= e.detail.value
    //   this.setData({
    //     address: arr[1],
    //     list: [],
    //     loading: false,
    //     finish: false,
    //     pageNo: 0,
    //   })
    //   this.getList();
    // },
    //-------------地址选择--------------------------
    toAreaCal(){
      this.setData({showArea: !this.data.showArea})
    },
    toAreaCrm(e){
      console.log()
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
    },
    
    toPublicJoin(){
      wx.navigateTo({
        url: '/pages/collective/settled/settled',
      })
    },
    //获取位置
    getSite(){
      let address=wx.getStorageSync('address')
      if(address){
        console.log(address);
        address= address.split('-')
        this.setData({
          address: address.join(''),
          cityName: address[1]
        })
      }
      setTimeout(() => {
        if(wx.getStorageSync('isFirm')){
          this.setData({isFirm: wx.getStorageSync('isFirm')})
        }
      }, 1000);
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
    // 清空
    toClear(){
      this.setData({
        list: [],
        loading: false,
        finish: false,
        pageNo: 0
      })
      this.getList();
    },
    


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
          cityName: this.data.address,
          keyWord: this.data.value
        },
        success: res => {
          console.log(res)
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
            columns.push(item.name)
          });
          this.setData({
            columns: columns
          })

        }
      })
    },
  },

  
})

