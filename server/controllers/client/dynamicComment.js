const models = require('../../../db/mysqldb/index')
const moment = require('moment')
const { resClientJson } = require('../../utils/resData')
const Op = require('sequelize').Op
const trimHtml = require('trim-html')
const xss = require('xss')
const clientWhere = require('../../utils/clientWhere')
const config = require('../../config')
const { TimeNow, TimeDistance } = require('../../utils/time')

function ErrorMessage (message) {
  this.message = message
  this.name = 'UserException'
}

/* 评论模块 */

class dynamicComment {
  static async getDynamicCommentList (ctx) {
    let dynamic_id = ctx.query.dynamic_id
    let page = ctx.query.page || 1
    let pageSize = ctx.query.pageSize || 10
    let childPageSize = ctx.query.childPageSize || ''
    let parent_id = ctx.query.parent_id || 0

    try {
      let { count, rows } = await models.dynamic_comment.findAndCountAll({
        // 默认一级评论
        where: {
          dynamic_id,
          parent_id,
          ...clientWhere.comment
        }, // 为空，获取全部，也可以自己添加条件
        offset: (page - 1) * pageSize, // 开始的数据索引，比如当page=2 时offset=10 ，而pagesize我们定义为10，则现在为索引为10，也就是从第11条开始返回数据条目
        limit: Number(pageSize), // 每页限制返回的数据条数
        order: [['create_date', 'desc']]
      })

      for (let i in rows) {
        rows[i].setDataValue(
          'create_dt',
          await TimeDistance(rows[i].create_date)
        )
        if (Number(rows[i].status === 1)) {
          rows[i].setDataValue('content', '当前用户评论需要审核')
        }
        if (Number(rows[i].status === 3)) {
          rows[i].setDataValue('content', '当前用户评论违规')
        }
        rows[i].setDataValue(
          'user',
          await models.user.findOne({
            where: { uid: rows[i].uid },
            attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
          })
        )

        if (rows[i].reply_uid !== 0 && rows[i].reply_uid !== rows[i].uid) {
          rows[i].setDataValue(
            'reply_user',
            await models.user.findOne({
              where: { uid: rows[i].reply_uid },
              attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
            })
          )
        }
      }

      for (let item in rows) {
        // 循环取子评论
        let childAllComment = await models.dynamic_comment.findAll({
          where: { parent_id: rows[item].id, ...clientWhere.comment },
          limit: Number(childPageSize) // 每页限制返回的数据条数
        })

        for (let childCommentItem in childAllComment) {
          // 循环取用户  代码有待优化，层次过于复杂
          childAllComment[childCommentItem].setDataValue(
            'create_dt',
            await TimeDistance(childAllComment[childCommentItem].create_date)
          )
          if (Number(childAllComment[childCommentItem].status === 1)) {
            childAllComment[childCommentItem].setDataValue(
              'content',
              '当前用户评论需要审核'
            )
          }
          if (Number(childAllComment[childCommentItem].status === 3)) {
            childAllComment[childCommentItem].setDataValue(
              'content',
              '当前用户评论违规'
            )
          }
          childAllComment[childCommentItem].setDataValue(
            'user',
            await models.user.findOne({
              where: { uid: childAllComment[childCommentItem].uid },
              attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
            })
          )
          if (
            childAllComment[childCommentItem].reply_uid !== 0 &&
            childAllComment[childCommentItem].reply_uid !==
              childAllComment[childCommentItem].uid
          ) {
            childAllComment[childCommentItem].setDataValue(
              'reply_user',
              await models.user.findOne({
                where: { uid: childAllComment[childCommentItem].reply_uid },
                attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
              })
            )
          }
        }

        rows[item].setDataValue('children', childAllComment)
      }

      await resClientJson(ctx, {
        state: 'success',
        message: '获取评论列表成功',
        data: {
          page,
          pageSize,
          count,
          list: rows
        }
      })
    } catch (err) {
      resClientJson(ctx, {
        state: 'error',
        message: '错误信息：' + err.message
      })
      return false
    }
  }

