var UIHandler = function() {

  UIHandler = function() {
    this.img = document.querySelector('#img');
    this.urlField = document.querySelector('#image-url');
    this.copyBtn = document.querySelector('#copy-btn');
    this.progress = document.querySelector('#progress-bar');
    this.imgCard = document.querySelector('#img-card');
    this.init();
  }

  UIHandler.prototype.init = function() {
    this.copyBtn.disabled = !document.queryCommandSupported('copy');
    this.registerEvents();
  };

  UIHandler.prototype.registerEvents = function() {
    this.copyBtn.addEventListener('click', this.copyHandler.bind(this));
  };

  UIHandler.prototype.copyHandler = function(e) {
    this.selectURL();
    try {
      document.execCommand('copy');
    } catch(e) {
      console.log('Failed to copy url');
    }
  };

  UIHandler.prototype.selectURL = function() {
    this.urlField.select();
    this.urlField.focus();
  }

  UIHandler.prototype.setImage = function(url) {
    this.img.style.backgroundImage = 'url(' +　url + ')';
  }

  UIHandler.prototype.setURL = function(url) {
    this.urlField.value = url;
  }

  UIHandler.prototype.showProgressBar = function(visable) {
    this.progress.style.display = visable === false ? 'none' : 'block';
  }

  UIHandler.prototype.showImageCard = function(visable) {
    this.imgCard.style.display = visable === false ? 'none' : 'block';
  };

  return UIHandler;
}();
