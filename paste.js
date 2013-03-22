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
        var pastedImage = new FileReader();
        pastedImage.onload = function (event) {
          var dataURL = event.target.result;
          createImage(dataURL);
        };

        // Loop through all items, looking for any kind of image
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            // We need to represent the image as a file,
            var blob = items[i].getAsFile();

            // The URL can then be used as the source of an image
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
    queue.add(dataURL);
  }

  var ImageQueue = (function () {
    function ImageQueue() {
      this.idx = 0;
      this.canvases = $('.image-block canvas');
      this.page = 0;
    }

    ImageQueue.prototype.latest = function() {
      return this.canvases.eq(this.idx)[0];
    };

    ImageQueue.prototype.add = function(dataURL) {
      if(this.idx > 9) {
        // another page
      }

      var img = new Image();
      img.onload = function() {
        var canvas = queue.latest();
        canvas.getContext('2d').drawImage(this, 0, 0, canvas.width, canvas.height);
        queue.upload(queue.idx, this.src);
        queue.idx++;
      };
      img.src = dataURL;
    };

    ImageQueue.prototype.upload = function(idx, dataURL) {
      var base64;
      if (dataURL.indexOf('data:image/png;base64,') !== -1) {
        base64 = dataURL.slice(22);
      }
      var fd = new FormData();
      fd.append('image', base64);
      fd.append('key', '5df8062c468eb678dd194db7e2216387');

      var upload_req = $.ajax({
        type: 'POST',
        url: 'http://api.imgur.com/2/upload.json',
        processData: false,
        contentType: false,
        crossDomain: true,
        data: fd,
        dataType: 'json',
        beforeSend: function() {
          queue.canvases.eq(idx).css('visibility', 'hidden');
          $('.image-block').eq(idx).addClass('loading-icon').css('display', 'block').
              append('<div class="progress progress-striped active"><div class="bar"></div></div>');
        },
        success: function(data, status, xhr) {
          var index = xhr.idx;
          var obj = queue.canvases.eq(index);
          obj.css('visibility', 'visible').css('display', 'none').fadeIn().parent().removeClass('loading-icon');
          // remove progress bar
          obj.parent().next().remove();
          $.pnotify({
            title: 'Upload success',
            text: 'Image in clipboard is uploaded',
            type: 'success',
            delay: 5000
          });
          var url = data.upload.links.original;
          // attach url
          obj.parent().attr('title', url);
          queue.bind_copy(index);
        },
        xhr: function() {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener('progress', function(evt) {
            if(evt.lengthComputable) {
              var percent_complete = evt.loaded * 100 / evt.total;
              $('.bar').css('width', Math.floor(percent_complete) + '%');
              console.log(percent_complete);
            }
          }, false);
          return xhr;
        }
      });
      upload_req.idx = idx;
    };

    ImageQueue.prototype.bind_copy = function(idx) {
      $(".image-block").eq(idx).children('a').zclip({
        path: 'zclip/ZeroClipboard.swf',
        copy: function() {
          return $(this).attr('title');
        },
        afterCopy: function() {}
      });
    };

    return ImageQueue;

  })();

  var queue = new ImageQueue();
});