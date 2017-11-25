var projectEdit = {};
    projectEdit.$modal = $("#modal-edit-project");
    projectEdit.$projectName = projectEdit.$modal.find("#project-name-edit");
    projectEdit.$colorSelect = projectEdit.$modal.find("#color-select-edit");
    projectEdit.$saveProject = projectEdit.$modal.find('[data-function="save-project"]');

    projectEdit.initView = function(projectId){

        projectEdit.loadData(projectId);

        projectEdit.$saveProject.off('click').click(function(){
            projectEdit.editProject(projectId);
        });

    };

    projectEdit.loadData = function(projectId){
        $.ajax({
            type     : "POST",
            url      : "/projectData",
            data     : {
                projectId : projectId
            },
            success: function(ret) {
                // projectVC.appendBoards(ret.data.boards);
                projectEdit.$projectName.val(ret.data.name);
                projectEdit.$colorSelect.find('option[value="'+ ret.data.color +'"]').prop('selected', true);
                projectEdit.$modal.modal('show');
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at projectDetails()");
            }
        });
    };

    projectEdit.editProject = function(projectId){
        $.ajax({
            type     : "POST",
            url      : "/projectEdit",
            data     : {
                projectId : projectId,
                projectName : projectEdit.$projectName.val(),
                projectColor : projectEdit.$colorSelect.val()
            },
            success: function(ret) {
                projectEdit.updateProjectData(ret.data);
                projectEdit.$modal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at editProject()");
            }
        });
    };

    projectEdit.updateProjectData = function(projectData){
        var $editedProject = $('.table-item[data-project-id="'+ projectData.project_id+'"]');
            $editedProject.find(".table-item__name").text(projectData.name);
            $editedProject.removeClass().addClass("table-item table-item--" + projectData.color);
    };
