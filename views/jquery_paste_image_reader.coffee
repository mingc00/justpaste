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
    matchType: /image.*/

  $.fn.pasteImageReader = (options) ->
    if typeof options == "function"
      options =
        callback: options

    options = $.extend({}, defaults, options)

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

)(jQuery)