<template>
  <div class="main-header"
       id="main-header">
    <header class="navbar navbar-visible"
            id="header-view">
      <div class="navbar-view-re">
        <div class="container navbar-view">
          <router-link :to="{name:'home'}"
                       class="navbar-brand logo-img"
                       v-if="website.meta.logo"
                       :style="{'background-image':'url('+website.meta.logo+')'}"></router-link>
          <router-link :to="{name:'home'}"
                       class="navbar-brand logo-text"
                       v-else></router-link>
          <div class="collapse navbar-collapse">
            <ul class="navbar-item-content mr-auto">
              <li class="navbar-menu-content active">
                <div class="navbar-toggler"
                     @click="is_navbar_menu=!is_navbar_menu">
                  <el-dropdown trigger="click"
                               @command="commandChange">
                    <div class="el-dropdown-link">
                      <i class="menu-icon el-icon-menu"></i>
                    </div>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item icon="el-icon-s-home"
                                        :command="{name:'home'}">Home</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-s-home"
                                        :command="{name:'home'}">Home</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-s-home"
                                        :command="{name:'home'}">Home</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-s-home"
                                        :command="{name:'home'}">Home</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-s-home"
                                        :command="{name:'home'}">Home</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-chat-line-round"
                                        :command="{name:'dynamics',params:{dynamicTopicId:'newest'}}">About</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-tickets"
                                        :command="{name:'articleBlogs'}">News</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-chat-line-square"
                                        v-if="personalInfo.islogin"
                                        :command="{name:'userMessage',params:{uid:personalInfo.user.uid}}">Contact</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
<!--                <ul class="navbar-menu"
                    :class="{show:is_navbar_menu}">
                  <li class="nav-item">
                    <router-link :to="{name:'home'}"
                                 class="nav-link">主页</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link :to="{name:'dynamics',params:{dynamicTopicId:'newest'}}"
                                 class="nav-link">片刻</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link :to="{name:'articleBlogs',params:{columnEnName:'all'}}"
                                 class="nav-link">专栏</router-link>
                  </li>
                  <li class="nav-item"
                      v-if="personalInfo.islogin">
                    <router-link :to="{name:'userMessage',params:{uid:personalInfo.user.uid}}">
                      消息
                      <span v-if="unread_message_count.count>0"
                            class="unread-message-count">{{unread_message_count.count}}</span>
                    </router-link>
                  </li>
                </ul>-->
              </li>
              <li class="nav-item search">
                <div class="form-search form-inline mr-lg-5">
                  <input class="form-control form-search-view"
                         type="text"
                         required="true"
                         v-model="search_val"
                         name="search"
                         placeholder="Search"
                         aria-label="Search" />
                  <button class="search-btn"
                          @click="search">
                    <i class="el-icon-search"></i>
                  </button>
                </div>
              </li>
              <template v-if="personalInfo.islogin">
                <li class="nav-item">
                  <router-link :to="{name:'Write',params:{type:'create'}}"
                               class="btn btn-sm btn-outline-warning xiezuo">
                    <i class="iconfont el-icon-edit"></i>
                  </router-link>
                </li>
                <li class="nav-item dropdown">
                  <el-dropdown trigger="click"
                               @command="commandChange">
                    <div class="el-dropdown-link">
                      <div class="avatar-img">
                        <el-image :src="personalInfo.user.avatar"
                                  lazy></el-image>
                      </div>
                    </div>
                    <el-dropdown-menu slot="dropdown">
<!--                      <el-dropdown-item icon="el-icon-user"
                                        :command="{name:'user',params:{uid:personalInfo.user.uid}}">我的主页</el-dropdown-item>-->
                      <el-dropdown-item icon="el-icon-setting"
                                        :command="{name:'setting'}">Settings</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-right"
                                        :command="{name:'esc'}">Logout</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </li>
              </template>
              <template v-else>
                <li class="nav-item"
                    @click="show_login"
                    v-if="website.config.on_login==='yes'">
                  <a class="btn btn-sm sign-btn btn-block"
                     href="javascript:;">Login</a>
                </li>
                <li class="nav-item"
                    @click="show_register"
                    v-if="website.config.on_register==='yes'">
                  <a class="btn s-btn--primary btn-sm sign-btn btn-outline-warning"
                     href="javascript:;">Register</a>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </header>
  </div>
  <!--header end-->
</template>

<script>
import { cookie } from "../../../../server/utils/cookie";
import { mapState } from "vuex";
export default {
  name: "Header",
  data () {
    return {
      is_navbar_menu: false, // 主菜单栏是否显示
      is_dropdown_menu: false, // 个人下拉菜单栏是否显示
      search_val: ""
    };
  },
  methods: {
    search () {
      if (!this.search_val) {
        this.$message.warning("请输入搜索内容");
        return false;
      }
      this.$router.push({
        name: "search",
        query: { query: this.search_val }
      });
    },
    show_login () {
      // 显示登录
      this.$store.commit("SET_IS_LOGIN", true);
    },
    commandChange (val) {
      if (val.name !== "esc") {
        this.$router.push(val);
      } else {
        this.escLogin();
      }
    },
    dropdown_menu_route (val, type) {
      // dropdown_menu 导航事件
      this[type] = false;
      this.$router.push(val);
    },
    show_register () {
      // 显示注册
      this.$store.commit("SET_IS_REGISTER", true);
    },
    escLogin () {
      this.$message.warning("已退出当前账户，请重新登录");
      cookie.delete("accessToken");
      window.location.reload();
    }
  },
  computed: {
    ...mapState(["website", "personalInfo"]), // home:主页  article_column:文章的专栏
    unread_message_count () {
      // 登录后的个人信息
      return this.$store.state.user.unread_message_count;
    }
  }
};
</script>

