var taskEdit = {};
    taskEdit.$modal = $("#modal-edit-task");
    taskEdit.$taskNameHeader = taskEdit.$modal.find("#head-task-name-edit");
    taskEdit.$taskName = taskEdit.$modal.find("#task-name-edit");
    taskEdit.$taskDescription = taskEdit.$modal.find("#task-description-edit");
    taskEdit.$commentList = taskEdit.$modal.find("#comment-list");
    taskEdit.$newComment = taskEdit.$modal.find("#task-comment-content");
    taskEdit.$addCommentButton = taskEdit.$modal.find("#task-comment-add");
    taskEdit.$saveTaskButton = taskEdit.$modal.find('[data-function="save-task"]');

    taskEdit.initView = function(taskId) {
        taskEdit.loadData(taskId);
        taskEdit.loadComments(taskId);
        taskEdit.$addCommentButton.off('click').click(function() {
            if (taskEdit.$newComment.val() != "") taskEdit.addComment(taskId);
        });
        taskEdit.$saveTaskButton.off('click').click(function() {
            taskEdit.editTask(taskId);
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
            url: "/addComment",
            data: {
                taskId: taskId,
                content: taskEdit.$newComment.val(),
                creator_user_id: "1"
            },
            success: function(ret) {
                taskEdit.$newComment.val("");
                // taskEdit.loadComments(taskId);
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
            $commentItem.find(".comment-user").text(commentData.creator_user_id);
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
