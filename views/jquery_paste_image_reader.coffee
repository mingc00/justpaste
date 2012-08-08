# Created by STRd6
# MIT License
# jquery.paste_image_reader.js.coffee
(($) ->
  $.event.fix = ((originalFix) ->
    (event) ->
      event = originalFix.apply(this, arguments)

      if event.type.indexOf('copy') == 0 || event.type.indexOf('paste') == 0
        event.clipboardData = event.originalEvent.clipboardData

      return event

  )($.event.fix)

  defaults =
    callback: $.noop
    fail: $.noop
    matchType: /image.*/

  $.fn.pasteImageReader = (options) ->
    if typeof options == "object"
      opts = {}
      if options.callback && typeof options.callback == "function"
        opts.callback = options.callback
      if options.fail && typeof options.fail == "function"
        opts.fail = options.fail

    options = $.extend({}, defaults, opts)

    if not window.Clipboard
      pasteCatcher = $('<div></div>').attr('contenteditable', '').attr('id', '__paste').css('display', 'none')
      $('body').append(pasteCatcher)
      pasteCatcher.focus()
      $(this).bind 'click', ->
        pasteCatcher.focus()

      checkInput = ->
        child = $('#__paste').children()[0]
        $('#__paste').html('')
        if child && child.tagName == 'IMG'
            dataURL = child.src
            options.callback(
              dataURL: child.src
            )
        else
          options.fail()

      $(window).bind 'paste', (e) ->
        setTimeout(checkInput, 1)
      return

    this.each ->
      element = this
      $this = $(this)

      $this.bind 'paste', (event) ->
        found = false
        clipboardData = event.clipboardData

        Array::forEach.call clipboardData.types, (type, i) ->
          return if found

          if type.match(options.matchType) or clipboardData.items[i].type.match(options.matchType)
            file = clipboardData.items[i].getAsFile()

            reader = new FileReader()

            reader.onload = (evt) ->
              options.callback.call element,
                dataURL: evt.target.result
                event: evt
                file: file
                name: file.name

            reader.readAsDataURL(file)

            found = true

        if found == false
          options.fail.call element

)(jQuery)