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
