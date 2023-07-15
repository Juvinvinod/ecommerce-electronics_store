/**
 * 放大镜插件     v1.1.0
 * @mail cj_zheng1023@hotmail.com
 * @author AfterWin
 *
 *
 *
 * update log
 *
 * 2017.5.30    修改通过请求获取的图片获取不到高宽的问题   v.1.1.0
 *
 */
(function ($) {
  const SPACING = 15;
  // var ZOOM_TIMES = 10;

  $.fn.jqZoom = function (options) {
    $(this).each((i, dom) => {
      const me = $(dom);
      _initZoom(me, options.selectorWidth, options.selectorHeight);
      const imgUrl =
        options && options.zoomImgUrl ? options.zoomImgUrl : me.attr('src');
      _initViewer(me, imgUrl, options.viewerWidth, options.viewerHeight);
    });
  };

  /**
   * 初始化聚焦框
   * @param target     图片jquery对象
   * @param sWidth     聚焦区域宽度
   * @param sHeight    聚焦区域长度
   * @private
   */
  var _initZoom = function (target, sWidth, sHeight) {
    const $zoom = $('<div />')
      .addClass('zoom-selector')
      .width(sWidth)
      .height(sHeight);
    target.after($zoom);
    target.closest('.zoom-box').on({
      mousemove(e) {
        const mouseX = e.pageX - $(this).offset().left;
        const mouseY = e.pageY - $(this).offset().top;
        const halfSWidth = sWidth / 2;
        const halfSHeight = sHeight / 2;
        let realX;
        let realY;
        if (mouseX < halfSWidth) {
          realX = 0;
        } else if (mouseX + halfSWidth > target.width()) {
          realX = target.width() - sWidth;
        } else {
          realX = mouseX - halfSWidth;
        }
        if (mouseY < halfSHeight) {
          realY = 0;
        } else if (mouseY + halfSHeight > target.height()) {
          realY = target.height() - sHeight;
        } else {
          realY = mouseY - halfSHeight;
        }
        $zoom.css({
          left: realX,
          top: realY,
        });
        const viewerX =
          (realX *
            ($(this).find('.viewer-box>img').width() -
              $(this).find('.viewer-box').width())) /
          (target.width() - sWidth);
        const viewerY =
          (realY *
            ($(this).find('.viewer-box>img').height() -
              $(this).find('.viewer-box').height())) /
          (target.height() - sHeight);
        $(this).find('.viewer-box>img').css({
          left: -viewerX,
          top: -viewerY,
        });
      },
      mouseenter() {
        $zoom.css('display', 'block');
        $(this).find('.viewer-box').css('display', 'block');
      },
      mouseleave() {
        $zoom.css('display', 'none');
        $(this).find('.viewer-box').css('display', 'none');
      },
    });
  };
  /**
   *初始化放大区域
   * @param target       图片jquery对象
   * @param imgUrl      原始图片URL
   * @param vWidth      放大区域宽度
   * @param vHeight     放大区域长度
   * @private
   */
  var _initViewer = function (target, imgUrl, vWidth, vHeight) {
    const $viewer = $('<div />')
      .addClass('viewer-box')
      .width(vWidth)
      .height(vHeight);
    const $zoomBox = target.closest('.zoom-box');
    $viewer.css({
      left: target.width() + SPACING,
      top: 0,
    });
    _setOriginalSize(target, (oWidth, oHeight) => {
      const $img = $(`<img src='${imgUrl}' />`).width(oWidth).height(oHeight);
      $viewer.append($img);
      target.after($viewer);
    });
  };
  /**
   * 设置图片原始宽高
   * @param target       图片jquery对象
   * @param callback     通过回调函数设置原始宽高
   * @returns {{oWidth: Number, oHeight: Number}}
   * @private
   */
  var _setOriginalSize = function (target, callback) {
    const newImg = new Image();
    newImg.src = `${target.attr('src')}?date=${new Date()}`;
    $(newImg).on('load', () => {
      callback(newImg.width, newImg.height);
    });
  };
})(jQuery);
