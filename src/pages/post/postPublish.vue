<template>
  <div class="publish-card">
    <div class="panel">
      <div class="weui-uploader__bd">
        <div class="weui-uploader__files">
          <block v-for="(item,index) in postFiles"
                 :key="index">
            <div class="weui-uploader__file"
                 @click="predivImage">
              <image class="weui-uploader__img"
                     :src="item.image_url"
                     mode="aspectFill" />
              <div class="delete-image"
                   @click.stop="deletImage(index)">
              </div>
            </div>
          </block>
        </div>
        <div class="weui-uploader__input-box"
             v-if="postFiles.length < 9">
          <div class="weui-uploader__input"
               @click="chooseImage"></div>
        </div>
      </div>
      <div class="textarea">
        <textarea class="weui-textarea"
                  :placeholder="placeholder"
                  v-model.lazy="description"
                  auto-height="true"
                  :maxlength="1000"></textarea>
      </div>
    </div>
    <div class="panel"
         v-if="isSHowTag">
      <div class="add-tag">
        <div class="add-tag-hd">
          <input type="text"
                 placeholder="＃ 添加标签"
                 class="add-tag-text"
                 v-model.lazy="tagText"
                 cursor-spacing="15">
          <span class="add-tag-button"
                @click="addTag">添加</span>
        </div>
        <div class="add-tag-bd"
             v-if="tags.length>0">
          <div class="add-tag-item"
               v-for="item in tags"
               :key="item">
            <text class="tag-text"> {{item}}</text>
            <div class="delete-tag"
                 @click.stop="deletTag(index)"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="button-cell">
      <button class="submit-btn"
              @click="submitPost">发布</button>
    </div>
    <view class="to-indexpage"
          @tap="navToIndex">
      <text class="link-to-index">返回首页</text>
    </view>
  </div>
