const { ccclass, property } = cc._decorator
interface VideoCallback {
  onSuccess(): void
  onFail(isUser: boolean): void
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
  private rightSingleCustomAd: any = null
  private leftSingleCustomAd: any = null
  private wx: any = null
  private videoCallback: VideoCallback = null
  private footerAdHeightUpdateCallback: FooterAdHeightUpdateCallback = null
  // 底部格子广告
  private footerGridAdIdArr: string[] = ['adunit-cfd25a57f0f18191', 'adunit-3d28257b4f81f896', 'adunit-6a1639499d41be84', 'adunit-916c64a758e56c1b']
  private footerGridAdIdIndex: number = 0
  // 底部 Banner 广告
  private footerBannerAdIdArr: string[] = ['adunit-82e1d85e45c57f16', 'adunit-20f2dde72628797e', 'adunit-18bea21ab72f0929', 'adunit-457adf5e6bec8a4e']
  private footerBannerAdIdIndex: number = 0
  // 激励视频广告
  private videoAdIdArr: string[] = ['adunit-db6e21e03496d9a9', 'adunit-bc62d7b0fa45a9e2']
  private videoAdIdIndex: number = 0
  // 插屏广告
  private interstitialAdIdArr: string[] = ['adunit-6cac21a1a762ee10', 'adunit-e77072bfd3801edf']
  private interstitialAdIdIndex: number = 0
  // 左侧原生模板广告
  private leftSingleCustomAdIdArr: string[] = ['adunit-4933b2013211f76b', 'adunit-2291046378776bb0', 'adunit-426fb4c8b9c363e7', 'adunit-4c3a43fab2fe053f']
  private leftSingleCustomAdIdIndex: number = 0
  // 右侧原生模板广告
  private rightSingleCustomAdIdArr: string[] = ['adunit-263ddf7b3f1e2314', 'adunit-d356f2e650113069', 'adunit-78943a5d9a5d0a62', 'adunit-9708d8db3f84622a']
  private rightSingleCustomAdIdIndex: number = 0


