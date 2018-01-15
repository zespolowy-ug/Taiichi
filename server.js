var express = require("express");
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var env = require('dotenv').load();
var exphbs = require('express-handlebars');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var formidable = require('formidable');
var fs = require('fs');
var qs = require('querystring');
var crypto = require('crypto');

inspect = require('util').inspect;
var Busboy = require('busboy');

var viewsPath = path.join(__dirname, 'app', 'views');
//For Handlebars
app.set('views', viewsPath);
//handlebars - view engine
app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: viewsPath + '/layouts/',
    partialsDir: viewsPath + '/partials/',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}));

io.on('connection', function(socket){
    console.log("user connected!");
});

app.set('view engine', '.hbs');

//For BodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// For Passport
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Models
var models = require("./app/models");

//Sync Database
models.sequelize.sync().then(function() {
    console.log('Nice! Database looks fine');
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!");
});

app.post('/projectsList', function(req, res) {
    var findUser = function() {
        return models.user.findOne({
            where: {
                user_id: req.user.user_id
            },
            include: [{
                model: models.users_to_projects,
                include: [{
                    model: models.project
                }]
            }]
        });
    }

    var projectsData = findUser().then(function(data) {

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/projectDetails', function(req, res) {
    var projectId = req.param("projectId");

    var findProject = function() {
        return models.project.findOne({
            where: {
                "project_id": parseInt(projectId)
            },
            include: [{
                model: models.board,
                include: [{
                    model: models.task,
                    include: [{
                        model: models.users_to_tasks,
                        include: [{
                            model: models.user
                        }]
                    }]
                }]
            },
            {
                model: models.users_to_projects,
                include: [{
                    model: models.user
                }]
            }],
            order: [
                [models.board, 'position', 'ASC']
            ]
        });
    }

    var projectData = findProject().then(function(data) {

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/projectData', function(req, res) {
    var projectId = req.param("projectId");

    var findProject = function() {
        return models.project.findOne({
            where: {
                "project_id": parseInt(projectId)
            }
        });
    }

    var projectData = findProject().then(function(data) {

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/projectAdd', function(req, res) {
    var projectName = req.param("name");
    var projectColor = req.param("color");

    var createProject = function() {
        return models.project.create({
            name: projectName,
            color: projectColor
        }).then(projectData => {
            models.users_to_projects.create({
                userUserId: req.user.user_id,
                projectProjectId: projectData.project_id
            });
            return projectData;
        });
    };

    var projectData = createProject().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/projectEdit', function(req, res) {
    var projectId = req.param("projectId");
    var projectName = req.param("projectName");
    var projectColor = req.param("projectColor");

    var updateProject = function() {
        return models.project.find({
            where: {
                project_id: projectId
            }
        }).then(projectItem => {
            projectItem.updateAttributes({
                name: projectName,
                color: projectColor
            })

            return projectItem;
        });
    };

    var projectData = updateProject().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/projectDelete', function(req, res) {
    var projectId = req.param("projectId");

    var deleteProject = function() {
        return models.users_to_projects.destroy({
            where: {
                projectProjectId: projectId
            }
        }).then(function(data) {
            models.project.destroy({
                where: {
                    project_id: projectId
                }
            })

            return data;
        });
    };

    var projectData = deleteProject().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/findUserToInvite', function(req, res) {
     var searchInput = req.body.searchInput;

    var findUsers = function(){
         return models.user.findAll({
             attributes: ['user_id', 'firstname', 'lastname', 'email'],
             where: {
                 [models.Sequelize.Op.or]: [
                     {
                         firstname: {
                             [models.Sequelize.Op.like]: '%' + searchInput + '%'
                         }
                     },
                     {
                         lastname: {
                             [models.Sequelize.Op.like]: '%' + searchInput + '%'
                         }
                     }
                 ]
             }
         });
     };


     var usersData = findUsers().then(function(data) {
         res.setHeader('Content-Type', 'application/json');

         res.send(JSON.stringify({
             data: data || null
         }));
     });
 });

 app.post('/addUserToProject', function(req, res) {
     var projectId = req.body.projectId;
     var userId = req.body.userId;

     var assignUser = function() {
         return models.users_to_projects.create({
             projectProjectId: projectId,
             userUserId: userId
         }).then(userToProjectData => {
             return models.user.findOne({
                 where: {
                     "user_id": parseInt(userId)
                 }
             });
         });
     };

     var userData = assignUser().then(function(data) {
         models.notifications.create({
             content: data.firstname + ' ' + data.lastname + " dołączył/a projektu",
             project_id: projectId
         }).then(notif => {
             io.emit("newNotification", {
                 notification: notif
             });
         });

         res.setHeader('Content-Type', 'application/json');

         res.send(JSON.stringify({
             data: data || null
         }));
     });
 });

app.post('/boardAdd', function(req, res) {
    var boardName = req.param("boardName");
    var projectId = req.param("projectId");
    var position = req.param("position");

    var createBoard = function() {
        return models.board.create({
            name: boardName,
            projectProjectId: projectId,
            position: position
        }).then(boardData => {
            return boardData;
        });
    };

    var boardData = createBoard().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/boardData', function(req, res) {
    var boardId = req.param("boardId");

    var findBoard = function() {
        return models.board.findOne({
            where: {
                "board_id": parseInt(boardId)
            }
        });
    }

    var boardData = findBoard().then(function(data) {

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/boardEdit', function(req, res) {
    var boardId = req.param("boardId");
    var boardName = req.param("boardName");

    var updateBoard = function() {
        return models.board.find({
            where: {
                board_id: boardId
            }
        }).then(boardItem => {
            boardItem.updateAttributes({
                name: boardName
            });

            return boardItem;
        });
    };

    var boardData = updateBoard().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/boardDelete', function(req, res) {
    var boardId = req.param("boardId");

    var deleteBoard = function() {
        return models.board.destroy({
            where: {
                board_id: boardId
            }
        });
        return data;
    };

    var projectData = deleteBoard().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post("/boardSetOrder", function(req, res) {
    var userId = req.user.user_id;
    var boardsOrder = req.body.boardsOrder;
    var projectId = req.body.projectId;

    for (var i = 0; i < boardsOrder.length; i++) {
        var position = boardsOrder[i].boardIndex;
        models.board.update({
            position: position
        }, {
            where: {
                board_id: boardsOrder[i].boardId
            }
        });
    }

    io.emit("orderChanged", {
        boardsOrder: boardsOrder,
        userId: userId,
        projectId: projectId
    });
});

app.post('/taskAdd', function(req, res) {
    var boardId = req.param("boardId");
    var taskName = req.param("taskName");
    var taskDescription = req.param("taskDescription");


    var createTask = function() {
        return models.task.create({
            name: taskName,
            description: taskDescription,
            boardBoardId: boardId
        }).then(taskData => {
            return taskData;
        });
    };

    var taskData = createTask().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/taskData', function(req, res) {
    var taskId = req.param("taskId");

    var findTask = function() {
        return models.task.findOne({
            where: {
                "task_id": parseInt(taskId)
            },
            include: [{
                model: models.tasks_files
            }]
        });
    }

    var taskData = findTask().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/taskComments', function(req, res) {
    var taskId = req.param("taskId");

    var findComments = function() {
        return models.tasks_comments.findAll({
            where: {
                "taskTaskId": parseInt(taskId)
            }
        });
    }

    var commentData = findComments().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/taskFiles', function(req, res) {
    var taskId = req.param("taskId");

    var findFiles = function() {
        return models.tasks_files.findAll({
            where: {
                "taskTaskId": parseInt(taskId)
            }
        });
    }

    var fileData = findFiles().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/taskEdit', function(req, res) {
    var taskId = req.param("taskId");
    var taskName = req.param("taskName");
    var taskDescription = req.param("taskDescription");

    var updateTask = function() {
        return models.task.find({
            where: {
                task_id: taskId
            }
        }).then(taskItem => {
            taskItem.updateAttributes({
                name: taskName,
                description: taskDescription
            })

            return taskItem;
        });
    };

    var taskData = updateTask().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/changeTaskBoard', function(req, res) {
    var taskId = req.param("taskId");
    var boardId = req.param("boardId");

    var updateTask = function() {
        return models.task.find({
            where: {
                task_id: taskId
            }
        }).then(taskItem => {
            taskItem.updateAttributes({
                boardBoardId: boardId
            })

            return taskItem;
        });
    };

    var taskData = updateTask().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/addTaskComment', function(req, res) {
    var taskId = req.param("taskId");
    var content = req.param("content");

    var createComment = function() {
        return models.tasks_comments.create({
            content: content,
            taskTaskId: taskId,
            creator_id : req.user.user_id,
            creator_firstname : req.user.firstname,
            creator_lastname : req.user.lastname
        }).then(commentData => {
            return commentData;
        });
    };

    var commentData = createComment().then(function(data) {
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/addUserToTask', function(req, res) {
    var taskId = req.body.taskId;
    var userId = req.body.userId;

    var assignUser = function() {
        return models.users_to_tasks.create({
            taskTaskId: taskId,
            userUserId: userId
        }).then(userToTaskData => {
            return models.user.findOne({
                where: {
                    "user_id": parseInt(userId)
                }
            });
        });
    };

    var userData = assignUser().then(function(data) {
        models.notifications.create({
            content: data.firstname + ' ' + data.lastname + " dołączył/a do zadania",
            task_id: taskId
        }).then(notif => {
            io.emit("newNotification", {
                notification: notif
            });
        });

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/uploadTaskFile', function(req, res){
  var form = new formidable.IncomingForm();
  // console.log(req);
      form.parse(req);
      // console.log(req);
      form.multiples = true;
      form.uploadDir = path.join(__dirname, '/uploads');

  var taskId;

  form.on('file', function(field, file) {

      if(file.type === "application/json"){
          // console.log(file);
          console.log(field);
          taskId = field;
      }
      else{
          console.log(file.name);
          var date = new Date().toString();
          var hashedDate = crypto.createHash('md5').update(date).digest("hex");
          var newName = hashedDate + file.name;

          var createFile = function() {
              return models.tasks_files.create({
                  taskTaskId: taskId,
                  name: newName,
                  original_name: file.name
              }).then(fileData => {
                  return fileData;
              });
          };

          var fileData = createFile().then(function(data) {
              res.send(JSON.stringify({
                  data: 'success' || null
              }));
              fs.rename(file.path, path.join(form.uploadDir, newName));
          });
      }

  });




  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });


});


app.get('/downloadTaskFile', function(req, res){
    // var fileId = req.body.fileId;

    // var findFile = function() {
    //     return models.tasks_files.findOne({
    //         where: {
    //             "file_id": parseInt(fileId)
    //         }
    //     });
    // }
    //
    // var fileData = findFile().then(function(data) {
    //     // var file = __dirname + '/uploads/' + data.name;
        var file = __dirname + '/uploads/4505c2dbd9ffdc15c14491a85d02e1b9obrazek 4.png';
        res.download(file);
    // 
    // });

  });


app.post('/sendMessage', function(req, res) {
    var projectId = req.param("projectId");
    var message = req.param("message");
    var user = req.user;

    var sendMessage = function() {
        return models.chat_messages.create({
            message: message,
            project_id: projectId,
            user_id : user.user_id,
            firstname: user.firstname,
            lastname: user.lastname
        }).then(messageData => {
            io.emit("newMessage", messageData);
            return messageData;
        });
    };

    var messageData = sendMessage().then(function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/loadChat', function(req, res) {
    var project_id = req.param("project_id");

    var loadMesseges = function() {
        return models.chat_messages.findAll({
            where: {
                "project_id": parseInt(project_id)
            }
        });
    }

    var commentData = loadMesseges().then(function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/loadNotifications', function(req, res) {
    var project_id = req.param("project_id");

    var loadNotifications = function() {
        return models.notifications.findAll({
            where: {
                "project_id": parseInt(project_id)
            }
        });
    }

    var commentData = loadNotifications().then(function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.get('/getUserData', function(req, res) {
    if (req.user === undefined) {
        res.json({});
    } else {
        res.json({
            user_id: req.user.user_id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            email: req.user.email
        });
    }
});

var authRoute = require('./app/routes/auth.js')(app, passport);

//load passport strategies
require('./app/config/passport/passport.js')(passport, models.user);

//PUBLIC FOLDER
app.use("/public", express.static(path.join(__dirname, 'public')));

//Middleware
http.listen(5000, function(err) {
    if (!err)
        console.log("Site is live");
    else console.log(err)
});
