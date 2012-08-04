$ ->
  $("html").pasteImageReader (results) ->
    {filename, dataURL} = results

    $("body").css
      backgroundImage: "url(#{dataURL})"

    dataURL = dataURL.slice(22) if dataURL.indexOf('data:image/png;base64,')!=-1
    $.ajax
      type: 'POST'
      url: './upload'
      dataType: 'json'
      data: { image : dataURL }
      success: (data) ->
        url = data.upload.links.original
        text = $('<input type="text" />').attr('value', url).attr('size', 70).insertBefore('#image').zclip({
          path: 'clipboard/ZeroClipboard.swf'
          copy: url
          afterCopy: () ->
        })
        return