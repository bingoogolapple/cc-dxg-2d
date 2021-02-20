import FruitsComponent from "./FruitsComponent"

const { ccclass, property } = cc._decorator

enum GameMode {
  WATERMELON,
  SESAME
}

enum GameState {
  PLAYING,
  GAME_OVER
}

@ccclass
export default class Game extends cc.Component {
  private static readonly COLOR_ARR: cc.Color[] = [
    new cc.Color(249, 237, 223, 100),
    new cc.Color(223, 201, 99, 100),
    new cc.Color(191, 199, 81, 100),
    new cc.Color(245, 66, 57, 100),
    new cc.Color(198, 225, 72, 100),
    new cc.Color(242, 250, 252, 100),
    new cc.Color(244, 127, 60, 100),
    new cc.Color(200, 169, 92, 100),
    new cc.Color(242, 238, 235, 100),
    new cc.Color(252, 74, 61, 100)
  ]
  private static readonly WATERMELON_ARR: number[] = [
    1,
    2,
    2,
    3,
    3,
    3,
    4,
    4,
    5,
    5
  ]
  private static readonly SESAME_ARR: number[] = [10, 9, 9, 8, 8, 8, 7, 7, 6, 6]
  static instance: Game = null

  @property(cc.Label)
  private switchGameModeLabel: cc.Label = null
  @property(cc.Label)
  private switchAiLabel: cc.Label = null
  @property(cc.Label)
  private titleLabel: cc.Label = null
  @property(cc.Label)
  private scoreLabel: cc.Label = null

  @property(cc.Node)
  private heroNode: cc.Node = null
  @property(cc.Node)
  private warningLineNode: cc.Node = null
  @property(cc.Node)
  private bombNode: cc.Node = null

  @property(cc.Node)
  private gameOverNode: cc.Node = null

  @property(cc.Prefab)
  private fruitsPrefab: cc.Prefab = null

  @property([cc.SpriteFrame])
  private fruitsFrameArr: cc.SpriteFrame[] = []
  @property(cc.SpriteFrame)
  private bombFrame: cc.SpriteFrame = null
  @property(cc.AudioClip)
  private bombAudioClip: cc.AudioClip = null

  private gameMode: GameMode = GameMode.WATERMELON
  private gameState: GameState = GameState.PLAYING
  private step: number = 0
  private fruitsIndex: number = 1
  private score: number = 0
  private isAI: boolean = false

  private aiFunc: Function = () => {
    this.heroNode.active = false
    if (this.isGameOver()) {
      this.unschedule(this.aiFunc)
      return
    }

    let fruitsSize = this.heroNode.width
    let minX = -cc.winSize.width / 2 + fruitsSize / 2
    let heroX = minX + Math.random() * (cc.winSize.width - fruitsSize)
    cc.tween(this.heroNode)
      .to(0.05, { x: heroX })
      .call(() => {
        this.addFruitsNode(this.fruitsIndex, this.heroNode.getPosition())
        this.scheduleOnce(this.showHero.bind(this), 1)
      })
      .start()
  }

  /**
   * 停止 AI 自动玩
   */
  private stopAI() {
    if (!this.isAI) {
      return
    }
    this.isAI = false
    this.switchAiLabel.string = "启动 AI"
    this.unschedule(this.aiFunc)
  }

  /**
   * 开始 AI 自动玩
   */
  private startAI() {
    if (!this.isAI) {
      return
    }

    this.isAI = true
    this.switchAiLabel.string = "停止 AI"

    this.scheduleOnce(() => {
      this.aiFunc()
      this.schedule(this.aiFunc, 1.4)
    }, 0.2)
  }

  onLoad() {
    Game.instance = this

    // 绑定触摸事件
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)

    // 初始化游戏
    this.init()

