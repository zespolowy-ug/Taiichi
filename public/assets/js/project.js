var projectVC = {};
    projectVC.$projectIdInput = $('[data-function="projectId"]');
    projectVC.$boardsList = $(".main-container").find(".scroll-y-container");

    projectVC.initView = function(){
        $(".scroll-y-container").sortable({
        handle: ".card-custom-title",
        axis: "x"
      });


        console.log(projectVC.$projectIdInput.val());

        projectVC.getProjectDetails();
    };

    projectVC.getProjectDetails = function(){
        $.ajax({
            type     : "POST",
            url      : "/projectDetails",
            data     : {
                projectId : projectVC.$projectIdInput.val()
            },
            success: function(ret) {
                projectVC.appendBoards(ret.data.boards);
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at projectDetails()");
            }
        });
    };

    projectVC.appendBoards = function(boardsData){
        projectVC.$boardsList.html("");

        $.each(boardsData, function(index, boardData){
            var $boardItem = $(projectVC.boardTemplate);
                $boardItem.find('[data-function="card-title"]').text(boardData.name);
                $boardItem.find(".tasks-list").sortable({
                    connectWith: "ul.tasks-list",
                    dropOnEmpty: true
                });
                $.each(boardData.tasks, function(index, taskItem){
                    var $taskItem = $(projectVC.taskTemplate);
                        $taskItem.find('[data-function="task-name"]').text(taskItem.name);
                        $taskItem.find('[data-function="task-description"]').text(taskItem.description);

                        console.log("TASK ITEM");
                        $boardItem.find(".tasks-list").append($taskItem);
                });

                projectVC.$boardsList.append($boardItem);
        });
    };

    projectVC.boardTemplate = [
        '<div class="card-custom sortable">',
        '    <div class="card-custom-wrapper">',
		'		<div class="card-custom-title ui-sortable-handle">',
		'			<span data-function="card-title">Section title</span>',
		'			<button class="btn btn-outline-secondary btn-sm" type="button">⨯</button>',
		'		</div>',
		'		<ul class="tasks-list ui-sortable">',

		'		</ul>',
		'		<button class="btn btn-outline-primary btn-sm button__add-task">Dodaj</button>',
        '    </div>',
		'</div>'
    ].join("\n");

    projectVC.taskTemplate = [
        '<li class="task ui-sortable-handle">',
		'	<h6 data-function="task-name"></h6>',
		'	<div data-function="task-description"></div>',
		'</li>'
    ].join("\n");

    projectVC.initView();
