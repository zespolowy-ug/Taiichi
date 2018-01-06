var taskAdd = {};
    taskAdd.$modal = $("#modal-add-task");
    taskAdd.$taskName = taskAdd.$modal.find("#task-name-add");
    taskAdd.$taskDescription = taskAdd.$modal.find("#task-description-add");
    taskAdd.$saveTaskButton = taskAdd.$modal.find('[data-function="save-new-task"]');

    taskAdd.initView = function(boardId){
        taskAdd.clearData();
        taskAdd.$saveTaskButton.off('click').click(function(){
            taskAdd.addTask(boardId);
        });

        taskAdd.$modal.modal('show');

    };

    taskAdd.clearData = function(){
        $("#task-name-add").val("");
        $("#task-description-add").val("");

    };

    taskAdd.addTask = function(boardId){
        $.ajax({
            type: "POST",
            url: "/taskAdd",
            data: {
                taskName : taskAdd.$taskName.val(),
                taskDescription : taskAdd.$taskDescription.val(),
                boardId : boardId
            },
            success: function(ret){
                taskAdd.appendNewTask(ret.data);
                taskAdd.$modal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    taskAdd.appendNewTask = function(taskData){
        var $boardItem = $('.card-custom[data-board-id="'+ taskData.boardBoardId +'"]');
        var $taskItem = $(projectVC.taskTemplate);
            $taskItem.off('dblclick').dblclick(function(){
                taskEdit.initView(taskData.task_id);
            });
            $taskItem.attr('data-task-id', taskData.task_id);
            $taskItem.find('[data-function="task-name"]').text(taskData.name);
            $taskItem.find('[data-function="task-description"]').text(taskData.description);

            $taskItem.droppable({
                drop: function(event, ui){
                    var userId = $(ui.draggable).attr('data-user-id');
                    var $userItem = $(ui.draggable).clone();

                    $(".ui-draggable-dragging").remove();

                    $.ajax({
                        type     : "POST",
                        url      : "/addUserToTask",
                        data     : {
                            userId : userId,
                            taskId : taskData.task_id
                        },
                        success: function(ret) {
                            $('[data-task-id="'+ taskData.task_id +'"]').find(".task-users").append($userItem);
                        },
                        error: function(jqXHR, errorText, errorThrown) {
                          console.log("Error occured at addUserToTask()");
                        }
                    });
                }
            });

            $boardItem.find(".tasks-list").append($taskItem);
    };
