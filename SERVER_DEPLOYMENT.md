# 🚀 服務器端後端系統部署指南

## 📋 **快速啟動（推薦）**

### 1. 進入後端目錄
```bash
cd /Users/yifubai/Desktop/image_vape/backend
```

### 2. 生產環境啟動
```bash
# 使用 Gunicorn 啟動（推薦）
gunicorn -c gunicorn.conf.py wsgi:application

# 或者後台運行
nohup gunicorn -c gunicorn.conf.py wsgi:application > logs/gunicorn.log 2>&1 &
```

### 3. 開發環境啟動
```bash
# 直接運行（僅開發使用）
python3 run.py

# 或者使用 WSGI
python3 wsgi.py
```

## 🔧 **詳細部署步驟**

### **Step 1: 環境準備**
```bash
# 1. 進入後端目錄
cd /Users/yifubai/Desktop/image_vape/backend

# 2. 創建虛擬環境（如果需要）
python3 -m venv venv

# 3. 激活虛擬環境
source venv/bin/activate

# 4. 安裝依賴
pip install -r requirements.txt
```

### **Step 2: 配置環境變量**
```bash
# 複製環境變量模板
cp env.example .env

# 編輯環境變量
nano .env
```

環境變量配置範例：
```bash
# Flask 配置
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DEBUG=False

# 數據庫配置
DATABASE_URL=sqlite:///deepvape_prod.db

# 服務器配置
PORT=5001
HOST=0.0.0.0

# 管理員配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# 日誌配置
LOG_LEVEL=info
```

### **Step 3: 數據庫初始化**
```bash
# 自動部署（推薦）
chmod +x deploy.sh
./deploy.sh

# 或手動初始化
python3 -c "
from wsgi import application
with application.app_context():
    from app import init_db
    init_db()
    print('數據庫初始化完成')
"
```

### **Step 4: 啟動服務**

#### **方法 A: Gunicorn（生產環境推薦）**
```bash
# 前台運行
gunicorn -c gunicorn.conf.py wsgi:application

# 後台運行
nohup gunicorn -c gunicorn.conf.py wsgi:application > logs/gunicorn.log 2>&1 &

# 查看進程
ps aux | grep gunicorn

# 停止服務
pkill -f gunicorn
```

#### **方法 B: 系統服務（推薦）**
創建系統服務文件：
```bash
# 創建服務文件
sudo nano /etc/systemd/system/deepvape-backend.service
```

服務文件內容：
```ini
[Unit]
Description=Deepvape Backend Service
After=network.target

[Service]
Type=notify
User=yifubai
Group=staff
WorkingDirectory=/Users/yifubai/Desktop/image_vape/backend
Environment=PATH=/Users/yifubai/Desktop/image_vape/backend/venv/bin
ExecStart=/Users/yifubai/Desktop/image_vape/backend/venv/bin/gunicorn -c gunicorn.conf.py wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

啟動系統服務：
```bash
# 重載服務配置
sudo systemctl daemon-reload

# 啟動服務
sudo systemctl start deepvape-backend

# 設置開機自啟
sudo systemctl enable deepvape-backend

# 查看狀態
sudo systemctl status deepvape-backend

# 查看日誌
sudo journalctl -u deepvape-backend -f
```

#### **方法 C: Docker 部署**
```bash
# 構建鏡像
docker build -t deepvape-backend .

# 運行容器
docker run -d \
  --name deepvape-backend \
  -p 5001:5001 \
  -v $(pwd)/instance:/app/instance \
  -v $(pwd)/logs:/app/logs \
  deepvape-backend

# 查看日誌
docker logs deepvape-backend -f
```

## 🌐 **訪問地址**

部署完成後，可通過以下地址訪問：

- **本地訪問**: http://localhost:5001
- **網路訪問**: http://192.168.2.16:5001 (您的內網 IP)
- **登入頁面**: http://localhost:5001/login
- **管理後台**: http://localhost:5001/admin

### **默認登入資訊**
- 帳號: `admin`
- 密碼: `admin123`

## 🔍 **服務狀態檢查**

### **檢查服務是否運行**
```bash
# 檢查進程
ps aux | grep gunicorn

# 檢查端口
netstat -tulpn | grep :5001
lsof -i :5001

# 健康檢查
curl http://localhost:5001/health
```

### **查看日誌**
```bash
# Gunicorn 日誌
tail -f logs/gunicorn.log

# 應用日誌
tail -f logs/app.log

# 系統服務日誌
sudo journalctl -u deepvape-backend -f
```

## 🚨 **故障排除**

### **常見問題**

#### **1. 端口被佔用**
```bash
# 查找佔用進程
lsof -i :5001

# 殺死進程
kill -9 <PID>

# 或修改端口
export PORT=5002
```

#### **2. 權限問題**
```bash
# 修改文件權限
chmod +x deploy.sh
chmod +x wsgi.py

# 修改目錄權限
chmod -R 755 static/
chmod -R 755 templates/
```

#### **3. 依賴問題**
```bash
# 重新安裝依賴
pip install -r requirements.txt --force-reinstall

# 或更新 pip
pip install --upgrade pip
```

#### **4. 數據庫問題**
```bash
# 重新初始化數據庫
rm -f deepvape_dev.db
python3 -c "from wsgi import application; from app import init_db; init_db()"
```

## 📊 **性能監控**

### **系統資源監控**
```bash
# CPU 和內存使用
top
htop

# 磁盤使用
df -h

# 網路連接
netstat -an | grep :5001
```

### **應用監控**
```bash
# 查看 Gunicorn 工作進程
pstree -p | grep gunicorn

# 監控請求日誌
tail -f logs/gunicorn.log | grep "GET\|POST"
```

## 🔄 **更新部署**

### **更新代碼**
```bash
# 停止服務
sudo systemctl stop deepvape-backend

# 更新代碼
git pull origin main

# 重新部署
./deploy.sh

# 啟動服務
sudo systemctl start deepvape-backend
```

### **零停機更新**
```bash
# 使用 Gunicorn 熱重載
kill -HUP $(pgrep -f "gunicorn.*wsgi:application")
```

## 📞 **技術支援**

如遇問題，請提供以下資訊：
1. 錯誤訊息截圖
2. 日誌文件內容
3. 系統環境資訊
4. 部署步驟說明

**聯絡方式**：
- 技術支援: tech-support@deepvape.com
- 緊急聯絡: 請查看系統日誌並重啟服務 