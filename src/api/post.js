import Config from '../config/index'
import post from './apiConfig'
export default {
  /**
   * 专辑信息
   * @param  { String } code               小程序临时登录凭证code
   */
  postDetail (params) {
    return post('post/post/detail', params)
  },
  postPublish (params) {
    return post('post/post/publish', params)
  },
  userPosts ({ userId, s = Config.pagination.s, n = Config.pagination.n } = {}) {
    return post('post/post/getListByUserId', {
      user_id: userId,
      s: s,
      n: n
    })
  },
  tagPosts ({ tag, s = Config.pagination.s, n = Config.pagination.n } = {}) {
    return post('post/post/getListByTag', {
      tag: tag,
      s: s,
      n: n
    })
  },
  postDelete (params) {
    return post('post/post/delete', params)
  },
  postModify (params) {
    return post('post/post/modify', params)
  },
  postIndex (params) {
    return post('post/post/index', params)
  },

  postSeekHelp (params) {
    return post('post/post/seekHelp', params)
  },
  postShow (params) {
    return post('post/post/show', params)
  }
}
