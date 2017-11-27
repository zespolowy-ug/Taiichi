var taskEdit = {};
    taskEdit.$modal = $("#modal-edit-task");
    taskEdit.$taskNameHeader = taskEdit.$modal.find("#head-task-name-edit");
    taskEdit.$taskName = taskEdit.$modal.find("#task-name-edit");
    taskEdit.$taskDescription = taskEdit.$modal.find("#task-description-edit");
    taskEdit.$saveTaskButton = taskEdit.$modal.find('[data-function="save-task"]');

    taskEdit.initView = function(taskId){
        taskEdit.loadData(taskId);

        taskEdit.$saveTaskButton.off('click').click(function(){
            taskEdit.editTask(taskId);
        });
    };

    taskEdit.loadData = function(taskId){
        $.ajax({
            type     : "POST",
            url      : "/taskData",
            data     : {
                taskId : taskId
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

    taskEdit.editTask = function(taskId){
        $.ajax({
            type     : "POST",
            url      : "/taskEdit",
            data     : {
                taskId : taskId,
                taskName : taskEdit.$taskName.val(),
                taskDescription : taskEdit.$taskDescription.val()
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

    taskEdit.updateTaskData = function(taskData){
        var $editedTask = $('.task[data-task-id="'+ taskData.task_id+'"]');
            $editedTask.find('[data-function="task-name"]').text(taskData.name);
            $editedTask.find('[data-function="task-description"]').text(taskData.description);
    };
