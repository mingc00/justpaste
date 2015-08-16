(function () {
  var utils = {
    empty: function(el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }
  }

  var Justpaste = function() {
    this.isProxy = !navigator.userAgent.match(/webkit/i);
    this.ui = new UIHandler();
  };

  Justpaste.prototype.init = function() {
    if (this.isProxy) {
      this.setupProxy();
    }
    document.addEventListener('paste', this.pasteHandler.bind(this));
  };

  Justpaste.prototype.setupProxy = function() {
    var el = document.getElementById('paste-zone');
    document.addEventListener("keydown", function(e) {
      var isCtrlDown = (e.ctrlKey && navigator.userAgent.indexOf('Mac') === -1) || e.metaKey;
      if (isCtrlDown && e.keyCode === 86) {  //ctrl-v
        el.focus();
      }
    });
    this.pasteCatcher = el;
  };

  Justpaste.prototype.pasteHandler = function(e) {
    this.getImage(e, (function(dataURL) {
      this.ui.setImage(dataURL);
      var base64;
      match_result = dataURL.match(/data:image\/(\w+);base64,(.*)/);
      if(match_result) {
        base64 = match_result[2];
        this.upload(base64);
      }
    }).bind(this));
  };

  Justpaste.prototype.getImage = function(e, callback) {
    if (this.isProxy) {
      setTimeout(this.fromDom.bind(this, callback), 0);
    } else {
      this.fromClipboard(e, callback);
    }
  };

  Justpaste.prototype.fromClipboard = function(e, callback) {
    if (!e.clipboardData) {
      return;
    }
    var items = e.clipboardData.items;
    if (!items) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      callback(e.target.result);
    }

    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        var blob = items[i] instanceof File ? items[i] : items[i].getAsFile();
        reader.readAsDataURL(blob);
      }
    }
  }

  Justpaste.prototype.fromDom = function(callback) {
    var imgEl = this.pasteCatcher.childNodes[0];
    utils.empty(this.pasteCatcher);
    if (imgEl && imgEl.tagName === 'IMG') {
      if (imgEl.src.indexOf('http') !== 0) {
          callback(imgEl.src);
      }
    }
  }

  Justpaste.prototype.upload = function(base64) {
    this.onBeforeUpload();
    var fd = new FormData();
    fd.append('image', base64);
    fetch('https://api.imgur.com/3/image', {
      method: 'post',
      headers: {
        Authorization: 'Client-ID e83ef0f75467fbf'
      },
      body: fd
    }).then(function(resp) {
      return resp.json();
    }).then((function(json) {
      var url = json.data.link;
      this.onUploadDone(url);
    }).bind(this));
  }

  Justpaste.prototype.onBeforeUpload = function() {
    this.ui.showProgressBar();
    this.ui.showImageCard(false);
  }

  Justpaste.prototype.onUploadDone = function(url) {
    this.ui.setURL(url);
    this.ui.showProgressBar(false);
    this.ui.showImageCard();
    this.ui.selectURL();
  }

  new Justpaste().init();
})();
