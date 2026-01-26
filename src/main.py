# src/main.py
import sys
import json
import os
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *

class TransparentMemo(QWidget):
    def __init__(self):
        super().__init__()
        
        # load style.css
        self.load_stylesheet()
        
        # 設置窗口屬性
        self.setWindowFlags(
            Qt.FramelessWindowHint |  # 無邊框
            Qt.WindowStaysOnTopHint  # 置頂
        )
        
        # 配置
        self.config_file = "config/settings.json"
        self.load_config()
        
        self.init_ui()
        self.load_data()

    def load_stylesheet(self):
        """載入外部CSS文件"""
        css_file = "style.css"
        current_dir = os.path.dirname(os.path.abspath(__file__))
        css_path = os.path.join(current_dir, "style.css")
        
        if os.path.exists(css_path):
            try:
                with open(css_path, "r", encoding="utf-8") as f:
                    css_content = f.read()
                    self.setStyleSheet(css_content)
                    print(f"✅ CSS載入成功！")
            except Exception as e:
                print(f"❌ CSS讀取失敗: {e}")
                self.set_default_style()
        else:
            print(f"❌ CSS文件不存在！請檢查路徑")
            # 列出當前目錄的檔案
            print(f"📂 當前目錄內容:")
            for file in os.listdir(current_dir):
                print(f"  - {file}")
            self.set_default_style()
    
    def set_default_style(self):
        """預設樣式（當CSS文件不存在時）"""
        self.setStyleSheet("""
            QWidget {
                background-color: #E6F3FF;
                border-radius: 15px;
                border: 2px solid #87CEEB;
            }
            QLabel { color: #2E5A88; }
        """)
    
    def init_ui(self):
        # 主佈局
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 40, 20, 20)
        
        # 標題欄（可拖拽）
        self.title_bar = QWidget()
        self.title_bar.setFixedHeight(30)
        title_layout = QHBoxLayout(self.title_bar)
        title_layout.setContentsMargins(5, 0, 5, 0)
        
        # 釘選按鈕
        self.pin_btn = QPushButton()
        self.pin_btn.setIcon(QIcon("icons/pin.png"))
        self.pin_btn.setCheckable(True)
        self.pin_btn.setChecked(self.config['pinned'])
        self.pin_btn.setToolTip("釘選/取消釘選")
        self.pin_btn.clicked.connect(self.toggle_pin)
        self.pin_btn.setObjectName("pinButton")
        
        # 透明度滑塊
        opacity_label = QLabel("透明度:")
        opacity_label.setObjectName("opacityLabel")
        self.opacity_slider = QSlider(Qt.Horizontal)
        self.opacity_slider.setRange(30, 100)
        self.opacity_slider.setValue(int(self.config['opacity'] * 100))
        self.opacity_slider.valueChanged.connect(self.change_opacity)
        self.opacity_slider.setFixedWidth(80)
        
        # 關閉按鈕
        close_btn = QPushButton()
        close_btn.setIcon(QIcon("icons/close.png"))
        close_btn.clicked.connect(self.close)
        close_btn.setToolTip("關閉")
        close_btn.setObjectName("closeButton")
        
        # 添加標題欄組件
        title_layout.addWidget(self.pin_btn)
        title_layout.addWidget(opacity_label)
        title_layout.addWidget(self.opacity_slider)
        title_layout.addStretch()
        title_layout.addWidget(close_btn)
        
        # 內容區域
        self.tab_widget = QTabWidget()
        self.tab_widget.setDocumentMode(True)
        
        # Memo頁面
        self.memo_text = QTextEdit()
        self.memo_text.setPlaceholderText("輸入您的備忘錄...")
        self.memo_text.setObjectName("memoText")
        
        # Todo頁面
        self.todo_widget = QWidget()
        todo_layout = QVBoxLayout(self.todo_widget)
        
        # Todo輸入區域
        todo_input_layout = QHBoxLayout()
        self.todo_input = QLineEdit()
        self.todo_input.setPlaceholderText("添加新待辦事項...")
        self.todo_input.setObjectName("todoInput")
        add_btn = QPushButton("+")
        add_btn.setFixedWidth(30)
        add_btn.clicked.connect(self.add_todo)
        add_btn.setObjectName("addButton")
        todo_input_layout.addWidget(self.todo_input)
        todo_input_layout.addWidget(add_btn)
        
        # Todo列表
        self.todo_list = QListWidget()
        todo_layout.addLayout(todo_input_layout)
        todo_layout.addWidget(self.todo_list)
        
        # 添加頁面
        self.tab_widget.addTab(self.memo_text, "📝 備忘錄")
        self.tab_widget.addTab(self.todo_widget, "✅ 待辦事項")
        
        # 添加到主佈局
        main_layout.addWidget(self.title_bar)
        main_layout.addWidget(self.tab_widget)
        
        # 保存按鈕
        save_btn = QPushButton("儲存")
        save_btn.clicked.connect(self.save_data)
        save_btn.setObjectName("saveButton")
        main_layout.addWidget(save_btn)
        
        self.setLayout(main_layout)
        
        # 設置初始大小和位置
        self.setGeometry(
            self.config['position']['x'],
            self.config['position']['y'],
            self.config['size']['width'],
            self.config['size']['height']
        )
        
        # 設置透明度
        self.setWindowOpacity(self.config['opacity'])
        
    def mousePressEvent(self, event):
        """實現窗口拖動"""
        if event.button() == Qt.LeftButton:
            self.drag_position = event.globalPos() - self.frameGeometry().topLeft()
            event.accept()
            
    def mouseMoveEvent(self, event):
        """實現窗口拖動"""
        if event.buttons() == Qt.LeftButton and hasattr(self, 'drag_position'):
            self.move(event.globalPos() - self.drag_position)
            event.accept()
            
    def toggle_pin(self):
        """切換釘選狀態"""
        self.config['pinned'] = self.pin_btn.isChecked()
        if self.config['pinned']:
            self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        else:
            self.setWindowFlags(self.windowFlags() & ~Qt.WindowStaysOnTopHint)
        self.show()
        self.save_config()
        
    def change_opacity(self, value):
        """改變透明度"""
        opacity = value / 100.0
        self.setWindowOpacity(opacity)
        self.config['opacity'] = opacity
        self.save_config()
        
    def add_todo(self):
        """添加待辦事項"""
        text = self.todo_input.text().strip()
        if text:
            item = QListWidgetItem(text)
            item.setFlags(item.flags() | Qt.ItemIsUserCheckable)
            item.setCheckState(Qt.Unchecked)
            self.todo_list.addItem(item)
            self.todo_input.clear()
            self.save_data()
            
    def load_data(self):
        """加載數據"""
        try:
            with open("data/memo.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                self.memo_text.setPlainText(data.get("memo", ""))
                
                # 加載todo
                self.todo_list.clear()
                for todo in data.get("todos", []):
                    item = QListWidgetItem(todo["text"])
                    item.setFlags(item.flags() | Qt.ItemIsUserCheckable)
                    item.setCheckState(Qt.Checked if todo["done"] else Qt.Unchecked)
                    self.todo_list.addItem(item)
        except:
            pass
            
    def save_data(self):
        """保存數據"""
        data = {
            "memo": self.memo_text.toPlainText(),
            "todos": []
        }
        
        for i in range(self.todo_list.count()):
            item = self.todo_list.item(i)
            data["todos"].append({
                "text": item.text(),
                "done": item.checkState() == Qt.Checked
            })
            
        os.makedirs("data", exist_ok=True)
        with open("data/memo.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    def load_config(self):
        """加載配置"""
        default_config = {
            "opacity": 0.8,
            "pinned": True,
            "position": {"x": 100, "y": 100},
            "size": {"width": 300, "height": 400}
        }
        
        try:
            os.makedirs("config", exist_ok=True)
            if os.path.exists(self.config_file):
                with open(self.config_file, "r") as f:
                    self.config = json.load(f)
            else:
                self.config = default_config
        except:
            self.config = default_config
            
    def save_config(self):
        """保存配置"""
        self.config['position'] = {
            'x': self.x(),
            'y': self.y()
        }
        self.config['size'] = {
            'width': self.width(),
            'height': self.height()
        }
        
        with open(self.config_file, "w") as f:
            json.dump(self.config, f, indent=2)
            
    def closeEvent(self, event):
        """關閉事件"""
        self.save_data()
        self.save_config()
        event.accept()
        
    def close(self):
        """正確關閉程式"""
        self.save_data()  # 如果有需要保存的數據
        self.save_config()
        QApplication.quit()  # 正確退出

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    # 設置應用程序圖標
    app.setWindowIcon(QIcon("icons/app.ico"))
    
    window = TransparentMemo()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()