$(function() {

  // We start by checking if the browser supports the
  // Clipboard object. If not, we need to create a
  // contenteditable element that catches all pasted data
  if (!window.Clipboard) {
    var pasteCatcher = document.createElement("div");

    // Firefox allows images to be pasted into contenteditable elements
    pasteCatcher.setAttribute("contenteditable", "");

    // We can hide the element and append it to the body,
    pasteCatcher.style.opacity = 0;
    document.body.appendChild(pasteCatcher);

    // as long as we make sure it is always in focus
    pasteCatcher.focus();
    document.addEventListener("click", function() {
      pasteCatcher.focus();
    });
  }
  // Add the paste event listener
  window.addEventListener("paste", pasteHandler);

  /* Handle paste events */
  function pasteHandler(e) {
    // We need to check if event.clipboardData is supported (Chrome)
    if (e.clipboardData) {
      // Get the items from the clipboard
      var items = e.clipboardData.items;
      if (items) {
        // Loop through all items, looking for any kind of image
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            // We need to represent the image as a file,
            var blob = items[i].getAsFile();

            // The URL can then be used as the source of an image
            var pastedImage = new FileReader();
            pastedImage.onload = function (event) {
              var dataURL = event.target.result;
              createImage(dataURL);
            }
            pastedImage.readAsDataURL(blob);
          }
        }
      }
      // If we can't handle clipboard data directly (Firefox),
      // we need to read what was pasted from the contenteditable element
    } else {
      // This is a cheap trick to make sure we read the data
      // AFTER it has been inserted.
      setTimeout(checkInput, 1);
    }
  }

  /* Parse the input in the paste catcher element */
  function checkInput() {
    // Store the pasted content in a variable
    var child = pasteCatcher.childNodes[0];

    // Clear the inner html to make sure we're always
    // getting the latest inserted content
    pasteCatcher.innerHTML = "";

    if (child) {
      // If the user pastes an image, the src attribute
      // will represent the image as a base64 encoded string.
      if (child.tagName === "IMG") {
        createImage(child.src);
      } else {
        $.pnotify({
          title: 'Oh NO!',
          text: 'No image data in clipboard',
          type: 'error',
          delay: 2000
        });
      }
    }
  }

  function createImage(dataURL) {
    stack.add(dataURL);
    upload(dataURL);
  }

  var ImageStack = (function() {

    function ImageStack() {
      this.count = 0;
    }

    ImageStack.prototype.at = function(index) {
      return $(".image-block:eq(" + index + ")").children('a.thumbnail');
    };

    ImageStack.prototype.add = function(dataURL) {
      if (this.count > 0) {
        this.shift();
      }
      var img = new Image();
      img.onload = function() {
        var canvas = $('.image-block').first().children('a.thumbnail').children('canvas')[0];
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = dataURL;
      if (this.count < 9) {
        this.count++;
        return $(".image-block:lt(" + this.count + ")").css('display', 'block');
      }
    };

    ImageStack.prototype.shift = function() {
      var blocks = $('.image-block');
      for(var i = 0; i < blocks.length; i++) {
        if(i % 3 == 2) {
          $(blocks[i]).insertBefore(blocks[(i + 1) % 9]);
        }
      }
      if (this.count === 9) {
        canvas = $('.image-block').first().children('.thumbnail').children('canvas')[0];
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    ImageStack.prototype.rebind = function() {
      $(".image-block:lt(" + this.count + ")").children('a').zclip('remove').zclip({
        path: 'zclip/ZeroClipboard.swf',
        copy: function() {
          console.log('copy');
          return $(this).attr('title');
        },
        afterCopy: function() {}
      });
    };

    return ImageStack;

  })();

  var stack = new ImageStack;

  upload = function(dataURL) {
    if (dataURL.indexOf('data:image/png;base64,') !== -1) {
      var base64 = dataURL.slice(22);
    }
    var fd = new FormData;
    fd.append('image', base64);
    fd.append('key', '5df8062c468eb678dd194db7e2216387');
    $.ajax({
      type: 'POST',
      url: 'http://api.imgur.com/2/upload.json',
      processData: false,
      contentType: false,
      crossDomain: true,
      data: fd,
      dataType: 'json',
      beforeSend: function() {
        stack.at(0).
          children('canvas').
          css('visibility', 'hidden').
          parent().addClass('loading-icon').
            append('<div class="progress progress-striped active"><div class="bar"></div></div>')
      },
      success: function(data) {
        stack.at(0).children('canvas').css('visibility', 'visible').css('display', 'none').fadeIn().parent().removeClass('loading-icon');
        $('.progress').remove();
        $.pnotify({
          title: 'Upload success',
          text: 'Image in clipboard is uploaded',
          type: 'success',
          delay: 5000
        });
        var url = data.upload.links.original;
        stack.at(0).attr('title', url);
        stack.rebind();
      },
      xhr: function() {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function(evt) {
          if(evt.lengthComputable) {
            var percent_complete = evt.loaded * 100 / evt.total;
            $('.bar').css('width', Math.floor(percent_complete) + '%')
            console.log(percent_complete);
          }
        }, false)
        return xhr;
      }
    });
  };
});