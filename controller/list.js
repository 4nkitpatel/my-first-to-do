const path = require("path");
const fs = require("fs");

const listModel = require("../model/list");

let listPath = path.join(__dirname, "../data/list.json");
let activeTaskForToggelList;

exports.getIndex = (req, res, next) => {
  // console.log("///////////: ", activeTaskForToggelList);
  listModel.getListsFromFile((lists) => {
    res.render("list", {
      pageTitle: "Your Todo",
      tasks: lists.tasks || undefined,
      activeTask: activeTaskForToggelList || undefined,
      allLists: lists.TodoLists || undefined,
    });
  });
};

exports.activeTask = (req, res, next) => {
  activeTaskForToggelList = req.body.activeTask;
  // console.log("lol : ", activeTaskForToggelList);
  res.redirect("/");
};

exports.deleteListItem = (req, res, next) => {
  let deleteListId = req.body.deleteListId.split(" ")[0];
  let taskOfDeleteId = req.body.deleteListId.split(" ")[1];
  console.log(deleteListId);
  console.log(taskOfDeleteId);
  listModel.getListsFromFile((lists) => {
    lists.TodoLists[taskOfDeleteId].forEach((list) => {
      if (list.listId === +deleteListId) {
        delete lists.TodoLists[taskOfDeleteId].splice([list.listId - 1], 1);
      }
    });
    lists.TodoLists[taskOfDeleteId].forEach((list) => {
      if(!(list.listId < +deleteListId)){
        console.log("test: ", list.listId)
        list.listId = list.listId - 1;
      }
    });

    fs.writeFile(listPath, JSON.stringify(lists), (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        res.status(201).json({ message: "Deleted listItem" });
      }
    });
  });
};


exports.editList = (req, res, next) => {
  let taskName = req.body.taskName;
  let listId = req.body.listId;
  let editedListName = req.body.editedListName;
  console.log(listId, taskName)
  listModel.getListsFromFile((lists) => {
    lists.TodoLists[taskName].forEach(l => {
      if(l.listId === +listId){
        l.list = editedListName
      }
    })

    fs.writeFile(listPath, JSON.stringify(lists), (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        res.status(201).json({ message: "edited list" });
      }
    });
  })
}

exports.editTask = (req, res, next) => {
  let editedTaskName = req.body.editedTaskName;
  let taskNameId = req.body.taskName;
  console.log(editedTaskName)
  console.log(typeof taskNameId)
  listModel.getListsFromFile((lists) => {
    lists.tasks.forEach(t => {
      if(t.taskId === +taskNameId){
        t.task = editedTaskName
      }
    })

    fs.writeFile(listPath, JSON.stringify(lists), (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        res.status(201).json({ message: "edited task" });
      }
    });
  })
}

