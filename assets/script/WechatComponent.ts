import Game from "./Game"

const { ccclass, property } = cc._decorator

@ccclass
export default class WechatComponent extends cc.Component {
  onLoad() {
    this.passiveShare()
  }

  passiveShare() {
    if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
      console.log("非微信小游戏")
      return
    }

    let wx = window["wx"]
    if (!wx) {
      console.log("window 上不存在 wx")
      return
    }

    let sdkVersion = wx.getSystemInfoSync().SDKVersion

    // 显示当前页面的「发送给朋友」和「分享到朋友圈」按钮
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
      success: res => {
        // cc.log、cc.warn、cc.error 不会再微信小程序中输出日志
        console.log("开启被动转发成功", res)
      },
      fail: res => {
        console.log("开启被动转发失败", res)
      }
    })
    // 右上角菜单按钮 -> 发送给朋友
    wx.onShareAppMessage(() => {
      console.log("用户点击了发送给朋友")
      return {}
    })
    // 右上角菜单按钮 -> 分享到朋友圈
    if (wx.onShareTimeline) {
      console.log(`${sdkVersion} 支持朋友圈分享`)
      wx.onShareTimeline(() => {
        console.log("用户点击了分享到朋友圈")
        return {}
      })
    } else {
      console.log(`${sdkVersion} 版本过低，不支持朋友圈分享`)
    }
  }
}