<style scoped lang="scss">
.main-header {
  position: relative;
  height: 85px;
  .navbar-bootom-border {
    /* border: 1px solid transparent;
             border-color: #f0f0f0;*/
    z-index: 999;
    background: #fff;
    /*border-bottom: 1px solid #f1f1f1;*/
    /*  -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.06);
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.06);*/
    /*  -webkit-box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); */
  }
  .header-visible {
    transform: translateZ(0);
  }

  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    transition: all 0.2s;
    transform: translate3d(0, -100%, 0);
    background: #fff;
    /* border-bottom: 1px solid #f1f1f1;*/
    color: #909090;
    z-index: 250;
    .navbar-view-re {
      height: 85px;
      position: relative;
      &:after {
        /*border-bottom: 1px solid #f1f1f1;*/
        display: block;
        position: absolute;
        top: 59px;
        color: rgba(0, 0, 0, 0.07);
        content: "";
        width: 100%;
        height: 2px;
      }
    }
    &.navbar-visible {
      transform: translateZ(0);
    }
    .navbar-view {
      display: flex;
      align-items: center;
      height: 100%;
      margin-left:20px;
      .navbar-brand {
        margin-right: 30px;
        &.logo-text {
          font-size: 25px;
          color: #e67e7e;
        }
        &.logo-img {
          background-size: 100% 100%;
          display: block;
          width: 250px;
          height: 50px;
          /* position: absolute;*/
          left: 10%;
        }
      }
      .navbar-collapse {
        height: 100%;
        flex: 1 0 auto;
        float: right;
        position: absolute;
        right: 5%;
        .navbar-item-content {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          position: relative;
          height: 100%;
          margin: 0;
          .navbar-menu-content {
            display: flex;
            flex: 1;
            align-items: center;
            .navbar-menu {
              display: flex;
              justify-content: flex-start;
            }
          }
          .navbar-toggler {
            display: none;
            .menu-icon {
              width: 50px;
              height: 50px;
              text-align: center;
              line-height: 50px;
              color: #999;
              font-size: 18px;
            }
          }
          .nav-item {
            position: relative;
            font-size: 18px;
            margin: 0;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            a {
              padding: 20px 15px;
              display: block;
              font-size: 15px;
              color: rgba(0, 0, 0, 0.56);
            }
            i {
              display: inline-block;
              margin-right: 5px;
              font-weight: bold;
            }
            a.exact-active {
              color: #ea6f5a;
            }
            &.search {
              margin-right: 30px;
              .form-search {
                border: 1px solid hsla(0, 0%, 59.2%, 0.2);
                background-color: rgba(227, 231, 236, 0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-radius: 20px;
                .form-search-view {
                  border: none;
                  padding: 6px 10px;
                  box-shadow: none;
                  outline: none;
                  font-size: 12px;
                  color: #666;
                  background-color: transparent;
                }
                .search-btn {
                  border: none;
                  padding: 0 8px;
                  background-color: transparent;
                }
              }
            }
            &.dropdown {
              position: relative;
              /deep/ .el-dropdown {
                height: 36px;
              }
              .avatar-img {
                display: inline-block;
                position: relative;
                width: 36px;
                height: 36px;
                border-radius: 72px;
                /deep/ .el-image {
                  width: 36px;
                  height: 36px;
                  img {
                    width: 100%;
                    height: 100%;
                    border-radius: 80px;
                  }
                }
              }
            }
            .btn-outline-warning {
              border-radius: 20px;
              padding: 5px 20px;
            }
            .sign-btn {
              font-weight: bold;
              font-size: 14px;
            }
            .unread-message-count {
              padding: 0 3px;
              background: #ff4d4f;
              border-radius: 50%;
              font-size: 12px;
              color: #ffffff;
              vertical-align: middle;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 575px) {
  body {
    .main-header {
      .navbar {
        .navbar-view {
          .navbar-brand {
            &.logo-img {
              position: static;
            }
          }
          .navbar-collapse {
            .navbar-item-content {
              .nav-item {
                &.search {
                  display: none;
                }
              }
              .navbar-toggler {
                display: block;
                width: 50px;
                height: 50px;
                line-height: 50px;
                text-align: center;
              }
              .navbar-menu {
                display: none !important;
              }
            }
          }
        }
      }
    }
  }
}

@media (min-width: 768px) {
}

@media (min-width: 992px) {
}

@media (min-width: 1200px) {
}
</style>
