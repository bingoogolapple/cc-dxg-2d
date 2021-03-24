const { ccclass, property } = cc._decorator
interface VideoCallback {
  onSuccess()
  onFail(isUser: boolean)
}

interface FooterAdHeightUpdateCallback {
  (footerAdHeight: number)
}

@ccclass
export default class WechatComponent extends cc.Component {
  private footerAdHeight: number = 250
  private iPhoneX: any = false
  private bannerAd: any = null
  private gridAd: any = null
  private interstitialAd: any = null
  private videoAd: any = null
  private customAd: any = null
  private wx: any = null
  private videoCallback: VideoCallback = null
  private footerAdHeightUpdateCallback: FooterAdHeightUpdateCallback = null

  onLoad() {
    this.wx = this.getWx()

    // this.adaptIphoneXUI()

    this.passiveShare()
    this.showFooterGridAd()
    this.showSingleCustomAd(true)

    // this.showFooterBannerAd()
    // this.showInterstitialAd()
  }

  registFooterAdHeightUpdate(callback: FooterAdHeightUpdateCallback) {
    this.footerAdHeightUpdateCallback = callback
    this.notifyFooterAdHeightUpdate(this.footerAdHeight, true)
  }

  showToast(msg: string) {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.wx.showToast({
      title: msg,
      icon: "none"
    })
  }

  showSingleCustomAd = (alignRight: boolean) => {
    let wx = this.wx
    if (!wx) {
      return
    }

    if (this.customAd) {
      this.customAd.destroy()
    }

    let { screenWidth, screenHeight } = wx.getSystemInfoSync()
    this.customAd = wx.createCustomAd({
      adUnitId: "adunit-263ddf7b3f1e2314",
      style: {
        left: alignRight ? screenWidth - 70 : 0,
        top: screenHeight / 2 - 106 / 2
      }
    })
    this.customAd.onLoad(() => this.log("原生模板广告加载成功"))
    this.customAd.onError((err: any) => this.log("原生模板广告加载失败", err))
    this.customAd.onClose(() => {
      this.log("原生模板广告关闭，等 15s 再次推荐")
      this.scheduleOnce(() => this.showSingleCustomAd(alignRight), 15)
    })

    this.customAd
      .show()
      .then(() => this.log("原生模板广告显示成功"))
      .catch((err: any) => this.log("原生模板广告显示失败", err))
  }

  showVideoAd(callback: VideoCallback) {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.videoCallback = callback
    if (!this.videoAd) {
      this.log("实例化激励视频广告")
      this.videoAd = wx.createRewardedVideoAd({
        adUnitId: "adunit-bc62d7b0fa45a9e2"
      })
      this.videoAd.onLoad(() => this.log("激励视频广告加载成功"))
      this.videoAd.onError((err: any) => {
        this.log("激励视频广告加载失败", err)
        if (this.videoCallback != null) {
          this.videoCallback.onFail(false)
        }
      })
      // 监听用户关闭广告
      this.videoAd.onClose((res: any) => {
        // 小于 2.1.0 的基础库版本，res 是一个 undefined
        if ((res && res.isEnded) || res === undefined) {
          this.log("正常播放结束，下发游戏奖励")
          if (this.videoCallback != null) {
            this.videoCallback.onSuccess()
          }
        } else {
          this.log("播放中途退出，不下发游戏奖励")
          if (this.videoCallback != null) {
            this.videoCallback.onFail(true)
          }
        }
      })
    }

    // 用户触发广告后，显示激励视频广告
    this.videoAd
      .show()
      .then(() => this.log("激励视频广告显示成功"))
      .catch((err: any) => {
        this.log("激励视频广告显示失败，重试")
        this.videoAd
          .load()
          .then(() => this.videoAd.show())
          .then(() => this.log("激励视频广告显示成功"))
          .catch((err: any) => {
            this.log("激励视频广告显示失败", err)
            if (this.videoCallback != null) {
              this.videoCallback.onFail(false)
            }
          })
      })
  }

