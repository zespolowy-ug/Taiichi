var boardEdit = {};
    boardEdit.$modal = $("#modal-edit-board");
    boardEdit.$boardName = boardEdit.$modal.find("#board-name-edit");
    boardEdit.$saveButton = boardEdit.$modal.find('[data-function="save-board"]');

    boardEdit.initView = function(boardId){
        boardEdit.loadData(boardId);

        boardEdit.$saveButton.off('click').click(function(){
            boardEdit.editBoard(boardId);
        });
    };

    boardEdit.loadData = function(boardId){
        $.ajax({
            type     : "POST",
            url      : "/boardData",
            data     : {
                boardId : boardId
            },
            success: function(ret) {
                boardEdit.$boardName.val(ret.data.name);
                boardEdit.$modal.modal('show');
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at projectDetails()");
            }
        });
    }

    boardEdit.editBoard = function(boardId){
        $.ajax({
            type     : "POST",
            url      : "/boardEdit",
            data     : {
                boardId : boardId,
                boardName : boardEdit.$boardName.val(),
            },
            success: function(ret) {
                boardEdit.updateBoardData(ret.data);
                boardEdit.$modal.modal('hide');
            },
            error: function(jqXHR, errorText, errorThrown) {
              console.log("Error occured at editProject()");
            }
        });
    };

    boardEdit.updateBoardData = function(boardData){
        var $editedBoard = $('.card-custom[data-board-id="'+ boardData.board_id+'"]');
            $editedBoard.find('[data-function="card-title"]').text(boardData.name);
    };
