# build.py
import PyInstaller.__main__
import os

# 創建必要目錄
os.makedirs("icons", exist_ok=True)
os.makedirs("config", exist_ok=True)
os.makedirs("data", exist_ok=True)

# PyInstaller配置
args = [
    'src/main.py',
    '--name=DesktopMemo',
    '--onefile',
    '--windowed',  # 不顯示控制台
    '--icon=icons/app.ico',
    '--add-data=icons;icons',
    '--add-data=config;config',
    '--add-data=data;data',
    '--clean',
    '--noconfirm',
]

# 添加隱藏導入（PyQt5相關）
hidden_imports = [
    'PyQt5.QtCore',
    'PyQt5.QtGui',
    'PyQt5.QtWidgets',
    'json',
    'os',
    'sys',
]

for imp in hidden_imports:
    args.append(f'--hidden-import={imp}')

# 運行PyInstaller
PyInstaller.__main__.run(args)

print("打包完成！exe文件在 dist/ 目錄下")