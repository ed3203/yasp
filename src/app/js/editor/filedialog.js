if (typeof yasp == 'undefined') yasp = { };
if (typeof yasp.Storage == 'undefined') yasp.Storage = localStorage || { };

(function() {
  yasp.ServerURL = "http://localhost:8000/file.php";
  
  yasp.FileDialogMode = {
    OPEN: 1,
    SAVE: 2,
    SAVEAS: 3,
    NEW: 4
  };

  if (typeof yasp.Storage.files == 'undefined') yasp.Storage.files = JSON.stringify({ });
  
  var fileSystemDriver = {
    LOCAL: {
      newFile: function(name, cb) {
        var files = JSON.parse(yasp.Storage.files);
        
        var file, err;
        if (!!files[name] || name.length == 0) {
          // file exists
          file = null;
        } else {
          // create file
          file = (files[name] = {
            filename: name,
            username: "local",
            createdate: new Date().getTime(),
            group: "local",
            changedate: new Date().getTime(),
            content: ""
          });
          yasp.Storage.files = JSON.stringify(files);
        }
        setTimeout(function() {
          cb(file, 0);
        });
      },
      requestList: function(cb) {
        setTimeout(function() {
          cb(JSON.parse(yasp.Storage.files));
        }, 0);
      },
      deleteFile: function(name, cb) {
        var files = JSON.parse(yasp.Storage.files);
        if (files[name]) {
          delete files[name]; // delete it bitch
        }
        yasp.Storage.files = JSON.stringify(files);
        setTimeout(function() {
          cb(true);
        });
      },
      renameFile: function(oldname, newname, cb) {
        var files = JSON.parse(yasp.Storage.files);
        if (files[oldname]) {
          // save old \o/
          var old = files[oldname];
          
          // delete old \o/
          delete files[oldname];
          
          // create new \o/
          old.filename = newname;
          files[newname] = old;
        }
        yasp.Storage.files = JSON.stringify(files);
        
        setTimeout(function() {
          cb(true);
        })
      }
    },
    SERVER: {
      newFile: function(name, cb) {
        // TODO
      },
      requestList: function(cb) {
        // TODO
      },
      deleteFile: function(name, cb) {
        // TODO
      },
      renameFile: function(oldname, newname, cb) {
        // ToDO
      }
    }
  };
  var fileSystem = fileSystemDriver.LOCAL;
  var dialogMode;
  var dialogFiles;
  yasp.FileDialog = {
    show: function(mode) {
      dialogMode = mode;
      $('#dialog_file').modal({
        'keyboard': true
      });
      $('#dialog_file .open, #dialog_file .save, #dialog_file .saveas, #dialog_file .new').hide();
      
      var updateFunc;
      $('#dialog_file a[data-toggle="tab"]').on('shown.bs.tab', updateFunc = function (e) {
        $('#dialog_file .filelist tbody').html("");
        
        var tab = $(!!e ? e.target : '#dialog_file .active');
        if (tab.hasClass('link_server')) fileSystem = fileSystemDriver.SERVER;
        if (tab.hasClass('link_local')) fileSystem = fileSystemDriver.LOCAL;
        
        fileSystem.requestList(function(files) {
          var table = $('#dialog_file .filelist tbody');
          // create array to sort them
          var data = [ ];
          $.each(files, function(i, row) {
            data.push(row);
          });
          data.sort(function(a, b) {
            return a.changedate < b.changedate ? -1 : (a.changedate > b.changedate ? 1 : 0);
          });
          
          // now display
          $.each(data, function(i, row) {
            var elem = $('<tr>')
              .append($('<td class="filedialog_name">').text(row.filename))
              .append($('<td>').html('<button type="button" class="btn btn-default btn-xs filedialog_remove"><span class="glyphicon glyphicon-remove"></span></button><button type="button" class="btn btn-default btn-xs filedialog_open"><span class="glyphicon glyphicon-open"></span></button>'))
              .appendTo(table);
            
            elem.find('.filedialog_remove').click(function() {
              // TODO: show alert

              fileSystem.deleteFile(row.filename, function() {
                updateFunc();
              });
            });
            
            elem.find('.filedialog_name').dblclick(function() {
              var elem = $(this)
                .text("")
                .append('<form><input type="text" class="form-control" value="'+row.filename+'"/></form>');
              
              elem.find('input').select();
              elem.find('form').submit(function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                
                var elem = $(this), newtext;
                fileSystem.renameFile(row.filename, newtext = elem.find('input').val(), function() {
                  elem.text(newtext);
                });
                
                return false;
              });
            });
          });
        });
      });
      
      var visible;
      switch (mode) {
        case yasp.FileDialogMode.OPEN:
          visible = "open";
          break;
        case yasp.FileDialogMode.SAVE:
          visible = "save";
          break;
        case yasp.FileDialogMode.SAVEAS:
          visible = "saveas";
          break;
        case yasp.FileDialogMode.NEW:
          visible = "new";
          break;
      }
      
      $('#dialog_file .'+visible).show();
      
      $('#filedialog_open').click(function() {
        
      });
      $('#filedialog_save').click(function() {

      });
      $('#filedialog_saveas').click(function() {

      });
      $('#filedialog_new').click(function() {
        fileSystem.newFile($('#filedialog_name').val(), function(file) {
          if (!!file) {
            // success
            yasp.EditorManager.applyFile(file);
          } else {
            // error
            // TODO: implement visible error message
          }
        });
      });
      
      updateFunc();
    },
    close: function() {
      
    }
  };
})();