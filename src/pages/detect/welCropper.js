/* eslint-disable */
// 获取选中区域的(x, y, w, h)
const getCropRect = cropperMovableItems => {
  let maxX = 0,
    maxY = 0
  for (let key in cropperMovableItems) {
    let item = cropperMovableItems[key]
    maxX = item.x > maxX ? item.x : maxX
    maxY = item.y > maxY ? item.y : maxY
  }

  let minX = maxX,
    minY = maxY
  for (let key in cropperMovableItems) {
    let item = cropperMovableItems[key]
    minX = item.x < minX ? item.x : minX
    minY = item.y < minY ? item.y : minY
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY
  }
}

//获取图片调整后的宽高
const getAdjustSize = (
  containerWidth,
  containerHeight,
  imgWidth,
  imgHeight
) => {
  const device = wx.getSystemInfoSync()
  let adWidth,
    adHeight,
    percent = containerWidth / device.windowWidth
  if (imgWidth / imgHeight > containerWidth / containerHeight) {
    //图片宽高比例大于容器的，宽度就是容器的宽度，高度自动调节
    adWidth = containerWidth * percent
    adHeight = imgHeight * (adWidth / imgWidth)
  } else {
    //图片宽高比例小于容器的，高度就是容器的高度，宽度自动调节
    adHeight = containerHeight * percent
    adWidth = imgWidth * (adHeight / imgHeight)
  }

  return {
    width: adWidth,
    height: adHeight
  }
}

const cropperUtil = {
  getCropRect,
  getAdjustSize
}

