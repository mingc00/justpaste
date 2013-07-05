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
    if (e.clipboardData && navigator.userAgent.match(/webkit/i)) {
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
        //No image data in clipboard
      }
    }
  }

  function createImage(dataURL) {
    queue.add(dataURL);
  }

  function notify(title, text, idx) {
    $.gritter.add({
      title: title,
      text: text,
      image: $('img').eq(idx)[0].src
    });
  }

  var ImageQueue = (function () {
    function ImageQueue() {
      this.idx = 0;
      this.canvases = $('.image-block img');
      this.page = 0;
    }

    ImageQueue.prototype.latest = function() {
      return this.canvases.eq(this.idx)[0];
    };

    ImageQueue.prototype.add = function(dataURL) {
      if(this.idx === 0) {
        $('.tip').css('display', 'none');
      }
      if(this.idx >= 6) {
        // another page
      }

      var img = queue.latest();
      img.onload = function() {
        queue.upload(queue.idx, this.src);
        queue.idx = (queue.idx + 1) % 6;
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
              find('.thumbnail').append('<div class="progress"><div class="bar"></div></div>');
        },
        success: function(data, status, xhr) {
          var index = xhr.idx;
          var obj = queue.canvases.eq(index);
          obj.css('visibility', 'visible').css('display', 'none').fadeIn().parent().removeClass('loading-icon');
          // remove progress bar
          $('.image-block').eq(index).find('.progress').remove();
          notify('Done', '', index);
          var url = data.upload.links.original;
          // attach url
          $('.image-block').eq(index).find('.action-bar a').attr('title', url);
          queue.bind_copy(index);
          $('.image-block').eq(index).hover(function (e) {
            var visibility = (e.type == 'mouseleave' ? 'hidden' : 'visible');
            $(this).find('.dashboard').css('visibility', visibility);
          });
        },
        xhr: function() {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.idx = idx;
          xhr.upload.addEventListener('progress', function(evt) {
            if(evt.lengthComputable) {
              var percent_complete = evt.loaded * 100 / evt.total;
              $('.image-block').eq(this.idx).find('.bar').css('width', Math.floor(percent_complete) + '%');
              console.log(percent_complete);
            }
          }, false);
          return xhr;
        }
      });
      upload_req.idx = idx;
    };

    ImageQueue.prototype.bind_copy = function(idx) {
      $(".image-block").eq(idx).find('.cp-link').zclip({
        path: 'zclip/ZeroClipboard.swf',
        copy: function() {
          return $(this).attr('title');
        },
        afterCopy: function() {
          var url = $('.cp-link').eq(idx).attr('title');
          notify('Copy link', url, idx);
        }
      });
      $('.zclip').eq(idx).hover(function(e) {
        $(this).parent().parent().css('visibility', 'visible');
      });
    };

    return ImageQueue;

  })();

  var queue = new ImageQueue();

  $('.pk-link').click(function() {
    var url = this.title;
    window.open('http://www.plurk.com/?qualifier=shares&status='.
      concat(encodeURIComponent(url)));
  });

  $('.tb-link').click(function() {
    var url = this.title;
    window.open('http://www.tumblr.com/share/photo?source='.
      concat(encodeURIComponent(url)), 'tumblr share',
      'height=450, width=430');
  });
});