</template>
<script>
  // uploadImage
  import { wxChooseImage, uploadImage } from '../../utils/wxApiPromisify'
  import { postType } from '@/utils/constant'
  import { mapState } from 'vuex'
  export default {
    data () {
      return {
        isShowUpload: true,
        uploadFiles: [],
        placeholder: '添加描述',
        description: '',
        isSHowTag: true,
        tags: [],
        tagText: '',
        postId: '',
        mode: 'publish',
        postType: postType.show
      }
    },
    components: {
    },
    computed: {
      ...mapState(['user_info', 'postFiles'])
    },
    onShow () {
      this.getType()
    },
    onUnload () {
      this.$store.commit('removePostTempFiles')
    },
    methods: {
      getType () {
        this.description = ''
        this.tags.length = 0
        this.mode = this.$route.query.mode
        this.postId = this.$route.query.postId
        this.postType = this.$route.query.postType
        if (this.postType) {
          wx.setNavigationBarTitle({
            title: '发表评论'
          })
          this.placeholder = '说出你这一刻的想法'
          this.isSHowTag = false
        } else {
          this.placeholder = '添加描述'
          this.isSHowTag = true
        }
        // console.log(this.postType)
        // console.log(this.mode)
        // console.log(this.$route.query.post_id)
        if (this.mode === 'modify') {
          this.getPostDetail()
        }
      },
      async getPostDetail () {
        let params = {
          post_id: this.postId
        }
        let res = await this.$api.post.postDetail(params)
        let files = res.post_info.image_list
        this.$store.commit('setPostTempFiles', files)
        this.description = res.post_info.description
        this.tags = res.post_info.tag.length > 0 ? res.post_info.tag.split(' ').map(item => `#${item}`) : []
      },
      async chooseImage (e) {
        let resPics = await wxChooseImage()
        let newPics = resPics.map(item => ({ 'image_id': 0, 'image_url': item }))
        let files = []
        files = files.concat(newPics)
        this.$store.commit('setPostTempFiles', files)
        // this.postFiles = this.postFiles.concat(newPics)
        // console.log(this.files)
      },
      predivImage (e) {
        wx.previewImage({
          current: e.currentTarget.id, // 当前显示图片的http链接
          urls: this.postFiles.map(item => item.image_url) // 需要预览的图片http链接列表
        })
      },
      deletImage (index) {
        if (this.mode === 'modify') {
          this.postFiles.splice(index, 1)
          console.log(this.postFiles)
        } else {
          this.postFiles.splice(index, 1)
        }
      },
      addTag () {
        setTimeout(() => {
          if (this.tags.length > 4) {
            wx.showToast({
              title: '最多只能添加5个标签',
              icon: 'none'
            })
            this.tagText = ''
          } else {
            if (this.tagText.length < 2 || this.tagText.length > 10) {
              wx.showToast({
                title: '请输入2~10个字符',
                icon: 'none'
              })
              return
            }
            let tagText = `#${this.tagText}`
            this.tags.unshift(tagText)
            this.tagText = ''
          }
        }, 300)
      },
      deletTag (index) {
        this.tags.splice(index, 1)
      },
      async getImageIds () {
        let files = this.postFiles.map(item => item.image_url)
        let fileParams = {
          files: files
        }
        this.uploadFiles = await uploadImage(fileParams)
        console.log(this.uploadFiles)
        let imageIds = this.uploadFiles.map(item => JSON.parse(item).data.image_id).toString()
        return imageIds
      },
      // 发布普通贴
      async postPublish () {
        let imageIds = await this.getImageIds()
        let params = {
          image_ids: imageIds,
          description: this.description,
          tag: this.tags.map(item => item.replace(/^#+?/g, '')).join(' ')
        }
        await this.$api.post.postPublish(params)
        this.goPosts()
      },
      // 编辑普通贴
      async postModify () {
        // 找到上传的图片
        let modifyUploadFiles = []
        modifyUploadFiles = this.postFiles.filter(item => item.image_id === 0)
        // 找到原来图片
        let modifySourceFiles = []
        modifySourceFiles = this.postFiles.filter(item => item.image_id !== 0)
        // console.log(modifySourceFiles)
        // console.log(modifyUploadFiles)
        let imageIds = ''
        if (!modifyUploadFiles.length) {
          imageIds = modifySourceFiles.map(item => item.image_id).toString()
        } else {
          let files = modifyUploadFiles.map(item => item.image_url)
          let fileParams = {
            files: files
          }
          let modifyUploadedFiles = await uploadImage(fileParams)
          // console.log(modifyUploadedFiles)
          let modifyUploadedFileIds = modifyUploadedFiles.map(item => JSON.parse(item).data.image_id).toString()
          // console.log(modifyUploadedFileIds)
          let modifySourceFileIds = modifySourceFiles.map(item => item.image_id)
          imageIds = modifySourceFileIds + ',' + modifyUploadedFileIds
        }
        let params = {
          post_id: this.postId,
          image_ids: imageIds,
          description: this.description,
          tag: this.tags.map(item => item.replace(/^#+?/g, '')).join(' ')
        }
        await this.$api.post.postModify(params)
        this.goPosts()
      },
      goPosts () {
        wx.redirectTo({
          url: `/pages/my/myPost?mode=user&userId=${this.user_info.user_id}`
        })
        this.$store.commit('removePostTempFiles')
        this.description = ''
        this.tag = ''
      },
      // 评论炫贴，求助帖
      async specialComment () {
        let imageIds = await this.getImageIds()
        let params = {
          postId: this.postId,
          content: this.description,
          imageIds: imageIds
        }
        // console.log(params)
        let res = await this.$api.comment.commentPostAdd(params)
        if (!res.comment_info) return
        this.$router.push({ path: '/pages/post/postDetail', query: { postType: this.postType, userId: this.postId } })
      },
      submitPost () {
        if (this.postFiles.length < 1) {
          wx.showToast({
            title: '请您上传图片',
            icon: 'none'
          })
        } else if (this.postFiles.length > 10) {
          wx.showToast({
            title: '最多只能上传9张',
            icon: 'none'
          })
        } else {
          if (this.postType) {
            this.specialComment()
          } else {
            if (this.mode === 'modify') {
              this.postModify()
            } else {
              this.postPublish()
            }
          }
          /* wx.showToast({
            title: '成功',
            icon: 'success'
          }) */
        }
      },
      // 跳到首页
      navToIndex (e) {
        this.$store.commit('setTabBar', { selectedTabBarIndex: 1, selectedTabBarPath: '/pages/detect/index' })
      }
    }
  }
</script>
<style lang="scss">
  .publish-card {
    padding-bottom: 180rpx;
    height: 100%;
    background-color: #f2f2f2;
    .panel {
      margin-bottom: 10rpx;
      padding: 40rpx 40rpx 0;
      background: #ffffff;
    }
    .weui-uploader__bd {
      margin-bottom: 30rpx;
      padding-bottom: 30rpx;
      border-bottom: 1rpx solid #e6e6e6;
    }
    .weui-uploader__input-box {
      box-sizing: border-box;
      margin-bottom: 10rpx;
      width: 200rpx;
      height: 200rpx;
      border: 2rpx dashed #b2b2b2;
      border-radius: 8rpx;
    }
    .weui-uploader__file {
      position: relative;
      box-sizing: border-box;
      margin-right: 10rpx;
      margin-bottom: 10rxp;
      width: 200rpx;
      height: 200rpx;
      // border: 2rpx solid #b2b2b2;
      // border-radius: 8rpx;
      .weui-uploader__img {
        width: 100%;
        height: 100%;
        border-radius: 8rpx;
      }
      .delete-image {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        width: 28rpx;
        height: 28rpx;
        background: url(../../assets/images/icon-delet.png);
        background-size: contain;
      }
    }
    .textarea {
      margin-top: 30rpx;
      min-height: 100rpx;
      width: 100%;
      textarea {
        width: 100%;
      }
    }
    .add-tag {
      .add-tag-hd {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 30rpx;

        .add-tag-text {
          flex: 1;
          margin-right: 10rpx;
        }
        .add-tag-button {
          color: #e79056;
        }
      }
      .add-tag-bd {
        padding: 15rpx 0;
        border-top: 1rpx solid #e6e6e6;
        .add-tag-item {
          display: flex;
          align-items: center;
        }

        .tag-text {
          margin-right: 30rpx;
          line-height: 58rpx;
        }
        .delete-tag {
          display: inline-block;
          width: 28rpx;
          height: 28rpx;
          border-radius: 50%;
          background: url(../../assets/images/icon-delet.png);
          background-size: contain;
        }
      }
    }
    .button-cell {
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 2;
      box-sizing: border-box;
      padding: 40rpx;
      width: 100%;
      background: #fff;
      .submit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80rpx;
        border-radius: 40rpx;
        background: #db9461;
        color: #ffffff;
      }
    }
  }
</style>
