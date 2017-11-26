var projectVC = {};
    projectVC.$projectIdInput = $('[data-function="projectId"]');
    projectVC.$boardsList = $(".main-container").find(".scroll-y-container");
    projectVC.$confirmDeleteModal = $("#modal-confirm-delete");

    projectVC.initView = function() {
        $(".scroll-y-container").sortable({
            handle: ".card-custom-title",
            axis: "x"
        });


        projectVC.getProjectDetails();
    };

    projectVC.getProjectDetails = function() {
        $.ajax({
            type: "POST",
            url: "/projectDetails",
            data: {
                projectId: projectVC.$projectIdInput.val()
            },
            success: function(ret) {
                projectVC.appendBoards(ret.data.boards);
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    projectVC.appendBoards = function(boardsData) {
        projectVC.$boardsList.html("");

        var $addBoardButton = $(projectVC.addBoardButton);
            $addBoardButton.find(".add-board__plus").off('click').click(boardAdd.initView);
            projectVC.$boardsList.append($addBoardButton);


        $.each(boardsData, function(index, boardData) {
            projectVC.appendBoard(boardData);
        });
    };

    projectVC.appendBoard = function(boardData){
        var $boardItem = $(projectVC.boardTemplate);
            $boardItem.attr('data-board-id', boardData.board_id);
            $boardItem.find('[data-function="card-title"]').text(boardData.name);
            $boardItem.find(".tasks-list").sortable({
                connectWith: "ul.tasks-list",
                dropOnEmpty: true
            });
        $.each(boardData.tasks, function(index, taskItem) {
            var $taskItem = $(projectVC.taskTemplate);
            $taskItem.off('dblclick').dblclick(function(){
                taskEdit.initView(taskItem.task_id);
            });
            $taskItem.attr('data-task-id', taskItem.task_id);
            $taskItem.find('[data-function="task-name"]').text(taskItem.name);
            $taskItem.find('[data-function="task-description"]').text(taskItem.description);

            $boardItem.find(".tasks-list").append($taskItem);
        });

        $boardItem.find(".card-custom__settings-menu").off('click').click(projectVC.showSettingsDropdown);
        $boardItem.find('[data-function="button-add-task"]').off('click').click(function(){
            taskAdd.initView(boardData.board_id);
        });

        $boardItem.insertBefore(projectVC.$boardsList.find('[data-function="add-board-button"]'));
    };

    projectVC.showSettingsDropdown = function(e){
        e.preventDefault();
        e.stopPropagation();
        var clickedElement = $(this);
        var boardId = clickedElement.parents(".card-custom").attr('data-board-id');
        var $settingsDropdown = $(projectVC.settingsDropdownTemplate);
            $settingsDropdown.css({
                left: clickedElement.offset().left - 90,
                top: clickedElement.offset().top + 22
            });

        $settingsDropdown.find('[data-function="board-edit"]').off('click').click(function(){
            $('.custom-dropdown').remove();
            $(document).off('click.customDropdown');
            boardEdit.initView(boardId);
        });
        $settingsDropdown.find('[data-function="board-delete"]').off('click').click(function(){
            $('.custom-dropdown').remove();
            $(document).off('click.customDropdown');
            projectVC.onDeleteBoardClick(boardId);
        });

        $(document).off('click.customDropdown').on('click.customDropdown',function(event) {
            if(!$(event.target).closest('.custom-dropdown').length) {
                if($('.custom-dropdown').is(":visible")) {
                    $('.custom-dropdown').remove();
                    $(document).off('click.customDropdown');
                }
            }
        });

        $("body").append($settingsDropdown);

    };

    projectVC.onDeleteBoardClick = function(boardId){
        projectVC.$confirmDeleteModal.find('[data-function="confirm-delete-button"]').off('click').click(function(){
            projectVC.deleteBoard(boardId);
        });
        projectVC.$confirmDeleteModal.modal('show');
    };

    projectVC.deleteBoard = function(boardId){
        $.ajax({
            type     : "POST",
            url      : "/boardDelete",
            data     : {
                boardId : boardId
            },
            success: function(ret) {
                var $deletedBoard = $('.card-custom[data-board-id="'+ boardId +'"]');
                    $deletedBoard.remove();
                    projectVC.$confirmDeleteModal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at getAllProjectsForUser()");
            }
        });
    };

    projectVC.addBoardButton = [
        '<div class="card-custom" data-function="add-board-button">',
        '   <div class="add-board">',
        '      <div class="add-board__header">Dodaj tablicę</div>',
        '      <div class="add-board__plus">+</div>',
        '   </div>',
        '</div>'
    ].join("\n");

    projectVC.boardTemplate = [
        '<div class="card-custom sortable">',
        '    <div class="card-custom-wrapper">',
        '		<div class="card-custom-title ui-sortable-handle">',
        '			<span data-function="card-title"></span>',
        '			<button class="fa fa-cog card-custom__settings-menu" type="button"></button>',
        '		</div>',
        '		<ul class="tasks-list ui-sortable">',
        '		</ul>',
        '		<button class="btn btn-outline-primary btn-sm button__add-task" data-function="button-add-task">Dodaj</button>',
        '    </div>',
        '</div>'
    ].join("\n");

    projectVC.taskTemplate = [
        '<li class="task ui-sortable-handle">',
        '	<h6 data-function="task-name"></h6>',
        '	<div data-function="task-description"></div>',
        '</li>'
    ].join("\n");

    projectVC.settingsDropdownTemplate = [
        '<div class="custom-dropdown">',
        '   <div class="custom-dropdown__item" data-function="board-edit">Edytuj</div>',
        '   <div class="custom-dropdown__item" data-function="board-delete">Usuń</div>',
        '</div>',
    ].join("\n");

    projectVC.initView();
