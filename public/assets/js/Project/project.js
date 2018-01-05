var projectVC = {};
    projectVC.$projectIdInput = $('[data-function="projectId"]');
    projectVC.$boardsList = $(".main-container").find(".scroll-y-container");
    projectVC.$confirmDeleteModal = $("#modal-confirm-delete");

    projectVC.$projectsNotificationsButton = $(".button-notifications");
    projectVC.$projectsSettingsButton = $(".button-settings");
    projectVC.$projectsChatButton = $(".button-chat");

    projectVC.$projectsNotificationsTab = $(".notifications-tab");
    projectVC.$projectsSettingsTab = $(".settings-tab");
    projectVC.$projectsChatTab = $(".chat-tab");

    projectVC.$projectsSettingsContainer = $(".settings-tab");
    projectVC.$projectsUsersList = $('[data-function="project-users-list"]');
    projectVC.$chatSendButton= $('#chat-tab-sendbutton');
    projectVC.socket = null;
    projectVC.userData = null;
    projectVC.projectUsersList = [];

    projectVC.initView = function() {
        projectVC.projectUsersList = [];
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
                        boardsOrder : cardsOrder,
                        projectId : projectVC.$projectIdInput.val()
                    },
                    success: function(ret) {

                    },
                    error: function(jqXHR, errorText, errorThrown) {
                        console.log("Error occured at boardSetOrder()");
                    }
                });
            }
        });

        projectVC.initSockets();
        projectVC.initInvitations();
        projectVC.getUserData();
        projectVC.getProjectDetails();

        projectVC.$projectsNotificationsButton.off('click').click(projectVC.toggleNotificationsView);
        projectVC.$projectsSettingsButton.off('click').click(projectVC.toggleSettingsView);
        projectVC.$projectsChatButton.off('click').click(projectVC.toggleChatView);
        projectVC.$chatSendButton.off('click').click(projectVC.sendMessage);
        $("#chat-tab-messageInput").keyup(function(event) {
            if (event.keyCode === 13) {
                projectVC.$chatSendButton.click();
            }
        });

        projectVC.$projectsChatTab.off('click').click(function(){
            projectVC.$projectsChatButton.removeClass("button-chat--effect");
        });

    };

    projectVC.initInvitations = function(){
         var typingTimer;

         $('[data-function="user-invite-input"]').off('keyup').on('keyup', function () {
             $(".custom-dropdown").remove();
             clearTimeout(typingTimer);
             typingTimer = setTimeout(projectVC.findUser, 1000);
         });

         $('[data-function="user-invite-input"]').off('keydown').on('keydown', function () {
             clearTimeout(typingTimer);
         });
     };

     projectVC.findUser = function(){
         if(!$('[data-function="user-invite-input"]').val()){
             return;
         }

        $.ajax({
            type: "POST",
             url: "/findUserToInvite",
             data: {
                 searchInput : $('[data-function="user-invite-input"]').val()
             },
             success: function(ret) {
                 projectVC.showUsersToInvite(ret.data);
             },
             error: function(jqXHR, errorText, errorThrown) {
                 console.log("Error occured at findUserToInvite()");
             }
         });
     };

     projectVC.showUsersToInvite = function(usersData){
         var $dropdown = $('<div class="custom-dropdown w-200"></div>');
         var $dropdownItem;
         if(usersData.length === 0){
             $dropdownItem = $('<div class="custom-dropdown__item custom-dropdown__item--notfound">Nie znaleziono użytkownika</div>');
             $dropdown.append($dropdownItem);
         }
         else{
             $.each(usersData, function(index, user){
                 console.log(user);
                 $dropdownItem = $('<div class="custom-dropdown__item custom-dropdown__item--user"></div>');
                 $dropdownItem.text(user.firstname.trim() + " " + user.lastname.trim());
                 $dropdownItem.attr('data-user-id', user.user_id);
                 $dropdownItem.off('click').on('click', projectVC.onUserAddClick);

                 $dropdown.append($dropdownItem);
             });
         }

         $dropdown.css({
             left: $('[data-function="user-invite-input"]').offset().left,
             top: $('[data-function="user-invite-input"]').offset().top + 36
         });

         $(document).off('click.customDropdown').on('click.customDropdown',function(event) {
             if(!$(event.target).closest('.custom-dropdown').length) {
                 if($('.custom-dropdown').is(":visible")) {
                     $('.custom-dropdown').remove();
                     $(document).off('click.customDropdown');
                 }
             }
         });

         $("body").append($dropdown);
     };

     projectVC.onUserAddClick = function(){
         var clickedElement = $(this);
         var userId = clickedElement.attr('data-user-id');

         $.ajax({
             type: "POST",
             url: "/addUserToProject",
             data: {
                 projectId: projectVC.$projectIdInput.val(),
                 userId: userId
             },
             success: function(ret) {
                 projectVC.appendUser(ret.data);
                 $(".custom-dropdown").remove();
                 $('[data-function="user-invite-input"]').val("");
             },
             error: function(jqXHR, errorText, errorThrown) {
               console.log("Error occured at projectDetails()");
            }
         });

     };

    projectVC.getUserData = function(){
        $.getJSON("/getUserData", function(data) {
            projectVC.userData = data;
            $('#userDropdown').text(data.firstname + ' ' + data.lastname);
            projectVC.loadChat(projectVC.$projectIdInput.val(),projectVC.userData.user_id);
            projectVC.loadNotifications(projectVC.$projectIdInput.val(),projectVC.userData.user_id);
        });
    }

    projectVC.initSockets = function(){
        var socket = projectVC.socket = io();

        socket.on('orderChanged', function(message){
            if(message.userId !== projectVC.userData.user_id && projectVC.$projectIdInput.val() === message.projectId){
                var $wrapper = $(".main-container .scroll-y-container");

                var elements = [];
                $.each(message.boardsOrder, function(i, boardObject) {
                    elements.push($wrapper.find('.card-custom.sortable[data-board-id="'+ boardObject.boardId +'"]')[0]);
                });
                $wrapper.prepend(elements);
            }
        });

        socket.on('newMessage', function(message){
          if(message.project_id === projectVC.$projectIdInput.val()){

              if(message.user_id === projectVC.userData.user_id){
                  $('.chat-tab__messages').prepend('<div class="chat-message"><div class="chat-message-content" style="float:right">'+message.message+'</div><br><span class="chat-message-user" style="text-align:right;width:100%">Ty<span class="chat-message-date">'+moment(message.updatedAt).locale("pl").local().calendar()+'</span></span></div>');
                  $('.chat-tab__messages').find(".chat-message:first").hide().show("fade",200);
              }else{
                var chatButton = $('.button-chat');
                if(!chatButton.hasClass("button-chat--effect")){
                    chatButton.addClass("button-chat--effect");
                }
                  $('.chat-tab__messages').prepend('<div class="chat-message"><div class="chat-message-content">'+message.message+'</div><br><span class="chat-message-user">'+message.firstname+' '+message.lastname+'<span class="chat-message-date">'+moment(message.updatedAt).locale("pl").local().calendar()+'</span></span></div>');
                  $('.chat-tab__messages').find(".chat-message:first").hide().show("fade",200);
              }
          }
        });

        socket.on('newNotification', function(message){
              var notificationsButton = $('.button-notifications');


              if(!notificationsButton.hasClass("button-notifications--effect")){
                  notificationsButton.addClass("button-notifications--effect");
              }
              $(".notifications-tab__container").prepend('<div style="padding:5px;display:inline-block;border-bottom:1px solid #e7e7e7;width:100%;font-size:12px;"><div style="font-size:11px;color: #d6d6d6;">'+moment(message.updatedAt).locale("pl").local().calendar()+'</div>'+message.notification.content+'</div>');
        });
    };

    projectVC.toggleNotificationsView = function(){
        var clickedButton = $(this);

        if(clickedButton.hasClass("button-notifications--selected")){
            clickedButton.removeClass("button-notifications--selected");
            $(".notifications-tab").removeClass("notifications-tab--expanded");
            $(".main-container").removeClass("main-container--collapsed");
        }
        else{
            clickedButton.addClass("button-notifications--selected");
            $(".notifications-tab").addClass("notifications-tab--expanded");
            $(".main-container").addClass("main-container--collapsed");
        }
        if(clickedButton.hasClass("button-notifications--effect")){
            clickedButton.removeClass("button-notifications--effect");
        }
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

    projectVC.toggleChatView = function(){
        var clickedButton = $(this);

        if(clickedButton.hasClass("button-chat--selected")){
            clickedButton.removeClass("button-chat--selected");
            $(".chat-tab").removeClass("chat-tab--expanded");
            $(".main-container").removeClass("main-container--collapsed");
        }
        else{
            clickedButton.addClass("button-chat--selected");
            $(".chat-tab").addClass("chat-tab--expanded");
            $(".main-container").addClass("main-container--collapsed");
        }
        if(clickedButton.hasClass("button-chat--effect")){
            clickedButton.removeClass("button-chat--effect");
        }
    };

    projectVC.sendMessage = function(){
        var message = $("#chat-tab-messageInput");
        if(message.val() !== ""){
            $.ajax({
                type: "POST",
                url: "/sendMessage",
                data: {
                    projectId: projectVC.$projectIdInput.val(),
                    message: message.val()
                },
                success: function(ret) {
                    message.val("");
                },
                error: function(jqXHR, errorText, errorThrown) {
                    console.log("Error occured at projectDetails()");
                }
            });
        }
    };

    projectVC.loadChat = function(project_id, user_id){
        $.ajax({
            type: "POST",
            url: "/loadChat",
            data: {
                project_id: project_id
            },
            success: function(ret) {
                    taskEdit.$commentList.text("");
                    $.each(ret.data, function(index, message) {
                        if(message.user_id === projectVC.userData.user_id){
                            $('.chat-tab__messages').prepend('<div class="chat-message"><div class="chat-message-content" style="float:right">'+message.message+'</div><br><span class="chat-message-user" style="text-align:right;width:100%">Ty<span class="chat-message-date">'+moment(message.updatedAt).locale("pl").local().calendar()+'</span></span></div>');
                        }else{
                            $('.chat-tab__messages').prepend('<div class="chat-message"><div class="chat-message-content">'+message.message+'</div><br><span class="chat-message-user">'+message.firstname+' '+message.lastname+'<span class="chat-message-date">'+moment(message.updatedAt).locale("pl").local().calendar()+'</span></span></div>');
                        }
                    });
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };

    projectVC.loadNotifications = function(project_id, user_id){
        $.ajax({
            type: "POST",
            url: "/loadNotifications",
            data: {
                project_id: project_id
            },
            success: function(ret) {
                    $(".notifications-tab__container").html("");
                    $.each(ret.data, function(index, message) {
                        $(".notifications-tab__container").prepend('<div style="padding:5px;display:inline-block;border-bottom:1px solid #e7e7e7;width:100%;font-size:12px;"><div style="font-size:11px;color: #d6d6d6;">'+moment(message.updatedAt).locale("pl").local().calendar()+'</div>'+message.content+'</div>');
                    });
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
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
            projectVC.projectUsersList.push(userToProject.user);
        });
    };

    projectVC.appendUser = function(userToProject){
        var $userItem = $(projectVC.userTemplate);
            $userItem.attr('data-user-id', userToProject.user_id);
            $userItem.text(userToProject.firstname.trim().substring(0,1).toUpperCase() + userToProject.lastname.trim().substring(0,1).toUpperCase());
            $userItem.tooltip({
                 placement: "bottom",
                 title: userToProject.firstname.trim() + " " + userToProject.lastname.trim()
             });

             $userItem.draggable({
                 revert: true,
                 helper: 'clone',
                 appendTo: 'body'
             })
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

            $taskItem.droppable({
                drop: function(event, ui){
                    console.log(ui.draggable);
                    var userId = $(ui.draggable).attr('data-user-id');

                    console.log(userId);
                }
            });

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
