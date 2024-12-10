# 合成大坑

## 自动编译并刷新

- 全局安装 nodemon

```shell
npm i -g nodemon
```

- 监听到 assets/script 目录中的 js 和 ts 文件变化后自动重新编译并刷新浏览器

```shell
nodemon --watch assets/script --ext "js ts" --exec "curl http://localhost:7456/update-db"
```

- 也可以配置到 tasks.json 中。command + shift + B，然后选择 autorefresh

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "autorefresh",
      "type": "shell",
      "command": "nodemon",
      "args": [
        "--watch",
        "assets/script",
        "--ext",
        "js ts",
        "--exec",
        "curl http://localhost:7456/update-db"
      ],
      "isBackground": true,
      "group": "build",
      "presentation": {
        "reveal": "always"
      },
      "problemMatcher": []
    }
  ]
}
```

- 也可以配置到 launch.json 中

```json
{
  "version": "1.4.0",
  "configurations": [
    {
      "name": "Creator Debug: Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:7456",
      "sourceMaps": true,
      "userDataDir": "${workspaceFolder}/.vscode/chrome",
      "diagnosticLogging": false,
      "pathMapping": {
        "/preview-scripts/assets": "${workspaceFolder}/temp/quick-scripts/dst/assets",
        "/": "${workspaceFolder}"
      }
    },
    {
      "name": "autorefresh",
      "request": "launch",
      "type": "node",
      "runtimeExecutable": "nodemon",
      "args": [
        "--watch",
        "assets/script",
        "--ext",
        "js ts",
        "--exec",
        "curl http://localhost:7456/update-db"
      ],
      "console": "integratedTerminal",
      "protocol": "inspector"
    }
  ]
}
```

## 作者联系方式

| 个人主页 | 邮箱 |
| ------------- | ------------ |
| <a  href="https://www.bingoogolapple.cn" target="_blank">bingoogolapple.cn</a>  | <a href="mailto:bingoogolapple@gmail.com" target="_blank">bingoogolapple@gmail.com</a> |

| 个人微信号 | 微信群 | 公众号 |
| ------------ | ------------ | ------------ |
| <img width="180" alt="个人微信号" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/BGAQrCode.png"> | <img width="180" alt="微信群" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/WeChatGroup1QrCode.jpg"> | <img width="180" alt="公众号" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/GongZhongHao.png"> |

| 个人 QQ 号 | QQ 群 |
| ------------ | ------------ |
| <img width="180" alt="个人 QQ 号" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/BGAQQQrCode.jpg"> | <img width="180" alt="QQ 群" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/QQGroup1QrCode.jpg"> |

## 打赏支持作者

如果您觉得 BGA 系列开源库或工具软件帮您节省了大量的开发时间，可以扫描下方的二维码打赏支持。您的支持将鼓励我继续创作，打赏后还可以加我微信免费开通一年 [上帝小助手浏览器扩展/插件开发平台](https://github.com/bingoogolapple/bga-god-assistant-config) 的会员服务

| 微信 | QQ | 支付宝 |
| ------------- | ------------- | ------------- |
| <img width="180" alt="微信" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/donate-wechat.jpg"> | <img width="180" alt="QQ" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/donate-qq.jpg"> | <img width="180" alt="支付宝" src="https://github.com/bingoogolapple/bga-god-assistant-config/raw/main/images/donate-alipay.jpg"> |

## 作者项目推荐

* 欢迎您使用我开发的第一个独立开发软件产品 [上帝小助手浏览器扩展/插件开发平台](https://github.com/bingoogolapple/bga-god-assistant-config)
