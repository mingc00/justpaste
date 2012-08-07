$ ->
  if window.Clipboard
    $("html").pasteImageReader
      callback: (results) ->
        {filename, dataURL} = results
        setSnapshot(dataURL)
        upload(dataURL)
      fail: (results) ->
        $.pnotify(
          title: 'Oh NO!'
          text: 'No image data in clipboard'
          type: 'error'
          delay: 2000
        )
  else
    pasteCatcher = $('<div></div>').attr('contenteditable', '').css('display', 'none')
    $('body').append(pasteCatcher)
    pasteCatcher.focus()
    $(this).bind 'click', ->
      pasteCatcher.focus()
    $(window).bind 'paste', (e) ->
      setTimeout(checkInput, 1)

  class Modal
    constructor: () ->
      @m = $('#response_box').modal({ show: false })

    finished: (url) ->
      this.set_title 'Finish'
      $('#finished a').attr('href', url).html(url)

      $('#uploading').css('display', 'none')
      $('#finished').css('display', 'block')
      $('#copy_button').zclip(
        path: 'zclip/ZeroClipboard.swf'
        copy: url
        afterCopy: () ->
          box.close()
      )

    uploading: ->
      this.set_title 'Uploading'

      $('#uploading').css('display', 'block')
      $('#finished').css('display', 'none')
      @m.modal('show')

    set_title: (title) ->
      $('.modal-header h3').html(title)

    close: ->
      @m.modal('hide')

  box = new Modal

  checkInput = ->
    child = $('div')[0].childNodes[0]
    $('div').html('')
    if child
      if child.tagName == 'IMG'
        dataURL = child.src
        setSnapshot(dataURL)
        upload(dataURL)

  setSnapshot = (dataURL) ->
    img = new Image()
    img.onload = ->
      canvas = document.getElementById('snapshot')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
    img.src = dataURL

  upload = (dataURL) ->
    box.uploading()

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
        box.finished(url)
        return