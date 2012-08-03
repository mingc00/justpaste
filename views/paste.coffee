$ ->
  # Firefox
  if not window.Clipboard
    pasteCatcher = document.createElement "div"
    pasteCatcher.setAttribute "contenteditable", true
    pasteCatcher.style.display = 'none'
    pasteCatcher.focus()
    document.addEventListener "click", ->
      pasteCatcher.focus()

  window.addEventListener "paste", (e) ->
    if e.clipboardData
      items = e.clipboardData.items
      if items
        for item in items
          if item.type.indexOf("image") != -1
            blob = item.getAsFile()
            urlObj = window.URL || window.webkitURL
            source = urlObj.createObjectURL blob
            pastedImage = new Image()
            pastedImage.onload = ->
              upload(pastedImage)
            pastedImage.src = source
            document.getElementById('image').src = pastedImage.src
      else
        setTimeOut checkInput, 1

getBase64 = (img) ->
  canvas = document.createElement 'canvas'
  canvas.width = img.width
  canvas.height = img.height
  context = canvas.getContext '2d'
  context.drawImage img, 0, 0
  dataURL = canvas.toDataURL ''
  window.t = dataURL
  dataURL.replace /^data:image\/(png|jpg);base64,/, ''

upload = (img) ->
  $.post './upload', {image : getBase64(img)}, (data) ->
    console.log data
    text = $('<input type="text" />').attr('value', data).attr('size', 70).insertBefore('#image').zclip({
      path: 'clipboard/ZeroClipboard.swf'
      copy: data
      afterCopy: () ->
    })
    true
