import Game from "./Game"

const { ccclass, property } = cc._decorator

@ccclass
export default class FruitsComponent extends cc.Component {
  private static readonly FRUITS_COLLIDER_TAG: number = 10
  // 是否为顶部水果
  isHero: boolean = true
  // 水果图片索引
  fruitsIndex: number
  // 是否已经和其他水果进行过碰撞，检测是否展示警戒线会用到
  isCollided: boolean = false
  // 是否可以处理碰撞检测
  private canCollision: boolean = true
  // 超过警戒线后 update 方法执行次数
  private overCount: number = 0

  init(fruitsIndex: number) {
    // 主动调用 init 时都是非顶部水果
    this.isHero = false
    // 使用了 NodePool 重复利用，这里需要重新初始化相关属性
    this.isCollided = false
    this.canCollision = true
    this.overCount = 0

    this.fruitsIndex = fruitsIndex
    if (fruitsIndex <= 0 || fruitsIndex >= 11) {
      // 小芝麻或大水果不处理碰撞检测
      this.canCollision = false
    }
    this.getComponent(cc.PhysicsCircleCollider).tag =
      FruitsComponent.FRUITS_COLLIDER_TAG
  }

  update(dt: number) {
    // 当前顶部水果 || 游戏已经结束 => 不处理
    if (this.isHero || Game.instance.isGameOver()) {
      return
    }

    let top = this.node.y + this.node.height / 2
    if (Game.instance.isReachWarningLine(top)) {
      this.overCount++
      // 一直超过警戒线 1.5s 则游戏结束（update 方法 1s 执行 60 次，1.5s 执行 90 次）
      if (this.overCount > 90) {
        Game.instance.changeToGameOver()
      }
    } else {
      this.overCount = 0
    }
  }

  // 只在两个碰撞体开始接触时被调用一次
  onBeginContact(
    contact: cc.PhysicsContact,
    selfCollider: cc.PhysicsCollider,
    otherCollider: cc.PhysicsCollider
  ) {
    // FruitsComponent：onBeginContact bottom_up<PhysicsBoxCollider> fruits<PhysicsCircleCollider>
    // cc.log("FruitsComponent：onBeginContact",otherCollider.name,selfCollider.name)

    if (otherCollider.tag != FruitsComponent.FRUITS_COLLIDER_TAG) {
      // 碰撞的不是水果
      return
    }

    this.isCollided = true

    let other = otherCollider.node.getComponent(FruitsComponent)
    if (
      other &&
      this.canCollision &&
      other.canCollision &&
      this.fruitsIndex == other.fruitsIndex
    ) {
      // 标记为不处理碰撞检测，避免另一个被碰撞的相同的水果也处理这段逻辑，导致合成两个新水果
      this.canCollision = false
      other.canCollision = false

      Game.instance.composeFruits(this, other)
    }
  }

  // 只在两个碰撞体结束接触时被调用一次
  onEndContact(
    contact: cc.PhysicsContact,
    selfCollider: cc.PhysicsCollider,
    otherCollider: cc.PhysicsCollider
  ) {
    // cc.log("FruitsComponent：onEndContact")
  }

  // 每次将要处理碰撞体接触逻辑时被调用
  onPreSolve(
    contact: cc.PhysicsContact,
    selfCollider: cc.PhysicsCollider,
    otherCollider: cc.PhysicsCollider
  ) {
    // cc.log("FruitsComponent：onPreSolve")
  }

  // 每次处理完碰撞体接触逻辑时被调用
  onPostSolve(
    contact: cc.PhysicsContact,
    selfCollider: cc.PhysicsCollider,
    otherCollider: cc.PhysicsCollider
  ) {
    // cc.log("FruitsComponent：onPostSolve")
  }
}
