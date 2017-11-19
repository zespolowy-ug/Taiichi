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

        $.each(projectsData, function(index, projectData){
            dashboardVC.appendProject(projectData);
        });
    };

    dashboardVC.appendProject = function(projectData){
        var $projectItem = $(dashboardVC.projectTemplate);
            $projectItem.find(".table-item__name").text(projectData.project.name);
            $projectItem.attr('href', '/project/' + projectData.project.project_id);
            $projectItem.addClass("table-item--" + projectData.project.color);

            dashboardVC.$projectsList.append($projectItem);
    };

    dashboardVC.projectTemplate = [
        '<a href="/project" class="table-item">',
        '    <div class="table-item__name"></div>',
        '</a>',
    ].join("\n");

    dashboardVC.initView();
