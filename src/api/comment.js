import Config from '../config'
import post from './apiConfig'
export default {
  /**
   * 评论列表
   * @param  { String } postId               帖子ID
   */
  commentPostSlist ({
    postId,
    s = Config.pagination.s,
    n = Config.pagination.n
  } = {}) {
    return post('comment/post/slist', {
      post_id: postId,
      s: s,
      n: n
    })
  },
  commentPostAdd ({ postId, content, imageIds } = {}) {
    return post('comment/post/add', {
      post_id: postId,
      content: content,
      image_ids: imageIds
    })
  },
  commentPostReply ({ replyId, content } = {}) {
    return post('comment/post/reply', {
      reply_id: replyId,
      content: content
    })
  },
  commentPostMy ({ s = Config.pagination.s, n = Config.pagination.n }) {
    return post('comment/post/my', {
      s: s,
      n: n
    })
  },
  commentItemSlist ({
    itemId,
    s = Config.pagination.s,
    n = Config.pagination.n
  } = {}) {
    return post('comment/item/slist', {
      item_id: itemId,
      s: s,
      n: n
    })
  }
}
