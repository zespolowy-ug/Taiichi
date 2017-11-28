var boardAdd = {};
    boardAdd.$modal = $("#modal-add-board");
    boardAdd.$boardName = boardAdd.$modal.find("#board-name-add");
    boardAdd.$saveButton = boardAdd.$modal.find('[data-function="save-new-board"]');

    boardAdd.initView = function(){

        boardAdd.clearData();
        boardAdd.$saveButton.off('click').click(boardAdd.saveNewBoard);
        boardAdd.$modal.modal('show');
    };

    boardAdd.clearData = function(){
        $("#board-name-add").val("");
    };

    boardAdd.saveNewBoard = function(){
        var boardName = boardAdd.$boardName.val();

        $.ajax({
            type: "POST",
            url: "/boardAdd",
            data: {
                boardName: boardName,
                projectId : projectVC.$projectIdInput.val()
            },
            success: function(ret){
                projectVC.appendBoard(ret.data);
                boardAdd.$modal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
                console.log("Error occured at projectDetails()");
            }
        });
    };
