// TODO add acive class and make diffrent color to active task when it click
// may be delete should have stricke through with undo feature



const todoListBody = document.getElementsByClassName("todo-list-body")[0];

function showTodoList(tagThis) {
  let isEditing = tagThis.querySelector("[for]").getAttribute("id");
  if (isEditing !== "true") {
    let activeTask = tagThis.className.split(" ")[1];
    console.log(activeTask);
    fetch("/activeTask", {
      method: "POST",
      body: JSON.stringify({ activeTask }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    history.go(0);
  }
}

function deleteTask(event, buttonThis) {
  let deleteTaskName = buttonThis.className.split(" ")[1];
  console.log(buttonThis.className.split(" ")[1]);
  fetch("/deleteTask", {
    method: "POST",
    body: JSON.stringify({ deleteTaskName }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      location.reload(true);
    });
  event.stopPropagation();
}

function deleteList(buttonThis, event) {
  let deleteListId = buttonThis.id;
  let label = buttonThis.parentNode.parentElement.querySelector("[for]");
  console.log(label.innerText);

  fetch("/deleteListItem", {
    method: "POST", 
    body: JSON.stringify({ deleteListId }), 
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      // label.innerText = label.innerText;
      // label.style.textDecoration = "line-through";
      location.reload(true);
    });
}

function editTask(event, btn) {
  let label = btn.parentNode.parentElement.querySelector("[for]");
  let taskName = btn.parentNode.parentElement.className
    .split(" ")[1]
    .split("_")[1];
  let taskListForBorder = document.getElementsByClassName("task-list")[0];
  let errTag = document.getElementsByTagName("p")[0];

  let oldLabelText = label.innerText;

  label.contentEditable = true;
  label.setAttribute("id", "true");
  label.style.cursor = "auto";
  label.style.outline = "none";
  label.style.borderBottom = "2px solid #11998e";

  label.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      label.blur();
      label.contentEditable = false;
      label.setAttribute("id", "false");
      label.style.cursor = "pointer";
      label.style.borderBottom = "none";
      let editedTaskName = label.innerText.split("\n").join("");
      if (editedTaskName === oldLabelText) {
        label.innerHTML = label.innerText.split("\n").join("");
        event.stopImmediatePropagation();
        return;
      } else if (editedTaskName === "") {
        console.log(label.innerText);
        label.innerHTML = oldLabelText;
        errTag.className = "error";
        errTag.innerHTML =
          "Task Name should have atleast one character, Try Again";
        taskListForBorder.style.borderTopRightRadius = "1px";
        taskListForBorder.style.borderTopLeftRadius = "1px";
        setTimeout(function () {
          errTag.removeAttribute("class");
          errTag.innerHTML = "";
          taskListForBorder.style.borderTopRightRadius = "9px";
          taskListForBorder.style.borderTopLeftRadius = "9px";
          // location.reload(false);
        }, 6000);
        event.stopImmediatePropagation();
        return;
      } else {
        console.log("came");
        fetch("/editTask", {
          method: "POST", // or 'PUT'
          body: JSON.stringify({ editedTaskName, taskName }), // data can be `string` or {object}!
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            location.reload(true);
          });
          event.stopImmediatePropagation();
        return;
      }
    }
  });
  event.stopPropagation();
  return;
}

function editList(event, btn) {
  let Listlabel = btn.parentNode.parentElement.querySelector("[for]");
  let listId = Listlabel.getAttribute("for").split(" ")[0].split("_")[1];
  let taskName = Listlabel.getAttribute("for").split(" ")[1];

  let taskListForBorder = document.getElementsByClassName("task-list")[0];
  let errTag = document.getElementsByTagName("p")[0];
  let oldLabelText = Listlabel.innerText;
  // console.log(oldLabelText);

  Listlabel.contentEditable = true;
  Listlabel.style.cursor = "auto";
  Listlabel.style.outline = "none";
  Listlabel.style.borderBottom = "2px solid #11998e";

  Listlabel.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      Listlabel.blur();
      Listlabel.contentEditable = false;
      Listlabel.style.cursor = "pointer";
      Listlabel.style.borderBottom = "none";
      let editedListName = Listlabel.innerText.split("\n").join("");
      console.log(editedListName);

      if (editedListName === oldLabelText) {
        Listlabel.innerHTML = oldLabelText;
        event.stopImmediatePropagation();
        return;
      } 
      if (editedListName === "") {
        console.log("inside else if: ", Listlabel.innerText);
        Listlabel.innerHTML = oldLabelText;
        errTag.className = "error";
        errTag.innerHTML =
          "List Name should have atleast one character, Try Again";
        taskListForBorder.style.borderTopRightRadius = "1px";
        taskListForBorder.style.borderTopLeftRadius = "1px";
        setTimeout(function () {
          errTag.removeAttribute("class");
          errTag.innerHTML = "";
          taskListForBorder.style.borderTopRightRadius = "9px";
          taskListForBorder.style.borderTopLeftRadius = "9px";
          // location.reload(false);
        }, 6000);
        event.stopImmediatePropagation();
        return;
      } 
        // location.reload(false)
        console.log("came");
        fetch("/editList", {
          method: "POST",
          body: JSON.stringify({ editedListName, listId, taskName }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            location.reload(true);
          });
        event.stopImmediatePropagation();
        return;

    }
  });
}