    this.startAI()
  }

  onDestroy() {
    // 取消绑定触摸事件
    this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
  }

  update(dt: number) {
    // 刷新警戒线展示状态
    this.handleWarningLineVisibility()
  }

  /**
   * 初始化游戏
   */
  private init() {
    // 移除所有水果节点
    this.removeAllFruits()
    // 开启物理系统
    cc.director.getPhysicsManager().enabled = true

    this.score = 0
    this.scoreLabel.string = "0"
    cc.tween(this.scoreLabel.node)
      .to(0.25, { scale: 1.3 })
      .to(0.25, { scale: 1 })
      .start()

    this.step = 0
    this.gameState = GameState.PLAYING
    this.gameOverNode.active = false

    this.showHero()
  }

  /**
   * 处理警戒线展示状态
   */
  handleWarningLineVisibility() {
    if (this.isGameOver()) {
      return
    }

    let children = this.node.children
    for (let i = 0; i < children.length; i++) {
      let fruitsComponent = children[i].getComponent(FruitsComponent)
      if (fruitsComponent == null) {
        continue
      }
      let top = fruitsComponent.node.y + fruitsComponent.node.height / 2
      // 已经碰撞过其他水果 && 当前水果位置 > 警戒线位置 - 150
      if (fruitsComponent.isCollided && top > this.warningLineNode.y - 150) {
        this.warningLineNode.active = true
        return
      }
    }
    this.warningLineNode.active = false
  }

  /**
   * 处理手指按下事件
   */
  private onTouchStart(e: cc.Event.EventTouch) {
    if (!this.heroNode.active || this.isGameOver() || this.isAI) {
      return
    }
    this.setHeroX(e)
  }

  /**
   * 处理手指移动事件
   */
  private onTouchMove(e: cc.Event.EventTouch) {
    if (!this.heroNode.active || this.isGameOver() || this.isAI) {
      return
    }
    this.setHeroX(e)
  }

  /**
   * 处理手指抬起事件
   */
  private onTouchEnd(e: cc.Event.EventTouch) {
    if (!this.heroNode.active || this.isGameOver() || this.isAI) {
      return
    }
    this.setHeroX(e)

    this.scheduleOnce(() => {
      this.heroNode.active = false
      this.addFruitsNode(this.fruitsIndex, this.heroNode.getPosition())
      this.scheduleOnce(this.showHero.bind(this), 1)
    }, 0.06)
  }

  /**
   * 设置顶部水果的 x 坐标
   */
  private setHeroX(e: cc.Event.EventTouch) {
    let heroX = this.node.convertToNodeSpaceAR(e.getLocation()).x
    heroX = Math.min(heroX, cc.winSize.width / 2 - this.heroNode.width / 2)
    heroX = Math.max(heroX, -cc.winSize.width / 2 + this.heroNode.width / 2)
    if (this.heroNode.x === 0 && heroX !== 0) {
      cc.tween(this.heroNode).to(0.05, { x: heroX }).start()
    } else {
      this.heroNode.x = heroX
    }
  }

  /**
   * 展示顶部的水果节点
   */
  private showHero() {
    if (this.isGameOver()) {
      return
    }

    this.generateFruitsIndex()

    this.heroNode.getComponent(FruitsComponent).fruitsIndex = this.fruitsIndex
    // 更新水果节点图片、尺寸等
    this.heroNode.getComponent(cc.Sprite).spriteFrame = this.fruitsFrameArr[
      this.fruitsIndex
    ]

    let fruitsSize = this.calculateFruitsSize(this.fruitsIndex)
    this.heroNode.width = fruitsSize
    this.heroNode.height = fruitsSize
    this.heroNode.x = 0
    if (this.gameMode == GameMode.WATERMELON) {
      this.heroNode.y = cc.winSize.height / 2 - 80 - fruitsSize / 2
    } else {
      this.heroNode.y = cc.winSize.height / 2 - 60 - fruitsSize / 2
    }
    this.heroNode.scale = 0.8
    this.heroNode.active = true

    // 从 0.8 缩放到 1
    cc.tween(this.heroNode).to(0.2, { scale: 1 }).start()
  }

  private generateFruitsIndex() {
    this.step++
    if (this.gameMode == GameMode.WATERMELON) {
      // 生成合成大西瓜索引
      let index = Math.floor(Math.random() * Game.WATERMELON_ARR.length)
      if (this.step <= 2) {
        index = 0
      }
      this.fruitsIndex = Game.WATERMELON_ARR[index]
    } else {
      // 生成合成小芝麻索引
      let index = Math.floor(Math.random() * Game.SESAME_ARR.length)
      if (this.step <= 2) {
        index = 0
      }
      this.fruitsIndex = Game.SESAME_ARR[index]
    }
  }

  /**
   * 计算水果节点大小
   */
  private calculateFruitsSize(fruitsIndex: number) {
    return 20 + fruitsIndex * 25
  }

  /**
   * 添加新的水果节点
   */
  private addFruitsNode(fruitsIndex: number, position: cc.Vec2) {
    if (this.isGameOver()) {
      return
    }

    let fruitsNode: cc.Node = cc.instantiate(this.fruitsPrefab)
    let fruitsSize = this.calculateFruitsSize(fruitsIndex)
    fruitsNode.width = fruitsSize
    fruitsNode.height = fruitsSize
    fruitsNode.setPosition(position)
    fruitsNode.getComponent(cc.Sprite).spriteFrame = this.fruitsFrameArr[
      fruitsIndex
    ]
    fruitsNode.getComponent(cc.RigidBody).gravityScale = 4 + fruitsIndex * 0.5
    fruitsNode.getComponent(cc.PhysicsCircleCollider).radius = fruitsSize / 2
    let fruitsComponent = fruitsNode.getComponent(FruitsComponent)
    fruitsComponent.init(fruitsIndex)
    fruitsNode.parent = this.node

    if (fruitsIndex === 0 || fruitsIndex === this.fruitsFrameArr.length - 1) {
      // 胜利，游戏结束
      this.changeToGameOver()
    }
  }

  /**
   * 合并成新的水果节点
   */
  composeFruits(fruits1: FruitsComponent, fruits2: FruitsComponent) {
    if (this.isGameOver()) {
      return
    }

    fruits1.node.removeFromParent()
    fruits2.node.removeFromParent()

    this.playBombSound()
    this.incrementScore(fruits1.fruitsIndex)
    this.addBombNode(fruits1)
    this.addBombNode(fruits2)

    let minPosition = fruits1.node.getPosition()
    if (minPosition.y > fruits2.node.getPosition().y) {
      minPosition = fruits2.node.getPosition()
    }

    this.scheduleOnce(() => {
      if (this.gameMode == GameMode.WATERMELON) {
        this.addFruitsNode(fruits1.fruitsIndex + 1, minPosition)
      } else {
        this.addFruitsNode(fruits1.fruitsIndex - 1, minPosition)
      }
    }, 0.2)
  }

  /**
   * 增加分数
   */
  private incrementScore(fruitsIndex: number) {
    if (this.gameMode == GameMode.SESAME) {
      fruitsIndex = this.fruitsFrameArr.length - 1 - fruitsIndex
    }
    this.score += fruitsIndex
    this.scoreLabel.string = this.score.toString()
    cc.tween(this.scoreLabel.node)
      .to(0.25, { scale: 1.3 })
      .to(0.25, { scale: 1 })
      .start()
  }

  /**
   * 播放爆炸音效
   */
  private playBombSound() {
    cc.audioEngine.playEffect(this.bombAudioClip, false)
  }

  /**
   * 添加爆炸节点并播放爆炸效果
   */
  private addBombNode(fruitsComponent: FruitsComponent) {
    // 动态创建一个 Node
    let bombNode: cc.Node = new cc.Node()
    // 添加 Sprite 组件并设置爆炸的图片
    let bombSprite: cc.Sprite = bombNode.addComponent(cc.Sprite)
    bombSprite.spriteFrame = this.bombFrame
    bombSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM

    bombNode.setPosition(fruitsComponent.node.getPosition())
    bombNode.width = fruitsComponent.node.width
    bombNode.height = fruitsComponent.node.width
    bombNode.scale = 0.9
    bombNode.parent = this.node
    bombNode.color = Game.COLOR_ARR[fruitsComponent.fruitsIndex - 1]

    cc.tween(bombNode)
      .to(0.2, { scale: 1.3 })
      .call(() => {
        bombNode.removeFromParent()
      })
      .start()
  }

  private playWinBomb(position: cc.Vec2, color: cc.Color) {
    this.bombNode.setPosition(position)
    let particle = this.bombNode.getComponent(cc.ParticleSystem)
    particle.startColor = particle.endColor = color
    particle.duration = 0.2
    particle.resetSystem()
  }

  /**
   * 是否达到警戒线高度
   */
  isReachWarningLine(top: number) {
    return top > this.warningLineNode.y
  }

  /**
   * 游戏是否结束
   */
  isGameOver() {
    return this.gameState == GameState.GAME_OVER
  }

  /**
   * 切换到游戏结束状态
   */
  changeToGameOver() {
    // 关闭物理系统
    cc.director.getPhysicsManager().enabled = false

    this.gameState = GameState.GAME_OVER
    this.heroNode.active = false
    this.warningLineNode.active = false

    // 所有水果节点播放爆炸动画并移除
    let bombTotalTime = 0
    let children = this.node.children
    for (let i = 0; i < children.length; i++) {
      let fruitsComponent = children[i].getComponent(FruitsComponent)
      if (!fruitsComponent || fruitsComponent.isHero) {
        continue
      }

      let delayTime = 0.1 + 0.05 * i
      if (bombTotalTime < delayTime) {
        bombTotalTime = delayTime
      }
      // 播放单个水果节点在游戏结束时的爆炸效果
      this.scheduleOnce(() => {
        this.playBombSound()

        if (
          fruitsComponent.fruitsIndex > 0 &&
          fruitsComponent.fruitsIndex < this.fruitsFrameArr.length - 1
        ) {
          this.addBombNode(fruitsComponent)
        } else {
          this.playWinBomb(
            fruitsComponent.node.getPosition(),
            Game.COLOR_ARR[3]
          )
        }

        this.incrementScore(fruitsComponent.fruitsIndex)
        fruitsComponent.node.removeFromParent()
      }, delayTime)
    }

    // 全部爆炸动画结束后展示游戏结束页面
    this.scheduleOnce(() => {
      this.showGameOverPage()
    }, bombTotalTime + 0.2)
  }

  /**
   * 展示游戏结束页面
   */
  private showGameOverPage() {
    // 展示当前分数
    this.gameOverNode
      .getChildByName("label_score")
      .getComponent(cc.Label).string = this.score.toString()
    // 更新最大分数
    let bestScore = cc.sys.localStorage.getItem("dxg_best_score")
    if (!bestScore) {
      bestScore = 0
    }
    if (bestScore < this.score) {
      bestScore = this.score
    }
    cc.sys.localStorage.setItem("dxg_best_score", bestScore)
    // 展示最大分数
    this.gameOverNode
      .getChildByName("label_best_score")
      .getComponent(cc.Label).string = bestScore
    // 展示游戏结束页面
    this.gameOverNode.active = true

    if (this.isAI) {
      this.scheduleOnce(() => {
        this.init()
        this.startAI()
      }, 2)
    }
  }

  /**
   * 移除所有水果
   */
  private removeAllFruits() {
    let children = this.node.children
    for (let i = children.length - 1; i >= 0; i--) {
      let fruitsComponent = children[i].getComponent(FruitsComponent)
      if (!fruitsComponent || fruitsComponent.isHero) {
        continue
      }
      fruitsComponent.node.removeFromParent()
    }
  }

  onClickBtn(target: cc.Event.EventTouch, data: string) {
    if (data === "switchGameMode") {
      if (this.gameMode == GameMode.WATERMELON) {
        this.gameMode = GameMode.SESAME
        this.switchGameModeLabel.string = "大西瓜"
        this.titleLabel.string = this.titleLabel.string.replace(
          "大西瓜",
          "小芝麻"
        )
      } else {
        this.gameMode = GameMode.WATERMELON
        this.switchGameModeLabel.string = "小芝麻"
        this.titleLabel.string = this.titleLabel.string.replace(
          "小芝麻",
          "大西瓜"
        )
      }
      this.unscheduleAllCallbacks()
      this.stopAI()
      this.init()
    } else if (data === "replay") {
      this.unscheduleAllCallbacks()
      this.stopAI()
      this.init()
    } else if (data === "switchAI") {
      this.unscheduleAllCallbacks()
      if (this.isAI) {
        this.stopAI()
        if (!this.heroNode.active) {
          this.showHero()
        }
      } else {
        this.isAI = true
        this.startAI()
      }
    }
  }
}
