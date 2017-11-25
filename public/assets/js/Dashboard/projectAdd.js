var projectAdd = {};
    projectAdd.$modal = $("#modal-add-project");
    projectAdd.$projectName = projectAdd.$modal.find("#project-name-add");
    projectAdd.$colorSelect = projectAdd.$modal.find("#color-select-add");
    projectAdd.$saveNewProject = projectAdd.$modal.find('[data-function="save-new-project"]');

    projectAdd.initView = function(){
        projectAdd.clearData();

        projectAdd.$saveNewProject.off('click').click(projectAdd.addProject);
        projectAdd.$modal.modal('show');
    };

    projectAdd.clearData = function(){

    };

    projectAdd.addProject = function(){
        $.ajax({
            type     : "POST",
            url      : "/projectAdd",
            data     : {
                name : projectAdd.$projectName.val(),
                color : projectAdd.$colorSelect.val(),
                status : 'active'
            },
            success: function(ret) {
                console.log(ret);
                dashboardVC.appendProject(ret.data);
                projectAdd.clearData();
                projectAdd.$modal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at projectAdd()");
            }
        });
    };
