$ ->
  $('body').pasteImageReader
    callback: (results) ->
      console.log results
      dataURL = results.dataURL
      stack.add(dataURL)
      upload(dataURL)
    fail: (results) ->
      $.pnotify(
        title: 'Oh NO!'
        text: 'No image data in clipboard'
        type: 'error'
        delay: 2000
      )

  class ImageStack
    constructor: ->
      @count = 0

    at: (index) ->
      return $(".image-block:eq(#{index})")

    add: (dataURL) ->
      if @count > 0
        this.shift()
      img = new Image()
      img.onload = ->
        canvas = $('.image-block').first().children('.thumbnail').children('canvas')[0]
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = dataURL

      if @count < 9
        @count++
        $(".image-block:lt(#{@count})").css('display', 'block')

    shift: ->
      blocks = $('.image-block')
      for b, i in blocks when i % 3 == 2
        $(blocks[i]).insertBefore(blocks[(i+1) % 9])
      if @count == 9
        canvas = $('.image-block').first().children('.thumbnail').children('canvas')[0]
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

  stack = new ImageStack

  upload = (dataURL) ->
    base64 = dataURL.slice(22) if dataURL.indexOf('data:image/png;base64,')!=-1
    fd = new FormData
    fd.append 'image', base64
    fd.append 'key', '5df8062c468eb678dd194db7e2216387'

    $.ajax
      type: 'POST'
      url: 'http://api.imgur.com/2/upload.json'
      processData: false
      contentType: false
      data: fd
      dataType: 'json'
      success: (data) ->
        $.pnotify(
          title: 'Upload success'
          text: 'Image in clipboard is uploaded'
          type: 'success'
          delay: 2000
        )
        url = data.upload.links.original
        stack.at(0).children('a').zclip(
          path: 'zclip/ZeroClipboard.swf'
          copy: url
          afterCopy: () ->
        )

        return