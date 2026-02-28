 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index 8f731759a4e3c3d68981ce60d731a96057cac917..24ebd483ddf9b3ce66fb7180ed64698d87dddac0 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,24 @@
-# name_air
-no
+# Name Air 文本编辑器
+
+一个轻量的浏览器文本编辑器（纯 HTML/CSS/JavaScript）。
+
+## 功能
+
+- 支持实时编辑文本
+- 显示字符数与行数统计
+- 自动保存内容到浏览器 `localStorage`
+- 支持调整编辑器字号
+- 支持下载为 `.txt` 文件
+- 支持一键复制全部文本
+
+## 快速开始
+
+直接在浏览器打开 `index.html` 即可使用。
+
+如果你想通过本地服务运行（推荐）：
+
+```bash
+python3 -m http.server 4173
+```
+
+然后访问：`http://localhost:4173`
 
EOF
)
