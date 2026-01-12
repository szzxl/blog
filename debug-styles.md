# 调试留言板样式

## 步骤1：打开浏览器开发者工具
按 F12 打开开发者工具

## 步骤2：检查回复列表元素
1. 点击开发者工具左上角的"选择元素"按钮
2. 点击页面上的任意一条回复
3. 在Elements标签中查看该元素

## 步骤3：查看CSS样式
在右侧的Styles面板中，查找 `.reply-list` 的样式，应该看到：
```css
.reply-list {
  padding-left: 54px;
}
```

## 步骤4：如果没有看到缩进
可能的原因：
1. CSS没有生效 - 检查是否有其他样式覆盖
2. HTML结构不对 - 检查是否有 `.reply-list` 类
3. 浏览器缓存 - 按 Ctrl+Shift+R 强制刷新

## 步骤5：手动测试
在浏览器控制台执行：
```javascript
document.querySelector('.reply-list').style.paddingLeft = '100px';
```
如果回复立即缩进了，说明CSS选择器有问题。

## 临时解决方案
如果还是不行，在浏览器控制台执行：
```javascript
document.querySelectorAll('.reply-list').forEach(el => {
  el.style.paddingLeft = '54px';
  el.style.background = 'rgba(255, 240, 240, 0.3)';
});
```
