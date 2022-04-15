var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item"); // <li class="list-group=item"></>
  var taskSpan = $("<span>")                    //  <span>
    .addClass("badge badge-primary badge-pill") //  <span class="bade bade-primary badge-pill"></>
    .text(taskDate);                            //  <span class="bade bade-primary badge-pill">taskDate</>
  var taskP = $("<p>")  //  <p>
    .addClass("m-1")    //  ...
    .text(taskText);    //  ...

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);        //  <li><span><p>...</>


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {   // if not tasks
    tasks = {     // task is saved in arrays
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // event listener:click | <... class="list-group"><p>...</>
  $(".list-group").on("click", "p", function() {
    var text = $(this)    //  var text = $(this).text().trim();
      .text()
      .trim();

    var textInput = $("<textarea>") // +<textarea></>
      .addClass("form-control")
      .val(text);
    $(this).replaceWith(textInput);

    textInput.trigger("focus"); // css textarea:focus {};
  });

  // event listener:blur | <ul class="list-group"><textarea:blur>...</>
  $(".list-group").on("blur", "textarea", function() {
    // <textarea value=()>text()</>
    var text = $(this)
    .val()
    .trim();

    // <ul class="list-group" id=""></>
    var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

    // <li class="list-group-item"> position
    var index = $(this)
    .closest(".list-group-item")
    .index();

    tasks[status][index].text = text;
    saveTasks();

    // recreates <p class="m-1">text()</>
    var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

    // replace <textarea> with <p>
    $(this).replaceWith(taskP)
  })
};




// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


// 5.1.5 notes

// EVENT LISTENER
// <div id="task-form-modal"><button class="btn-primary"></></>
// JQuery  $("#task-form-modal .btn-primary").click(function() {});
//     JS  document.querySelector("#task-form-modal .btn-primary").addEventListener("click", function() {});