<template>
  <section class="sign-lay layout-content">
    <div class="sign-view">
      <div class="title">
        CREATE ACCOUNT
      </div>
      <div class="js-sign-in-container">
        <form id="sign-up"
              accept-charset="UTF-8"
              method="post"
              ref="register">

          <div class="input-prepend restyle js-normal">
            <input v-model="formData.nickname"
                   type="text"
                   class="nickname"
                   placeholder="nickname">
            <i class="el-icon-user-solid"></i>
          </div>

          <div class="input-prepend email-view">
            <input v-model="formData.email"
                   type="text"
                   class="send-email-input account"
                   placeholder="Email">
            <i class="el-icon-message"></i>
            <send-code v-model="isSendCode"
                       @click.native="sendCode"
                       storage-key="sendEmailCode"
                       class="btn-send-email-code"
                       v-loading="sendLoading" />
          </div>

          <div class="input-prepend email-view-code"
               v-show="formData.email">
            <input v-model="formData.code"
                   type="text"
                   class="send-email-code code"
                   placeholder="Security code">
            <i class="el-icon-chat-round"></i>
          </div>

          <div class="input-prepend">
            <input v-model="formData.password"
                   type="password"
                   class="password"
                   placeholder="Password">
            <i class="el-icon-key"></i>
          </div>

          <div class="input-prepend">
            <input v-model="formData.double_password"
                   type="password"
                   class="double_password"
                   placeholder="Confirm password">
            <i class="el-icon-key"></i>
          </div>

          <div class="footer-text" style="font-size:12px">ALREADY HAVE ACCOUNT? <em @click="tapSign">SIGN IN</em></div>

          <button class="sign-up-button"
                  type="button"
                  @click="register">CREATE ACCOUNT</button>
        </form>

      </div>
    </div>
  </section>
</template>

<script>
import { sendCode } from '@components'

export default {
  name: 'SignUp',
  data () {
    return {
      isSendCode: false,
      sendLoading: false,
      formData: {
        nickname: '',
        email: '',
        phone: '',
        code: '',
        type: 'email',
        password: '',
        double_password: ''
      }
    }
  },
  methods: {
    sendCode () { // 发送注册验证码
      this.sendLoading = true
      this.$store.dispatch('sign/SIGN_SEND_CODE', { email: this.formData.email })
        .then(res => {
          this.sendLoading = false
          if (res.state === 'success') {
            this.isSendCode = true
          } else {
            this.$message.warning(res.message)
          }
        })
    },
    register () {
      this.$store.dispatch('sign/REGISTER', this.formData)
        .then(res => {
          if (res.state === 'success') {
            this.$message.success(res.message)
            this.$refs.register.reset();
            this.$store.commit('SET_IS_REGISTER', false)
            this.$store.commit('SET_IS_LOGIN', true)
          } else {
            this.$message.warning(res.message)
          }
        })
    },
    tapSign () {
      this.$store.commit('SET_IS_REGISTER', false)
      this.$store.commit('SET_IS_LOGIN', true)
    }
  },
  components: {
    'send-code': sendCode
  }
}
</script>