  showInterstitialAd() {
    let wx = this.wx
    if (!wx) {
      return
    }

    if (wx.createInterstitialAd) {
      this.log("实例化插屏广告")
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: "adunit-6cac21a1a762ee10"
      })
      this.interstitialAd.onLoad(() => this.log("插屏广告加载成功"))
      this.interstitialAd.onError((err: any) =>
        this.log("插屏广告加载失败", err)
      )
      this.interstitialAd.onClose((res: any) => this.log("插屏广告关闭", res))
    }

    if (this.interstitialAd) {
      this.interstitialAd
        .show()
        .then(() => this.log("插屏广告显示成功"))
        .catch((err: any) => this.log("插屏广告显示失败", err))
    }
  }

  private showFooterBannerAd() {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.showFooterAd(
      "Banner",
      wx,
      this.bannerAd,
      (screenWidth: number, screenHeight: number) => {
        this.bannerAd = wx.createBannerAd({
          adUnitId: "adunit-20f2dde72628797e",
          adIntervals: 30,
          style: {
            left: 0,
            top: 0,
            width: screenWidth // 宽度为 300 ~ 屏幕宽度，小于 300 时会取 300，大于屏幕宽度时会取屏幕宽度
          }
        })
        return this.bannerAd
      }
    )
  }

  private showFooterGridAd() {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.showFooterAd(
      "格子",
      wx,
      this.gridAd,
      (screenWidth: number, screenHeight: number) => {
        this.gridAd = wx.createGridAd({
          adUnitId: "adunit-cfd25a57f0f18191",
          adIntervals: 30,
          adTheme: "white",
          gridCount: 5,
          style: {
            left: 0,
            top: 0,
            width: screenWidth, // 宽度为 300 ~ 屏幕宽度，小于 300 时会取 300，大于屏幕宽度时会取屏幕宽度
            opacity: 0.8
          }
        })
        return this.gridAd
      }
    )
  }

  private showFooterAd(
    desc: string,
    wx: any,
    originAd: any,
    callback: (screenWidth: number, screenHeight: number) => any
  ) {
    if (originAd) {
      // 如果不对废弃的广告进行销毁，则会导致其上的事件监听器无法释放。当没有释放的广告积累过多时，将会产生性能问题
      originAd.destroy()
    }

    // 创建广告实例，提前初始化
    let { screenWidth, screenHeight } = wx.getSystemInfoSync()
    this.log(desc, "screenWidth:", screenWidth, "screenHeight:", screenHeight)
    let ad = callback(screenWidth, screenHeight)

    ad.onLoad(() => this.log(desc, "广告加载成功"))
    ad.onError((err: any) => this.log(desc, "广告加载失败", err))

    ad.onResize((size: any) => {
      ad.style.left = (screenWidth - size.width) / 2
      // if (this.iPhoneX) {
      //   ad.style.top = screenHeight - size.height - 10
      // } else {
      ad.style.top = screenHeight - size.height
      // }

      let adHeight = Math.floor(
        (size.height / screenHeight) * cc.winSize.height
      )
      this.log(desc, "size.height:", size.height, "adHeight:", adHeight)
      this.notifyFooterAdHeightUpdate(adHeight)

      // 在适合的场景显示广告
      ad.show()
        .then(() => this.log(desc, "广告显示成功"))
        .catch((err: any) => this.log(desc, "广告显示失败", err))
    })
  }

  private notifyFooterAdHeightUpdate(adHeight: number, isFirst?: boolean) {
    if (
      isFirst ||
      (adHeight > this.footerAdHeight && this.footerAdHeightUpdateCallback)
    ) {
      this.footerAdHeightUpdateCallback(adHeight)
    }
    this.footerAdHeight = adHeight
  }

  private passiveShare() {
    let wx = this.wx
    if (!wx) {
      return
    }

    let sdkVersion = wx.getSystemInfoSync().SDKVersion

    // 显示当前页面的「发送给朋友」和「分享到朋友圈」按钮
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
      success: (res: any) => {
        // cc.log、cc.warn、cc.error 不会再微信小程序中输出日志
        this.log("开启被动转发成功", res)
      },
      fail: (res: any) => {
        this.log("开启被动转发失败", res)
      }
    })
    // 右上角菜单按钮 -> 发送给朋友
    wx.onShareAppMessage(() => {
      this.log("用户点击了发送给朋友")
      return {}
    })
    // 右上角菜单按钮 -> 分享到朋友圈
    if (wx.onShareTimeline) {
      this.log(`${sdkVersion} 支持朋友圈分享`)
      wx.onShareTimeline(() => {
        this.log("用户点击了分享到朋友圈")
        return {}
      })
    } else {
      this.log(`${sdkVersion} 版本过低，不支持朋友圈分享`)
    }
  }

  private getWx() {
    if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
      this.log("非微信小游戏")
      return false
    }

    let wx = window["wx"]
    if (!wx) {
      this.log("window 上不存在 wx")
      return false
    }
    return wx
  }

  isWechat() {
    return !!this.wx
  }

  // 适配 iPhoneX 手机
  adaptIphoneXUI() {
    let wx = this.wx
    if (!wx) {
      return
    }

    wx.getSystemInfo({
      success: (res: any) => {
        this.log("获取设备类型成功", res)
        //判断用户手机是 iPhone X
        if (res.model.indexOf("iPhone X") != -1) {
          this.iPhoneX = true
        } else {
          this.iPhoneX = false
        }
      },
      fail: (res: any) => {
        this.log("获取设备类型失败", res)
      }
    })
  }

  private log(...data: any[]): void {
    console.log(...data)
  }
}