  onLoad() {
    this.wx = this.getWx()

    // this.adaptIphoneXUI()

    this.passiveShare()
    this.showFooterGridAd()
    this.showLeftSingleCustomAd()
    this.showRightSingleCustomAd()

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
      icon: 'none'
    })
  }

  showLeftSingleCustomAd() {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.showSingleCustomAd(
      wx,
      this.leftSingleCustomAd,
      (screenWidth: number, screenHeight: number) => {
        this.leftSingleCustomAd = wx.createCustomAd({
          adUnitId: this.leftSingleCustomAdIdArr[this.leftSingleCustomAdIdIndex],
          style: {
            left: 2,
            top: screenHeight / 2
          }
        })
        return this.leftSingleCustomAd
      },
      () => {
        // this.leftSingleCustomAdIdIndex++
        // if (this.leftSingleCustomAdIdIndex < this.leftSingleCustomAdIdArr.length) {
        //   this.log('右侧原生模板广告无推荐，切换 id 重新加载')
        //   this.scheduleOnce(() => this.showLeftSingleCustomAd(), 15)
        // } else {
        //   this.log('所有右侧原生模板广告无推荐，重置 id')
        //   this.leftSingleCustomAdIdIndex = 0
        // }
      }
    )
  }

  showRightSingleCustomAd() {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.showSingleCustomAd(
      wx,
      this.rightSingleCustomAd,
      (screenWidth: number, screenHeight: number) => {
        this.rightSingleCustomAd = wx.createCustomAd({
          adUnitId: this.rightSingleCustomAdIdArr[this.rightSingleCustomAdIdIndex],
          style: {
            left: screenWidth - 60,
            top: screenHeight / 2
          }
        })
        return this.rightSingleCustomAd
      },
      () => {
        // this.rightSingleCustomAdIdIndex++
        // if (this.rightSingleCustomAdIdIndex < this.rightSingleCustomAdIdArr.length) {
        //   this.log('右侧原生模板广告无推荐，切换 id 重新加载')
        //   this.scheduleOnce(() => this.showRightSingleCustomAd(), 15)
        // } else {
        //   this.log('所有右侧原生模板广告无推荐，重置 id')
        //   this.rightSingleCustomAdIdIndex = 0
        // }
      }
    )
  }

  private showSingleCustomAd(
    wx: any,
    originAd: any,
    createAdCallback: (screenWidth: number, screenHeight: number) => any,
    noAdCallback: () => void) {

    if (originAd) {
      // 如果不对废弃的广告进行销毁，则会导致其上的事件监听器无法释放。当没有释放的广告积累过多时，将会产生性能问题
      originAd.destroy()
    }

    let { screenWidth, screenHeight } = wx.getSystemInfoSync()
    let ad = createAdCallback(screenWidth, screenHeight)
    ad.onLoad(() => this.log('原生模板广告加载成功'))
    ad.onError((err: any) => {
      this.log('原生模板广告加载失败', err)
      if (this.isNoAd(err)) {
        noAdCallback()
      }
    })
    ad.onClose(() => {
      this.log('原生模板广告关闭，等 5s 再次推荐')
      this.scheduleOnce(() => this.showSingleCustomAd(wx, originAd, createAdCallback, noAdCallback), 5)
    })

    ad
      .show()
      .then(() => this.log('原生模板广告显示成功'))
      .catch((err: any) => this.log('原生模板广告显示失败', err))
  }

  showVideoAd(callback: VideoCallback) {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.videoCallback = callback
    if (!this.videoAd) {
      this.log('实例化激励视频广告')
      this.videoAd = wx.createRewardedVideoAd({
        adUnitId: this.videoAdIdArr[this.videoAdIdIndex]
      })
      this.videoAd.onLoad(() => this.log('激励视频广告加载成功'))
      this.videoAd.onError((err: any) => {
        this.log('激励视频广告加载失败', err)
        if (this.isNoAd(err)) {
          this.videoAdIdIndex++
          if (this.videoAdIdIndex < this.videoAdIdArr.length) {
            this.log('激励视频广告无推荐，切换 id 重新加载')
            // this.showVideoAd(callback)
          } else {
            this.log('所有激励视频广告无推荐，重置 id')
            this.videoAdIdIndex = 0
          }
        }
        if (this.videoCallback != null) {
          this.videoCallback.onFail(false)
        }
      })
      // 监听用户关闭广告
      this.videoAd.onClose((res: any) => {
        // 小于 2.1.0 的基础库版本，res 是一个 undefined
        if ((res && res.isEnded) || res === undefined) {
          this.log('正常播放结束，下发游戏奖励')
          if (this.videoCallback != null) {
            this.videoCallback.onSuccess()
          }
        } else {
          this.log('播放中途退出，不下发游戏奖励')
          if (this.videoCallback != null) {
            this.videoCallback.onFail(true)
          }
        }
      })
    }

    // 用户触发广告后，显示激励视频广告
    this.videoAd
      .show()
      .then(() => this.log('激励视频广告显示成功'))
      .catch((err: any) => {
        this.log('激励视频广告显示失败，重试', err)
        this.videoAd
          .load()
          .then(() => this.videoAd.show())
          .then(() => this.log('激励视频广告显示成功'))
          .catch((err: any) => {
            this.log('激励视频广告显示失败', err)
            if (this.videoCallback != null) {
              this.videoCallback.onFail(false)
            }
          })
      })
  }

  showInterstitialAd(noAdRetry: boolean) {
    let wx = this.wx
    if (!wx) {
      return
    }

    if (wx.createInterstitialAd) {
      this.log('实例化插屏广告')
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: this.interstitialAdIdArr[this.interstitialAdIdIndex]
      })
      this.interstitialAd.onLoad(() => this.log('插屏广告加载成功'))
      this.interstitialAd.onError((err: any) => {
        this.log('插屏广告加载失败', err)
        if (this.isNoAd(err)) {
          this.interstitialAdIdIndex++
          if (this.interstitialAdIdIndex < this.interstitialAdIdArr.length) {
            this.log('插屏广告无推荐，切换 id 重新加载')
          } else {
            this.log('所有插屏广告无推荐，重置 id')
            this.interstitialAdIdIndex = 0
          }
          if (noAdRetry) {
            this.scheduleOnce(() => this.showInterstitialAd(false), 1)
          }
        }
      })
      this.interstitialAd.onClose((res: any) => this.log('插屏广告关闭', res))
    }

    if (this.interstitialAd) {
      this.interstitialAd
        .show()
        .then(() => this.log('插屏广告显示成功'))
        .catch((err: any) => this.log('插屏广告显示失败', err))
    }
  }

  private showFooterBannerAd() {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.showFooterAd(
      'Banner',
      wx,
      this.bannerAd,
      (screenWidth: number, screenHeight: number) => {
        this.bannerAd = wx.createBannerAd({
          adUnitId: this.footerBannerAdIdArr[this.footerBannerAdIdIndex],
          adIntervals: 30,
          style: {
            left: 0,
            top: 0,
            width: screenWidth // 宽度为 300 ~ 屏幕宽度，小于 300 时会取 300，大于屏幕宽度时会取屏幕宽度
          }
        })
        return this.bannerAd
      },
      () => {
        this.footerBannerAdIdIndex++
        if (this.footerBannerAdIdIndex < this.footerBannerAdIdArr.length) {
          this.log('底部 Banner 广告无推荐，切换 id 重新加载')
          this.scheduleOnce(() => this.showFooterBannerAd(), 5)
        } else {
          this.log('所有底部 Banner 广告无推荐，切换成底部格子广告')
          this.footerBannerAdIdIndex = 0
          this.scheduleOnce(() => this.showFooterGridAd(), 5)
        }
      }
    )
  }

  private showFooterGridAd() {
    let wx = this.wx
    if (!wx) {
      return
    }

    this.showFooterAd(
      '格子',
      wx,
      this.gridAd,
      (screenWidth: number, screenHeight: number) => {
        this.gridAd = wx.createGridAd({
          adUnitId: this.footerGridAdIdArr[this.footerGridAdIdIndex],
          adIntervals: 30,
          adTheme: 'white',
          gridCount: 5,
          style: {
            left: 0,
            top: 0,
            width: screenWidth, // 宽度为 300 ~ 屏幕宽度，小于 300 时会取 300，大于屏幕宽度时会取屏幕宽度
            opacity: 0.8
          }
        })
        return this.gridAd
      },
      () => {
        this.footerGridAdIdIndex++
        if (this.footerGridAdIdIndex < this.footerGridAdIdArr.length) {
          this.log('底部格子广告无推荐，切换 id 重新加载')
          this.scheduleOnce(() => this.showFooterGridAd(), 5)
        } else {
          this.log('所有底部格子广告无推荐，切换成底部 Banner 广告')
          this.footerGridAdIdIndex = 0
          this.scheduleOnce(() => this.showFooterBannerAd(), 5)
        }
      }
    )
  }

  private showFooterAd(
    desc: string,
    wx: any,
    originAd: any,
    createAdCallback: (screenWidth: number, screenHeight: number) => any,
    noAdCallback: () => void
  ) {
    if (originAd) {
      // 如果不对废弃的广告进行销毁，则会导致其上的事件监听器无法释放。当没有释放的广告积累过多时，将会产生性能问题
      originAd.destroy()
    }

    // 创建广告实例，提前初始化
    let { screenWidth, screenHeight } = wx.getSystemInfoSync()
    this.log(desc, 'screenWidth:', screenWidth, 'screenHeight:', screenHeight)
    let ad = createAdCallback(screenWidth, screenHeight)

    ad.onLoad(() => this.log('底部', desc, '广告加载成功'))
    ad.onError((err: any) => {
      this.log('底部', desc, '广告加载失败', err)
      if (this.isNoAd(err)) {
        noAdCallback()
      }
    })

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
      this.log('底部', desc, 'size.height:', size.height, 'adHeight:', adHeight)
      this.notifyFooterAdHeightUpdate(adHeight)

      // 在适合的场景显示广告
      ad.show()
        .then(() => this.log('底部', desc, '广告显示成功'))
        .catch((err: any) => this.log('底部', desc, '广告显示失败', err))
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
      menus: ['shareAppMessage', 'shareTimeline'],
      success: (res: any) => {
        // cc.log、cc.warn、cc.error 不会再微信小程序中输出日志
        this.log('开启被动转发成功', res)
      },
      fail: (res: any) => {
        this.log('开启被动转发失败', res)
      }
    })
    // 右上角菜单按钮 -> 发送给朋友
    wx.onShareAppMessage(() => {
      this.log('用户点击了发送给朋友')
      return {}
    })
    // 右上角菜单按钮 -> 分享到朋友圈
    if (wx.onShareTimeline) {
      this.log(`${sdkVersion} 支持朋友圈分享`)
      wx.onShareTimeline(() => {
        this.log('用户点击了分享到朋友圈')
        return {}
      })
    } else {
      this.log(`${sdkVersion} 版本过低，不支持朋友圈分享`)
    }
  }

  private getWx() {
    if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
      this.log('非微信小游戏')
      return false
    }

    let wx = window['wx']
    if (!wx) {
      this.log('window 上不存在 wx')
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
        this.log('获取设备类型成功', res)
        //判断用户手机是 iPhone X
        if (res.model.indexOf('iPhone X') != -1) {
          this.iPhoneX = true
        } else {
          this.iPhoneX = false
        }
      },
      fail: (res: any) => {
        this.log('获取设备类型失败', res)
      }
    })
  }

  private isNoAd(err: any) {
    if (err && err.errCode == 1004) {
      return true
    }
    return false
  }

  private log(...data: any[]): void {
    console.log(...data)
  }
}
