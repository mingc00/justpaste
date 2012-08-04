$ ->
  $("html").pasteImageReader (results) ->
    {filename, dataURL} = results

    $('#image').attr('src', dataURL)

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