var init = function(containerWidth, containerHeight, imgWidth, imgHeight, src) {
  let adImgInfo = getAdjustSize(
    containerWidth,
    containerHeight,
    imgWidth,
    imgHeight
  )
  let that = this

  that.cropperData = {
    hidden: true,
    left: (containerWidth - adImgInfo.width) / 2,
    top: (containerHeight - adImgInfo.height) / 2,
    width: adImgInfo.width,
    height: adImgInfo.height,
    itemLength: 50 * containerWidth / 375,
    imageInfo: {
      src: src,
      w: adImgInfo.width,
      h: adImgInfo.height
    },
    scaleInfo: {
      x: 1,
      y: 1
    }
  }
  that.cropperMovableItems = {
    //框上的四个可移动的角的坐标
    topleft: {
      x: 50,
      y: 50
    },
    topright: {
      x: adImgInfo.width - 50,
      y: 50
    },
    bottomleft: {
      x: 50,
      y: adImgInfo.height - 50
    },
    bottomright: {
      x: adImgInfo.width - 50,
      y: adImgInfo.height - 50
    }
  }
  that.cropperCenterMoveArea = {
    //框里整体可移动区域的左上角坐标、宽高、相对这次移动的上个点的坐标
    x: 50,
    y: 50,
    startX: 50,
    startY: 50,
    width: adImgInfo.width - 20,
    height: adImgInfo.height - 20
  }
  // 显示cropper，如果有图片则载入
  that.showCropper = function(rectInfo) {
    let that = this

    //默认值
    if (!rectInfo.x) {
      rectInfo.x = 0.05
      rectInfo.y = 0.05
      rectInfo.width = 0.9
      rectInfo.height = 0.9
    }

    that.cropperData.hidden = false
    that.cropperData.rectInfo = rectInfo

    let imageInfo = that.cropperData.imageInfo
    let cropperMovableItems = that.cropperMovableItems
    let cropperCenterMoveArea = that.cropperCenterMoveArea

    //比最小框的比例还小的设置成最小框比例
    let miniWidthScale = 40 / imageInfo.w
    let miniHeightScale = 40 / imageInfo.h
    if (rectInfo.width < miniWidthScale) {
      rectInfo.width = miniWidthScale
    }
    if (rectInfo.height < miniHeightScale) {
      rectInfo.height = miniHeightScale
    }

    if (rectInfo) {
      cropperMovableItems['topleft'].x = rectInfo.x * imageInfo.w
      cropperMovableItems['topleft'].y = rectInfo.y * imageInfo.h

      cropperMovableItems['topright'].x =
        rectInfo.x * imageInfo.w + rectInfo.width * imageInfo.w
      cropperMovableItems['topright'].y = rectInfo.y * imageInfo.h

      cropperMovableItems['bottomright'].x =
        rectInfo.x * imageInfo.w + rectInfo.width * imageInfo.w
      cropperMovableItems['bottomright'].y =
        rectInfo.y * imageInfo.h + rectInfo.height * imageInfo.h

      cropperMovableItems['bottomleft'].x = rectInfo.x * imageInfo.w
      cropperMovableItems['bottomleft'].y =
        rectInfo.y * imageInfo.h + rectInfo.height * imageInfo.h

      cropperCenterMoveArea.x = cropperMovableItems['topleft'].x
      cropperCenterMoveArea.y = cropperMovableItems['topleft'].y
      cropperCenterMoveArea.width =
        cropperMovableItems['topright'].x - cropperMovableItems['topleft'].x
      cropperCenterMoveArea.height =
        cropperMovableItems['bottomleft'].y - cropperMovableItems['topleft'].y
    }

    that.cropperData = that.cropperData
    that.cropperMovableItems = cropperMovableItems
    that.cropperCenterMoveArea = cropperCenterMoveArea
    that.drawImage()
    that.drawLines(that.cropperMovableItems)
  }

  // 隐藏cropper
  that.hideCropper = function() {
    let that = this

    that.cropperData.hidden = true
    that.cropperData.cropCallback = null

    /* that.setData({
      cropperData: that.cropperData
    }) */
    that.cropperData = that.cropperData
    that.clearCanvas()
  }

  // 清空canvas上的数据
  that.clearCanvas = () => {
    let cropperData = that.cropperData
    let imageInfo = cropperData.imageInfo
    let size = cropperUtil.getAdjustSize(W, H, imageInfo.w, imageInfo.h)

    if (imageInfo.src != '') {
      let src = imageInfo.src

      //绘制原图
      let ctx = wx.createCanvasContext('originalCanvas')
      ctx.clearRect(0, 0, imageInfo.w, imageInfo.h)
      ctx.draw()

      //绘制选择区图片
      let canvas = wx.createCanvasContext('canvas')
      canvas.clearRect(0, 0, size.width, size.height)
      canvas.draw()

      let moveCanvas = wx.createCanvasContext('moveCanvas')
      moveCanvas.clearRect(0, 0, size.width, size.height)
      moveCanvas.draw()
    }
  }

  //绘制图片
  that.drawImage = () => {
    let that = this
    let cropperData = that.cropperData
    let imageInfo = cropperData.imageInfo

    if (imageInfo.src != '') {
      let src = imageInfo.src

      //绘制原图
      let originalCanvas = wx.createCanvasContext('originalCanvas')
      originalCanvas.drawImage(src, 0, 0, imageInfo.w, imageInfo.h)
      originalCanvas.draw()

      //绘制选择区图片
      let canvas = wx.createCanvasContext('canvas')
      canvas.drawImage(src, 0, 0, imageInfo.w, imageInfo.h)
      canvas.draw()
    }
  }

  //绘制选框
  that.drawLines = (cropperMovableItems, key) => {
    let that = this
    let cropperData = that.cropperData
    let imageInfo = cropperData.imageInfo

    if (key) {
      var x = cropperMovableItems[key].x
      var y = cropperMovableItems[key].y

      if (key == 'topleft') {
        cropperMovableItems['bottomleft'].x = x
        cropperMovableItems['topright'].y = y
      } else if (key == 'topright') {
        cropperMovableItems['bottomright'].x = x
        cropperMovableItems['topleft'].y = y
      } else if (key == 'bottomleft') {
        cropperMovableItems['topleft'].x = x
        cropperMovableItems['bottomright'].y = y
      } else if (key == 'bottomright') {
        cropperMovableItems['topright'].x = x
        cropperMovableItems['bottomleft'].y = y
      }
    }

    let size = {
      width: cropperData.imageInfo.w,
      height: cropperData.imageInfo.h
    }

    let ctx = wx.createCanvasContext('moveCanvas')

    //绘制高亮选中区域
    // console.log(cropperMovableItems)
    let rect = cropperUtil.getCropRect(cropperMovableItems)
    ctx.setFillStyle('rgba(0,0,0,0.5)')
    ctx.fillRect(0, 0, size.width, size.height)
    ctx.setFillStyle('rgba(0,0,0,0)')
    ctx.clearRect(rect.x, rect.y, rect.w, rect.h)

    //绘制选中边框
    ctx.setStrokeStyle('white')
    ctx.setLineWidth(2)
    ctx.beginPath()
    ctx.moveTo(rect.x, rect.y)
    ctx.lineTo(rect.x + rect.w, rect.y)
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h)
    ctx.lineTo(rect.x, rect.y + rect.h)
    ctx.lineTo(rect.x, rect.y)

    ctx.stroke()
    ctx.closePath()

    //绘制四个角的圆点
    let cornerType = 'rect' //'circle'
    ctx.setFillStyle('white')
    ctx.setStrokeStyle('white')

    // 绘制不同样式的角
    if (cornerType == 'circle') {
      ctx.beginPath()
      ctx.arc(rect.x, rect.y, 10, 0, 2 * Math.PI, true)
      ctx.fill()
      ctx.closePath()

      ctx.beginPath()
      ctx.arc(rect.x + rect.w, rect.y, 10, 0, 2 * Math.PI, true)
      ctx.fill()
      ctx.closePath()

      ctx.beginPath()
      ctx.arc(rect.x + rect.w, rect.y + rect.h, 10, 0, 2 * Math.PI, true)
      ctx.fill()
      ctx.closePath()

      ctx.beginPath()
      ctx.arc(rect.x, rect.y + rect.h, 10, 0, 2 * Math.PI, true)
      ctx.fill()
      ctx.closePath()
    } else if (cornerType == 'rect') {
      let len = 20,
        w = 3.0,
        offset = w / 2.0

      ctx.setLineWidth(w)
      ctx.beginPath()

      ctx.moveTo(rect.x - offset, rect.y - offset + len)
      ctx.lineTo(rect.x - offset, rect.y - offset)
      ctx.lineTo(rect.x - offset + len, rect.y - offset)

      ctx.moveTo(rect.x + offset + rect.w - len, rect.y - offset)
      ctx.lineTo(rect.x + offset + rect.w, rect.y - offset)
      ctx.lineTo(rect.x + offset + rect.w, rect.y - offset + len)

      ctx.moveTo(rect.x + offset + rect.w, rect.y + offset + rect.h - len)
      ctx.lineTo(rect.x + offset + rect.w, rect.y + offset + rect.h)
      ctx.lineTo(rect.x + offset + rect.w - len, rect.y + offset + rect.h)

      ctx.moveTo(rect.x - offset, rect.y + offset + rect.h - len)
      ctx.lineTo(rect.x - offset, rect.y + offset + rect.h)
      ctx.lineTo(rect.x - offset + len, rect.y + offset + rect.h)

      ctx.stroke()

      ctx.closePath()
    }

    ctx.draw()
  }

  // move events
  that.setupMoveItem = (key, changedTouches, callback) => {
    let that = this
    let cropperData = that.cropperData
    let cropperMovableItems = that.cropperMovableItems
    let left = cropperData.left
    let top = cropperData.top
    if (changedTouches.length == 1) {
      //要加判断，超出边界要置成边界值
      let touch = changedTouches[0]
      let x = touch.clientX
      let y = touch.clientY

      //要加判断，超出边界要置成边界值  另外要加的判断：左上角的点不能向下移动到左下角的点的下方，不能移动到右上角的右方，其他三个点也是类似
      x -= left
      y -= top

      let moveTop, moveBottom, moveLeft, moveRight //点移动的四个方向的边界值
      switch (key) {
        case 'topleft':
          moveTop = 0
          moveBottom = cropperMovableItems['bottomleft'].y
          moveLeft = 0
          moveRight = cropperMovableItems['topright'].x
          break
        case 'topright':
          moveTop = 0
          moveBottom = cropperMovableItems['bottomright'].y
          moveLeft = cropperMovableItems['topleft'].x
          moveRight = cropperData.imageInfo.w
          break
        case 'bottomright':
          moveTop = cropperMovableItems['topright'].y
          moveBottom = cropperData.imageInfo.h
          moveLeft = cropperMovableItems['bottomleft'].x
          moveRight = cropperData.imageInfo.w
          break
        case 'bottomleft':
          moveTop = cropperMovableItems['topleft'].y
          moveBottom = cropperData.imageInfo.h
          moveLeft = 0
          moveRight = cropperMovableItems['bottomright'].x
          break
      }

      //边界值判断和最小框判断
      //最小框的大小
      let defaultSize = 40
      //画最大框时不能画全屏
      let marginVal = 5
      if (
        x < moveLeft + marginVal &&
        (key === 'topleft' || key === 'bottomleft')
      ) {
        x = moveLeft + marginVal
      }
      if (
        x < moveLeft + defaultSize &&
        (key === 'topright' || key === 'bottomright')
      ) {
        x = moveLeft + defaultSize
      }

      if (
        x > moveRight - marginVal &&
        (key === 'topright' || key === 'bottomright')
      ) {
        x = moveRight - marginVal
      }
      if (
        x > moveRight - defaultSize &&
        (key === 'topleft' || key === 'bottomleft')
      ) {
        x = moveRight - defaultSize
      }

      if (
        y < moveTop + marginVal &&
        (key === 'topleft' || key === 'topright')
      ) {
        y = moveTop + marginVal
      }
      if (
        y < moveTop + defaultSize &&
        (key === 'bottomleft' || key === 'bottomright')
      ) {
        y = moveTop + defaultSize
      }

      if (
        y > moveBottom - marginVal &&
        (key === 'bottomleft' || key === 'bottomright')
      ) {
        y = moveBottom - marginVal
      }
      if (
        y > moveBottom - defaultSize &&
        (key === 'topleft' || key === 'topright')
      ) {
        y = moveBottom - defaultSize
      }

      cropperMovableItems[key].x = x
      cropperMovableItems[key].y = y

      that.drawLines(cropperMovableItems, key)

      if (callback) {
        callback(cropperMovableItems)
      }
    }
  }

  // moveable-view touchmove
  that.moveEvent = e => {
    let that = this
    let key = e.mp.currentTarget.dataset.key
    that.setupMoveItem(key, e.mp.changedTouches)
  }

  // moveable-view touchend，end的时候设置movable-view的位置，如果在move阶段设置位置，选中会不流畅
  that.endEvent = e => {
    let that = this
    let key = e.mp.currentTarget.dataset.key
    that.setupMoveItem(key, e.mp.changedTouches, that.setFrameInfo)
  }

  that.allStartMoveEvent = e => {
    //记录初始位置
    let that = this
    let cropperCenterMoveArea = that.cropperCenterMoveArea
    let touch = e.mp.changedTouches[0]
    cropperCenterMoveArea.startX = touch.clientX
    cropperCenterMoveArea.startY = touch.clientY
    that.cropperCenterMoveArea = cropperCenterMoveArea
  }

  that.allMoveEvent = e => {
    //记录移动的位置并调用setMoveItems进行重新画框
    let that = this
    that.setMoveArea(e, that.drawLines)
  }

  that.allEndMoveEvent = e => {
    //最后进行设置四个角位置，然后加进行加载商品列表
    that.setMoveArea(e, that.setFrameInfo)
  }

  that.setMoveArea = (e, callback) => {
    //在移动过程中去重新画框  并对移动的边界做限制
    let that = this
    let cropperData = that.cropperData
    let left = cropperData.left
    let top = cropperData.top

    let cropperCenterMoveArea = that.cropperCenterMoveArea
    let cropperMovableItems = that.cropperMovableItems
    let touch = e.mp.changedTouches[0]
    let diffX = touch.clientX - cropperCenterMoveArea.startX
    let diffY = touch.clientY - cropperCenterMoveArea.startY

    //怎么判断边界值，怎么重置??
    //现在知道移动区域的左上角坐标及宽度，所以可以判断
    //x+diffX>0    x+width+diffX<imgWidth
    //y+diffY>0  y+height+diffY<imgHeight
    if (cropperCenterMoveArea.x + diffX < 0) {
      diffX = -cropperCenterMoveArea.x
    }
    if (
      cropperCenterMoveArea.x + cropperCenterMoveArea.width + diffX >
      cropperData.imageInfo.w
    ) {
      diffX =
        cropperData.imageInfo.w -
        cropperCenterMoveArea.width -
        cropperCenterMoveArea.x
    }
    if (cropperCenterMoveArea.y + diffY < 0) {
      diffY = -cropperCenterMoveArea.y
    }
    if (
      cropperCenterMoveArea.y + diffY + cropperCenterMoveArea.height >
      cropperData.imageInfo.h
    ) {
      diffY =
        cropperData.imageInfo.h -
        cropperCenterMoveArea.height -
        cropperCenterMoveArea.y
    }

    cropperCenterMoveArea.startX += diffX
    cropperCenterMoveArea.startY += diffY
    cropperCenterMoveArea.x += diffX
    cropperCenterMoveArea.y += diffY

    for (var location in cropperMovableItems) {
      cropperMovableItems[location].x += diffX
      cropperMovableItems[location].y += diffY
    }
    /* that.setData({
      cropperCenterMoveArea: cropperCenterMoveArea
    }) */
    that.cropperCenterMoveArea = cropperCenterMoveArea
    if (callback) {
      callback(cropperMovableItems)
    }
  }

  that.setFrameInfo = cropperMovableItems => {
    //设置最后要提交识别的框的x y w h  并且重新设置cropperCenterMoveArea和cropperMovableItems
    let that = this
    let cropperData = that.cropperData
    let left = cropperData.left
    let top = cropperData.top

    let cropperCenterMoveArea = that.cropperCenterMoveArea
    cropperCenterMoveArea.x = cropperMovableItems['topleft'].x
    cropperCenterMoveArea.y = cropperMovableItems['topleft'].y
    cropperCenterMoveArea.width =
      cropperMovableItems['topright'].x - cropperMovableItems['topleft'].x
    cropperCenterMoveArea.height =
      cropperMovableItems['bottomleft'].y - cropperMovableItems['topleft'].y

    let x = cropperMovableItems['topleft'].x
    let y = cropperMovableItems['topleft'].y
    let width =
      cropperMovableItems['topright'].x - cropperMovableItems['topleft'].x
    let height =
      cropperMovableItems['bottomleft'].y - cropperMovableItems['topleft'].y
    x = x / cropperData.imageInfo.w
    y = y / cropperData.imageInfo.h
    let w = width / cropperData.imageInfo.w
    let h = height / cropperData.imageInfo.h
    that.cropperMovableItems = cropperMovableItems
    that.cropperCenterMoveArea = cropperCenterMoveArea
    that.frameInfo = {
      x: x,
      y: y,
      width: w,
      height: h
    }
    that.reloadGoodsList()
  }
}

module.exports = {
  init
}
