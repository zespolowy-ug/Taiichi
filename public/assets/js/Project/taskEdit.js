var taskEdit = {};
    taskEdit.$modal = $("#modal-edit-task");
    taskEdit.$taskNameHeader = taskEdit.$modal.find("#head-task-name-edit");
    taskEdit.$taskName = taskEdit.$modal.find("#task-name-edit");
    taskEdit.$taskDescription = taskEdit.$modal.find("#task-description-edit");
    taskEdit.$commentList = taskEdit.$modal.find("#comment-list");
    taskEdit.$newComment = taskEdit.$modal.find("#task-comment-content");
    taskEdit.$addCommentButton = taskEdit.$modal.find("#task-comment-add");
    taskEdit.$saveTaskButton = taskEdit.$modal.find('[data-function="save-task"]');
    taskEdit.$taskFileButton = taskEdit.$modal.find("#task-file-add");
    taskEdit.$taskFileInput = taskEdit.$modal.find('#task-edit-fileInput');
    taskEdit.$taskFilesList = [];
    taskEdit.$taskFilesTable = taskEdit.$modal.find('#task-edit-filesTable');

    taskEdit.taskId = null;

    taskEdit.initView = function(taskId) {
        taskEdit.taskId = taskId;
        taskEdit.loadData(taskId);
        taskEdit.loadComments(taskId);
        taskEdit.$addCommentButton.off('click').click(function() {
            if (taskEdit.$newComment.val() != "") taskEdit.addComment(taskId);
        });
        taskEdit.$saveTaskButton.off('click').click(function() {
            taskEdit.editTask(taskId);
        });
        // taskEdit.$taskFileInput.change(function() {
        //     taskEdit.$taskFilesList.push(taskEdit.$taskFileInput.prop('files')[0]);
        //     taskEdit.$taskFilesTable.html("");
        //     $.each(taskEdit.$taskFilesList, function(i, file) {
        //         taskEdit.$taskFilesTable.append('<tr><td>'+file.name+'</td><td><button type="button" class="btn btn-primary fileDownload" data-function="save-task">Pobierz</button></td></tr>');
        //     });
        // });

        taskEdit.$taskFileInput.off('change').change(taskEdit.onFileUpload);
        taskEdit.$taskFileButton.off('click').click(function(){
            taskEdit.$taskFileInput.click();
        })

    };

    taskEdit.onFileUpload = function(){
        var files = $(this).get(0).files;

        if (files.length > 0){
            var formData = new FormData();
                formData.append(taskEdit.taskId, new Blob([JSON.stringify({

                })], {
                    type: "application/json"
                }));

            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              formData.append('uploads[]', file, file.name);
            }

            $.ajax({
              url: '/uploadTaskFile',
              type: 'POST',
              data: formData,
              processData: false,
              contentType: false,
              success: function(data){
                  console.log("success loading files");
              },
              complete: function(data){
                  taskEdit.loadFiles(taskEdit.taskId);
              }
            });
        }
    };

    taskEdit.loadFiles = function(taskId){
        $.ajax({
            type: "POST",
            url: "/taskFiles",
            data: {
                taskId: taskId
            },
            success: function(ret) {
                taskEdit.$taskFilesTable.html("");

                $.each(ret.data, function(index, taskFile){
                    taskEdit.appendTaskFile(taskFile);
                });
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    taskEdit.appendTaskFile = function(fileData){
        var $taskFile = $('<tr><td data-function="file-name"></td><td><button type="button" class="btn btn-primary fileDownload" data-function="save-task">Pobierz</button></td></tr>');
            $taskFile.find('[data-function="file-name"]').text(fileData.original_name);
            $taskFile.find("button").attr('data-file-id', fileData.file_id);
            $taskFile.find("button").off('click').click(taskEdit.downloadTaskFile);
        taskEdit.$taskFilesTable.append($taskFile);
    }

    taskEdit.downloadTaskFile = function(){
        var $clickedItem = $(this);
        var fileId = $clickedItem.attr('data-file-id');

        $.ajax({
            type: "GET",
            url: "/downloadTaskFile",
            // data: {
            //     fileId: fileId
            // },
            success: function(ret) {

            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    taskEdit.loadData = function(taskId) {
        $.ajax({
            type: "POST",
            url: "/taskData",
            data: {
                taskId: taskId
            },
            success: function(ret) {
                taskEdit.$taskNameHeader.text(ret.data.name);
                taskEdit.$taskName.val(ret.data.name);
                taskEdit.$taskDescription.val(ret.data.description);

                taskEdit.$taskFilesTable.html("");

                $.each(ret.data.tasks_files, function(index, taskFile){
                    taskEdit.appendTaskFile(taskFile);
                })

                taskEdit.$modal.modal('show');
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    taskEdit.loadComments = function(taskId) { //todo creator_user_id odczytac obiekt User
        $.ajax({
            type: "POST",
            url: "/taskComments",
            data: {
                taskId: taskId
            },
            success: function(ret) {
                taskEdit.$commentList.text("");
                $.each(ret.data, function(index, comment) {
                    taskEdit.appendComment(comment);
                });
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    taskEdit.addComment = function(taskId) {
        $.ajax({
            type: "POST",
            url: "/addTaskComment",
            data: {
                taskId: taskId,
                content: taskEdit.$newComment.val()
            },
            success: function(ret) {
                taskEdit.$newComment.val("");
                taskEdit.appendComment(ret.data);
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    taskEdit.editTask = function(taskId) {
        $.ajax({
            type: "POST",
            url: "/taskEdit",
            data: {
                taskId: taskId,
                taskName: taskEdit.$taskName.val(),
                taskDescription: taskEdit.$taskDescription.val()
            },
            success: function(ret) {
                taskEdit.updateTaskData(ret.data);
                taskEdit.$modal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at editTask()");
            }
        });
    };

    taskEdit.updateTaskData = function(taskData) {
        var $editedTask = $('.task[data-task-id="' + taskData.task_id + '"]');
        $editedTask.find('[data-function="task-name"]').text(taskData.name);
        $editedTask.find('[data-function="task-description"]').text(taskData.description);
    };

    taskEdit.appendComment = function(commentData) {
        var $commentItem = $(taskEdit.commentTpl);
            $commentItem.find(".comment-content").text(commentData.content);
            $commentItem.find(".comment-user").text(commentData.creator_firstname + " " + commentData.creator_lastname);
            $commentItem.find(".comment-date").text(moment(commentData.createdAt).locale("pl").local().calendar());

        taskEdit.$commentList.prepend($commentItem);
    };

    taskEdit.commentTpl = [
        '<li>',
        '   <div class="comment-content"></div>',
        '   <div class="comment-details">',
        '        <span class="comment-user"></span>',
        '        <span class="comment-date"></span>',
        '    </div>',
        '</li>'
    ].join("\n");
