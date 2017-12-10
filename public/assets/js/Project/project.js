var projectVC = {};
    projectVC.$projectIdInput = $('[data-function="projectId"]');
    projectVC.$boardsList = $(".main-container").find(".scroll-y-container");
    projectVC.$confirmDeleteModal = $("#modal-confirm-delete");
    projectVC.$projectsSettingsButton = $(".button-settings");
    projectVC.$projectsSettingsContainer = $(".settings-tab");
    projectVC.$projectsUsersList = $('[data-function="project-users-list"]');

    projectVC.initView = function() {
        $(".scroll-y-container").sortable({
            handle: ".card-custom-title",
            axis: "x",
            stop: function(event, ui){
                var cardsOrder = [];

                $(".card-custom.sortable").each(function(index, $cardItem){
                    cardsOrder.push({
                        boardId : $($cardItem).attr('data-board-id'),
                        boardIndex : index
                    });
                });

                $.ajax({
                    type: "POST",
                    url: "/boardSetOrder",
                    data: {
                        boardsOrder : cardsOrder
                    },
                    success: function(ret) {

                    },
                    error: function(jqXHR, errorText, errorThrown) {
                        console.log("Error occured at boardSetOrder()");
                    }
                });
            }
        });


        projectVC.getProjectDetails();
        projectVC.$projectsSettingsButton.off('click').click(projectVC.toggleSettingsView);
    };

    projectVC.toggleSettingsView = function(){
        var clickedButton = $(this);

        if(clickedButton.hasClass("button-settings--selected")){
            clickedButton.removeClass("button-settings--selected");
            $(".settings-tab").removeClass("settings-tab--expanded");
            $(".main-container").removeClass("main-container--collapsed");
        }
        else{
            clickedButton.addClass("button-settings--selected");
            $(".settings-tab").addClass("settings-tab--expanded");
            $(".main-container").addClass("main-container--collapsed");
        }
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
                projectVC.appendUsers(ret.data.users_to_projects);
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    projectVC.appendUsers = function(usersToProjects){
        projectVC.$projectsUsersList.html("");

        $.each(usersToProjects, function(index, userToProject){
            projectVC.appendUser(userToProject.user);
        });
    };

    projectVC.appendUser = function(userToProject){
        var $userItem = $(projectVC.userTemplate);
            $userItem.text(userToProject.firstname.trim().substring(0,1).toUpperCase() + userToProject.lastname.trim().substring(0,1).toUpperCase());
        projectVC.$projectsUsersList.append($userItem);
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

    var oldBoard;
    projectVC.appendBoard = function(boardData){
        var $boardItem = $(projectVC.boardTemplate);
            $boardItem.attr('data-board-id', boardData.board_id);
            $boardItem.find('[data-function="card-title"]').text(boardData.name);
            $boardItem.find(".tasks-list").sortable({
                start: function(event, ui){
                    oldBoard = ui.item[0].parentElement.parentElement.parentElement.getAttribute("data-board-id");
                },
                stop: function(event, ui){
                    var currentBoard = ui.item[0].parentElement.parentElement.parentElement.getAttribute("data-board-id");
                    var task = ui.item[0].getAttribute("data-task-id");
                    if(oldBoard !== currentBoard){
                        $.ajax({
                            type     : "POST",
                            url      : "/changeTaskBoard",
                            data     : {
                                taskId : task,
                                boardId : currentBoard,
                            },
                            error: function(jqXHR, errorText, errorThrown) {
                              console.log("Error occured at changeTaskBoard()");
                            }
                        });
                    }
                },
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
        '	<div data-function="task-description" class="cut-string"></div>',
        '</li>'
    ].join("\n");

    projectVC.settingsDropdownTemplate = [
        '<div class="custom-dropdown">',
        '   <div class="custom-dropdown__item" data-function="board-edit">Edytuj</div>',
        '   <div class="custom-dropdown__item" data-function="board-delete">Usuń</div>',
        '</div>',
    ].join("\n");

    projectVC.userTemplate = [
        '<div class="user-item">',
        '</div>'
    ].join("\n");

    projectVC.initView();
