<template>
  <div class="comment-form"
       id="comment_form">
    <div class="comment-avatar">
      <el-image v-if="personalInfo.islogin"
                :src="personalInfo.user.avatar"
                lazy></el-image>
      <el-image v-else
                src="/default/img/avatar.jpeg"
                lazy></el-image>
    </div>

    <div class="form-item"
         style="margin-left: 45px;"
         v-loading="isCommentSubmit">
      <div class="input-view">
        <textarea name="comment"
                  v-model="commentContent"
                  class="txt long-txt textarea "></textarea>
      </div>

      <div class="form-item form-btns clearfix">
        <div class="left-view">
          <el-popover placement="top-start"
                      width="500"
                      v-model="faceVisible">
            <comment-face @changeFace="changeFace"
                          v-if="faceVisible" />
            <i slot="reference"
               class="face-icon el-icon-picture-outline-round"></i>
          </el-popover>
        </div>
        <div class="right-view">
          <button type="submit"
                  class="form-btn"
                  @click="submitComment">评论</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import commentFace from './CommentFace'

export default {
  name: 'CommentForm',
  data () {
    return {
      commentContent: '', // 顶级输入框
      faceVisible: false,
      isCommentSubmit: false
    }
  },
  props: {
    type: {
      type: String,
      default: 'parent'
    },
    reply_uid: {
      default: ''
    },
    child_comment_id: {
      default: ''
    },
    dynamicId: {
      default: ""
    }
  },
  methods: {
    getParams () {
      return {
        dynamic_id: this.dynamicId,
        content: this.commentContent,
        reply_uid: this.reply_uid,
        parent_id: this.child_comment_id,
      }
    },
    changeFace (val) {
      this.faceVisible = false
      this.commentContent = this.commentContent + val.face_text
    },
    submitComment () { // 提交评论
      var params = this.getParams()
      this.isCommentSubmit = true
      this.$store.dispatch("dynamicComment/DYNAMIC_COMMENT_CREATE", params)
        .then(result => {
          this.commentContent = ''
          this.isCommentSubmit = false
          this.$emit('commentChange', result)
        })
        .catch(err => {
          this.commentContent = ''
          this.isCommentSubmit = false
        })
    }
  },
  computed: {
    article () {
      return this.$store.state.article.article || {}
    },
    personalInfo () { // 登录后的个人信息
      return this.$store.state.personalInfo || {}
    }
  },
  components: {
    'comment-face': commentFace
  }
}
</script>

<style scoped lang="scss">
.comment-form {
  .comment-avatar {
    float: left;
    width: 32px;
    height: 32px;
    overflow: hidden;
    border-radius: 35px;
    /deep/ .el-image {
      width: 32px;
      height: 32px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
    }
  }
  .form-item {
    font-size: 14px;
    line-height: 40px;
    color: #555;
    display: block;
    .txt {
      display: block;
      box-sizing: border-box;
      width: 100%;
      border-radius: 15px;
      line-height: 25px;
      height: 45px;
      padding: 5px 15px;
      border: none;
      background: #f7f7f7;
      color: #555;
      font-size: 14px;
      outline: none;
      float: left;
      font-family: "Microsoft Yahei", sans-serif;
      &.textarea {
        height: 50px;
        border-radius: 10px;
      }
    }
    .input-view {
      position: relative;
    }
    .left-view {
      float: left;
      .iconfont {
        margin-left: 15px;
        display: inline-block;
        font-size: 20px;
        cursor: pointer;
      }
    }
    .right-view {
      float: right;
    }
    .form-btn {
      display: inline-block;
      border-radius: 10px;
      box-sizing: border-box;
      border: none;
      background: #f50;
      color: #fff;
      text-align: center;
      line-height: 26px;
      cursor: pointer;
      padding: 0 20px;
      font-size: 13px;
      cursor: pointer;
      margin-left: 10px;
      outline: none;
      &.btn-cancel {
        background: #999999;
      }
    }
    .face-icon {
      font-size: 18px;
    }
  }
}
</style>
