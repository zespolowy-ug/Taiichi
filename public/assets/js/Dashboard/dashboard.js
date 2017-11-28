var dashboardVC = {};
    dashboardVC.$projectsList = $(".tables-list__content");
    dashboardVC.projectsList = [];
    dashboardVC.$confirmDeleteModal = $("#modal-confirm-delete");


    dashboardVC.initView = function(){
        dashboardVC.getProjects();
       
    };


    dashboardVC.getProjects = function(){
        $.ajax({
            type     : "POST",
            url      : "/projectsList",  //TODO url
            data     : {
            },
            success: function(ret) {  //TODO
                dashboardVC.appendData(ret);
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at getAllProjectsForUser()");
            }
        });
    };

    dashboardVC.appendData = function(data){
        dashboardVC.appendUserData(data.data);
        dashboardVC.appendProjects(data.data.users_to_projects);
    };

    dashboardVC.appendUserData = function(data){
        var userEmail = data.email;
        $('#userDropdown').html(userEmail);
    };

    dashboardVC.appendProjects = function(projectsData){
        dashboardVC.$projectsList.html("");

        var $addButton = $(dashboardVC.projectAddButton);
            $addButton.off('click').click(projectAdd.initView);
        dashboardVC.$projectsList.append($addButton);

        $.each(projectsData, function(index, projectData){
            dashboardVC.appendProject(projectData.project);
        });



    };

    dashboardVC.appendProject = function(projectData){
        var $projectItem = $(dashboardVC.projectTemplate);
            $projectItem.attr('data-project-id', projectData.project_id);
            $projectItem.find(".table-item__name").text(projectData.name);
            $projectItem.attr('href', '/project/' + projectData.project_id);
            $projectItem.addClass("table-item--" + projectData.color);

            $projectItem.find("button").off('click').click(dashboardVC.showSettingsDropdown);

            $projectItem.insertBefore(dashboardVC.$projectsList.find('[data-function="project-add-button"]'));
    };

    dashboardVC.showSettingsDropdown = function(e){
        e.preventDefault();
        e.stopPropagation();
        var clickedElement = $(this);
        var projectId = clickedElement.parents(".table-item").attr('data-project-id');
        var $settingsDropdown = $(dashboardVC.settingsDropdownTemplate);
            $settingsDropdown.css({
                left: clickedElement.offset().left - 90,
                top: clickedElement.offset().top + 22
            });

        $settingsDropdown.find('[data-function="project-edit"]').off('click').click(function(){
            $('.custom-dropdown').remove();
            $(document).off('click.customDropdown');
            projectEdit.initView(projectId);
        });
        $settingsDropdown.find('[data-function="project-delete"]').off('click').click(function(){
            $('.custom-dropdown').remove();
            $(document).off('click.customDropdown');
            dashboardVC.onDeleteProjectClick(projectId);
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

    dashboardVC.onDeleteProjectClick = function(projectId){
        dashboardVC.$confirmDeleteModal.find('[data-function="confirm-delete-button"]').off('click').click(function(){
            dashboardVC.deleteProject(projectId);
        });
        dashboardVC.$confirmDeleteModal.modal('show');
    };

    dashboardVC.deleteProject = function(projectId){
        $.ajax({
            type     : "POST",
            url      : "/projectDelete",
            data     : {
                projectId : projectId
            },
            success: function(ret) {
                var $deletedProject = $('.table-item[data-project-id="'+ projectId +'"]');
                    $deletedProject.remove();
                    dashboardVC.$confirmDeleteModal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at getAllProjectsForUser()");
            }
        });
    };

    dashboardVC.projectTemplate = [
        '<a class="table-item">',
        '    <div class="table-item__name"></div>',
        '    <button class="fa fa-cog table-item__settings-menu"></button>',
        '</a>'
    ].join("\n");

    dashboardVC.settingsDropdownTemplate = [
        '<div class="custom-dropdown">',
        '   <div class="custom-dropdown__item" data-function="project-edit">Edytuj</div>',
        '   <div class="custom-dropdown__item" data-function="project-delete">Usuń</div>',
        '</div>',
    ].join("\n");

    dashboardVC.projectAddButton = [
        '<div class="table-item" data-function="project-add-button">',
        '    <div class="table-item__plus">+</div>',
        '</div>',
    ].join("\n");

    dashboardVC.initView();