exports.deleteTask = (req, res, next) => {
  // console.log(req.body.deleteTaskName);
  let deleteTask = req.body.deleteTaskName;
  listModel.getListsFromFile((lists) => {
    // this is bcz if we want to delete last element after that when it reload it takes activeId as deleteTask id so after task deleted it still give error bcz active id is of deleteTask but
    // now here we will see last product has (equal to) deleteTask id if so then we will initialize it as undefined so then it willl not give error after reloading
    if (
      lists.tasks[lists.tasks.length - 1].taskId === +deleteTask.split("_")[1]
    ) {
      activeTaskForToggelList = undefined;
    }
    delete lists.TodoLists[deleteTask];
    delete lists.tasks.splice(deleteTask.split("_")[1] - 1, 1);
    lists.tasks.forEach((task) => {
      // only that id which is greater then delete id so if delte id is 2 then 3,4.. will update there id another wise not
      if (!(task.taskId < +deleteTask.split("_")[1])) {
        console.log(task.taskId);
        task.taskId = task.taskId - 1;
      }
    });
    // delete lists.tasks[deleteTask.split("_")[1] - 1];
    // above comment work fine in our case with little modifcation bcz it is not delteing imdex
    // it delete value but at that location then it put null
    // but it will create redudent data

    // after deleting task and adjusting task id and we also deleted list for that task but after deleting
    // we hae adjust all the key of obj accordingly
    // eg( if task_2 is deleted then now after deleting task_3 will become and take place of task_2)
    // so all that renaming and all done below
    Object.keys(lists.TodoLists).forEach((oldKey) => {
      if (!(+oldKey.split("_")[1] < +deleteTask.split("_")[1])) {
        console.log(+oldKey.split("_")[1]);
        Object.defineProperty(
          lists.TodoLists,
          "task_" + (+oldKey.split("_")[1] - 1),
          Object.getOwnPropertyDescriptor(lists.TodoLists, oldKey)
        );
        delete lists.TodoLists[oldKey];
      }
    });

    fs.writeFile(listPath, JSON.stringify(lists), (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        res.status(201).json({ message: "Deleted" });
      }
    });
     
    // is delete task is first then  make activeTask to undefine bcz lets say if we are in task 2 so active task is 2 but then 
    // i press delete button of task 1 and i am on task_2 so delete will recieve task_1 but active task is 2 so after receving task_1 as delete 
    // i deleted that task and and and and then we rename the task_2 ro task_1 but we still have task_2 as actice so after reload
    // ejs checks tasks[activeTask.split("_")[1] - 1].task => tasks[2-1] => tasks[1] but we just have one element in our task 
    // sp thats why error will come so 
    // ======>  THAS WHY IF DETETE TASK IS FIRST THEN AFTER DELETENIG AND RENAMING MAKE ACTIVE TASK UNDEFINED <======
    if(+deleteTask.split("_")[1] === 1){
      activeTaskForToggelList = undefined;
    }
  });
};

exports.createLists = (req, res, next) => {
  let lists;
  let task;
  let list;
  const isTask = req.body.task;
  let activeTaskId = req.body.taskId;
  console.log("print :", activeTaskId);

  if (isTask === "task") {
    task = req.body.todoTask;
  } else {
    list = req.body.todoList;
  }
  if (
    (task !== "" && list === undefined) ||
    (task === undefined && list !== "")
  ) {
    fs.readFile(listPath, "utf8", (err, jsonString) => {
      if (!err) {
        if (!jsonString) {
          // file is empty
          lists = { tasks: [], TodoLists: {} };
        } else {
          // there is content in file
          lists = JSON.parse(jsonString);
          if (!lists.TodoLists.hasOwnProperty(activeTaskId)) {
            console.log("inside hasOwnProperty");
            if (activeTaskId) {
              console.log("inside if");
              lists.TodoLists[activeTaskId] = [];
            }
          } else {
            console.log("inside else");
            lists.TodoLists = { ...lists.TodoLists };
          }
        }
      } else {
        console.log("Error reading file from disk:", err);
        return;
      }
      if (isTask === "task") {
        const updatedList = [...lists.tasks];
        if (lists.tasks.length > 0) {
          const newTaskId = updatedList[updatedList.length - 1].taskId + 1;
          updatedList.push({ task: task, taskId: newTaskId });
          lists.tasks = updatedList;
        } else {
          lists.tasks.push({ task: task, taskId: 1 });
        }
      } else {
        const updatedList = { ...lists.TodoLists };
        if (lists.TodoLists[activeTaskId].length > 0) {
          const newListId =
            updatedList[activeTaskId][updatedList[activeTaskId].length - 1]
              .listId + 1;
          updatedList[activeTaskId].push({ list: list, listId: newListId });
          console.log(updatedList);
          lists.TodoLists = updatedList;
        } else {
          lists.TodoLists[activeTaskId].push({ list: list, listId: 1 });
        }
      }

      fs.writeFile(listPath, JSON.stringify(lists), (err) => {
        if (err) {
          console.log("Error writing file", err);
        } else {
          res.redirect("/");
        }
      });
    });
  } else {
    res.redirect("/");
  }
};
