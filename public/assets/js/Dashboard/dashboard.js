var dashboardVC = {};
    dashboardVC.$projectsList = $(".tables-list__content");
    dashboardVC.projectsList = [];


    dashboardVC.initView = function(){
        dashboardVC.getProjects();
    }

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
            $projectItem.find(".table-item__name").text(projectData.name);
            $projectItem.attr('href', '/project/' + projectData.project_id);
            $projectItem.addClass("table-item--" + projectData.color);

            $projectItem.find("button").attr('id', 'projectDropdown' + projectData.project_id);
            $projectItem.find(".dropdown-menu").attr('aria-labelledby', 'projectDropdown' + projectData.project_id);

            $projectItem.insertBefore(dashboardVC.$projectsList.find('[data-function="project-add-button"]'));
    };

    dashboardVC.projectTemplate = [
        '<a class="table-item">',
        '    <div class="table-item__name"></div>',
        '    <div class="dropdown">',
        '        <button class="fa fa-cog dropdown-toggle table-item__settings-menu" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>',
        '        <div class="dropdown-menu dropdown-menu-right">',
        '            <div>Edytuj</div>',
        '            <div>Usuń</div>',
        '        </div>',
        '    </div>',
        '</a>'
    ].join("\n");

    dashboardVC.projectAddButton = [
        '<div class="table-item" data-function="project-add-button">',
        '    <div class="table-item__plus">+</div>',
        '</div>',
    ].join("\n");

    dashboardVC.initView();
