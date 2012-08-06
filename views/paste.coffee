$ ->
  if window.clipboard
    $("html").pasteImageReader (results) ->
      {filename, dataURL} = results
      $('#image').attr('src', dataURL)
      upload(dataURL)
  else
    pasteCatcher = $('<div></div>').attr('contenteditable', '').css('display', 'none')
    $('body').append(pasteCatcher)
    pasteCatcher.focus()
    $(this).bind 'click', ->
      pasteCatcher.focus()
    $(window).bind 'paste', (e) ->
      setTimeout(checkInput, 1)

checkInput = ->
  child = $('div')[0].childNodes[0]
  $('div').html('')
  if child
    if child.tagName == 'IMG'
      dataURL = child.src
      $('#image').attr('src', dataURL)
      upload(dataURL)

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
      url = data.upload.links.original
      text = $('<input type="text" />').attr('value', url).attr('size', 70).insertBefore('#image').zclip({
        path: 'clipboard/ZeroClipboard.swf'
        copy: url
        afterCopy: () ->
      })
      return