  static async getDynamicCommentAll (ctx) {
    let dynamic_id = ctx.query.dynamic_id
    let parent_id = ctx.query.parent_id || 0
    let sort = ctx.query.sort || ''

    let order = []

    sort === 'desc' && order.push(['create_date', 'desc'])

    try {
      let allDynamicComment = await models.dynamic_comment.findAll({
        // 默认一级评论
        where: {
          dynamic_id,
          parent_id,
          ...clientWhere.comment
        }, // 为空，获取全部，也可以自己添加条件
        order
      })

      for (let i in allDynamicComment) {
        allDynamicComment[i].setDataValue(
          'create_dt',
          await TimeDistance(allDynamicComment[i].create_date)
        )
        if (Number(allDynamicComment[i].status === 1)) {
          allDynamicComment[i].setDataValue('content', '当前用户评论需要审核')
        }
        if (Number(allDynamicComment[i].status === 3)) {
          allDynamicComment[i].setDataValue('content', '当前用户评论违规')
        }
        allDynamicComment[i].setDataValue(
          'user',
          await models.user.findOne({
            where: { uid: allDynamicComment[i].uid },
            attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
          })
        )

        if (
          allDynamicComment[i].reply_uid !== 0 &&
          allDynamicComment[i].reply_uid !== allDynamicComment[i].uid
        ) {
          allDynamicComment[i].setDataValue(
            'reply_user',
            await models.user.findOne({
              where: { uid: allDynamicComment[i].reply_uid },
              attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
            })
          )
        }
      }

      for (let item in allDynamicComment) {
        // 循环取子评论
        let childAllComment = await models.dynamic_comment.findAll({
          where: {
            parent_id: allDynamicComment[item].id,
            ...clientWhere.comment
          }
        })

        for (let childCommentItem in childAllComment) {
          // 循环取用户  代码有待优化，层次过于复杂
          childAllComment[childCommentItem].setDataValue(
            'create_dt',
            await TimeDistance(childAllComment[childCommentItem].create_date)
          )

          if (Number(childAllComment[childCommentItem].status === 1)) {
            childAllComment[childCommentItem].setDataValue(
              'content',
              '当前用户评论需要审核'
            )
          }
          if (Number(childAllComment[childCommentItem].status === 3)) {
            childAllComment[childCommentItem].setDataValue(
              'content',
              '当前用户评论违规'
            )
          }

          childAllComment[childCommentItem].setDataValue(
            'user',
            await models.user.findOne({
              where: { uid: childAllComment[childCommentItem].uid },
              attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
            })
          )
          if (
            childAllComment[childCommentItem].reply_uid !== 0 &&
            childAllComment[childCommentItem].reply_uid !==
              childAllComment[childCommentItem].uid
          ) {
            childAllComment[childCommentItem].setDataValue(
              'reply_user',
              await models.user.findOne({
                where: { uid: childAllComment[childCommentItem].reply_uid },
                attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
              })
            )
          }
        }

        allDynamicComment[item].setDataValue('children', childAllComment)
      }

      await resClientJson(ctx, {
        state: 'success',
        message: '获取评论列表成功',
        data: {
          list: allDynamicComment
        }
      })
    } catch (err) {
      resClientJson(ctx, {
        state: 'error',
        message: '错误信息：' + err.message
      })
      return false
    }
  }

