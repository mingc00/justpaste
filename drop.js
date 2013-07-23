function onDrop(e) {
  var files = e.originalEvent.dataTransfer.files;
  readAndUpload(files);
  $(this).removeClass('dropable-active').hide();

  e.stopPropagation();
  e.preventDefault();
}

$('#drop-zone').on('dragover', function(e) {
  $(this).addClass('dropable-active');
  e.stopPropagation();
  e.preventDefault();
}).on('drop', onDrop);

$('body').on('dragenter', function(e) {
  $('#drop-zone').show();
});
