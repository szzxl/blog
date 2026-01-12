// 在浏览器控制台运行这段代码来检查样式

console.log('=== 检查留言板样式 ===');

// 检查 replies 元素
const replies = document.querySelectorAll('.replies');
console.log('找到 .replies 元素数量:', replies.length);

if (replies.length > 0) {
  replies.forEach((el, index) => {
    const styles = window.getComputedStyle(el);
    console.log(`第${index + 1}个 .replies 元素:`);
    console.log('  margin-left:', styles.marginLeft);
    console.log('  margin-top:', styles.marginTop);
    console.log('  background:', styles.background);
  });
  
  // 手动应用样式测试
  console.log('\n尝试手动应用样式...');
  replies.forEach((el, index) => {
    el.style.marginLeft = '54px';
    el.style.marginTop = '12px';
    console.log(`已应用样式到第${index + 1}个元素`);
  });
  
  console.log('\n如果现在看到缩进了，说明CSS没有正确加载');
  console.log('请按 Ctrl+Shift+R 强制刷新页面');
} else {
  console.log('❌ 没有找到 .replies 元素');
  console.log('检查 HTML 结构是否正确渲染');
  
  // 检查是否有旧的类名
  const oldReplyList = document.querySelectorAll('.reply-list');
  if (oldReplyList.length > 0) {
    console.log('⚠️ 发现旧的 .reply-list 元素:', oldReplyList.length);
    console.log('页面可能没有更新，请刷新页面');
  }
}

// 检查 comment-item 元素
const commentItems = document.querySelectorAll('.comment-item');
console.log('\n找到 .comment-item 元素数量:', commentItems.length);

// 检查嵌套层级
const level2 = document.querySelectorAll('.replies > .comment-item');
const level3 = document.querySelectorAll('.replies .replies > .comment-item');
const level4 = document.querySelectorAll('.replies .replies .replies > .comment-item');

console.log('\n层级统计:');
console.log('第2层评论:', level2.length);
console.log('第3层评论:', level3.length);
console.log('第4层评论:', level4.length);