  /**
   * 新建评论post提交
   * @param   {object} ctx 上下文对象
   */
  static async createDynamicComment (ctx) {
    let reqData = ctx.request.body
    let { user = '' } = ctx.request

    try {
      if (!reqData.content) {
        throw new ErrorMessage('请输入评论内容')
      }

      let date = new Date()
      let currDate = moment(date.setHours(date.getHours())).format(
        'YYYY-MM-DD HH:mm:ss'
      )

      if (new Date(currDate).getTime() < new Date(user.ban_dt).getTime()) {
        throw new ErrorMessage(
          `当前用户因违规已被管理员禁用发布评论，时间到：${moment(
            user.ban_dt
          ).format('YYYY年MM月DD日 HH时mm分ss秒')},如有疑问请联系网站管理员`
        )
      }

      let allUserRole = await models.user_role.findAll({
        where: {
          user_role_id: {
            [Op.or]: user.user_role_ids.split(',')
          },
          user_role_type: 1 // 用户角色类型1是默认角色
        }
      })
      let userAuthorityIds = ''
      allUserRole.map(roleItem => {
        userAuthorityIds += roleItem.user_authority_ids + ','
      })
      let status = ~userAuthorityIds.indexOf(
        // 判断动态评论不需要审核
        config.USER_AUTHORITY.dfNoReviewDynamicCommentId
      )
        ? 5
        : 1

      let oneDynamic = await models.dynamic.findOne({
        where: {
          id: reqData.dynamic_id
        }
      })

      console.log('oneDynamic', oneDynamic)

      await models.dynamic_comment
        .create({
          parent_id: reqData.parent_id || 0,
          dynamic_id: reqData.dynamic_id,
          uid: user.uid,
          reply_uid: reqData.reply_uid || 0,
          content: xss(reqData.content),
          status
        })
        .then(async data => {
          await models.dynamic.update(
            {
              // 更新文章评论数
              comment_count: await models.dynamic_comment.count({
                where: {
                  dynamic_id: reqData.dynamic_id,
                  parent_id: 0
                }
              })
            },
            { where: { id: reqData.dynamic_id } }
          )

          const oneUser = await models.user.findOne({
            where: { uid: user.uid }
          }) // 查询当前评论用户的信息

          let _data = {
            // 组合返回的信息
            ...data.get({
              plain: true
            }),
            children: [],
            user: oneUser
          }

          if (
            reqData.reply_uid &&
            reqData.reply_uid !== 0 &&
            reqData.reply_uid !== user.uid
          ) {
            _data.reply_user = await models.user.findOne({
              where: { uid: reqData.reply_uid },
              attributes: ['uid', 'avatar', 'nickname', 'sex', 'introduction']
            })
          }

          _data['create_dt'] = await TimeDistance(_data.create_date)

          await models.user_message.create({
            // 用户行为记录
            uid: oneDynamic.uid,
            type: 6, // 1:系统 2:喜欢文章  3:关注标签 4:关注用户 5:评论 6:动态评论
            content: JSON.stringify({
              other_uid: user.uid,
              comment_id: _data.id,
              dynamic_id: reqData.dynamic_id,
              title: '动态有新的评论'
            })
          })

          if (reqData.reply_uid) {
            await models.user_message.create({
              // 用户行为记录
              uid: reqData.reply_uid,
              type: 6, // 类型 1:系统 2:喜欢文章  3:关注标签 4:用户关注 5:评论 6:动态评论
              content: JSON.stringify({
                other_uid: user.uid,
                comment_id: _data.id,
                dynamic_id: reqData.dynamic_id,
                title: `你的评论有新的回复`
              })
            })
          }

          resClientJson(ctx, {
            state: 'success',
            data: _data,
            message:
              Number(status) === 5
                ? '评论成功'
                : '评论成功,但是由于此前您发表的评论存在问题，管理员已把你加入受限用户组，评论需要审核才能被第三人看见'
          })
        })
        .catch(err => {
          resClientJson(ctx, {
            state: 'error',
            message: '回复失败:' + err
          })
        })
    } catch (err) {
      resClientJson(ctx, {
        state: 'error',
        message: '错误信息：' + err.message
      })
      return false
    }
  }

  /**
   * 删除评论post提交
   * @param   {object} ctx 上下文对象
   */
  static async deleteDynamicComment (ctx) {
    let reqData = ctx.request.body
    let { user = '' } = ctx.request

    try {
      let oneDynamicComment = await models.dynamic_comment.findOne({
        where: {
          id: reqData.comment_id
        }
      })

      let allComment = await models.dynamic_comment
        .findAll({ where: { parent_id: reqData.comment_id } })
        .then(res => {
          return res.map((item, key) => {
            return item.id
          })
        })

      if (allComment.length > 0) {
        // 判断当前评论下是否有子评论,有则删除子评论
        await models.dynamic_comment.destroy({
          where: {
            id: { [Op.in]: allComment },
            uid: user.uid
          }
        })
      }

      await models.dynamic_comment.destroy({
        where: {
          id: reqData.comment_id,
          uid: user.uid
        }
      })

      await models.dynamic.update(
        {
          // 更新文章评论数
          comment_count: await models.dynamic_comment.count({
            where: {
              dynamic_id: oneDynamicComment.dynamic_id,
              parent_id: 0
            }
          })
        },
        { where: { id: oneDynamicComment.dynamic_id } }
      )

      resClientJson(ctx, {
        state: 'success',
        message: '删除成功'
      })
    } catch (err) {
      resClientJson(ctx, {
        state: 'error',
        message: '错误信息：' + err.message
      })
      return false
    }
  }
}

module.exports = dynamicComment
