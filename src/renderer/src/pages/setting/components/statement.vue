<template>
  <div class="statement">
    <h5><strong>1.数据处理原则</strong></h5>
    <ul>
      <li>AI交互过程通过openai库直接连接第三方服务</li>
      <li>所有用户数据（包括聊天记录、交互内容）均100%存储于本地设备</li>
      <li>不会将任何用户数据上传至云端服务器或第三方存储平台</li>
      <li>与AI对话时已过滤手机号,邮箱,身份证号,微信ID等个人信息</li>
    </ul>
    <h5><strong>2.第三方AI责任声明</strong></h5>
    <ul>
      <li>发送至第三方AI的数据将受其隐私政策约束</li>
      <li>建议您在使用前阅读并确认第三方AI的隐私条款</li>
      <li>我们无法控制第三方对已接收数据的后续处理</li>
    </ul>
    <h5><strong>3.免责条款</strong></h5>
    <ul>
      <li>因设备丢失/损坏导致的本地数据泄露不属于责任范围</li>
      <li>因用户主动分享屏幕/导出记录导致的泄露不承担责任</li>
      <li>因第三方AI服务商导致的数据问题不承担连带责任</li>
    </ul>
  </div>
</template>
<script setup lang="ts">

</script>
<style lang="less" scoped>
.statement {
  color: #333;

  strong {
    font-weight: bold;
  }

  ul {
    list-style-type: disc;
  }

  li {
    font-size: 14px;
    margin: 4px 0;
  }

  h5 {
    font-size: 15px;
  }
}
</style>