var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  // tasks are parsed from Local Storage's JSON. Specifically, task is getting the string value "tasks" that's found in Local Storange.
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    // tasks is an object of key-value pairs. each key's value is an array
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties. 
  // the keys (toDo, inProgress, etc) are passed through as "list" while te values are passed as "arr" in the function.
  $.each(tasks, function(list, arr) {
    // then loop over sub-array.
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
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

// save button in modal was clicked. clicking the save button 
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

// function happens when clicking on the <p> within the .list-group element. 
$(".list-group").on("click", "p", function() {
  // $ turns this into a jQuery object. trim() follows text() to remove any white space.
  var text = $(this).text().trim();

  // $("textarea") jQuery finds all existing <textarea> elements
  // $("<textarea>") jQuery creates new <textarea> element. however, this <textarea> only exists in memory so far.
  var textInput = $("<textarea>").addClass("form-control").val(text);
  
  // replaces <p> with <textarea>.
  $(this).replaceWith(textInput);
  // focus is triggered after element change.
  textInput.trigger("focus");
});

// blur event triggers when textarea is no longer in focus.
$(".list-group").on("blur", "textarea", function() {
  // get current value/text of <textarea>
  var text = $(this).val().trim();

  // get parent <ul> id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id") // jQuery gets an attribute. returning an id, which will be 'list-' followed by the category
    .replace("list-", ""); // removes 'list-' from text. w/o 'list-' the value is now just the category name which matches one of the tasks object arrays.

  // get task's posisition in the list of other <li> elements
  var index = $(this)
    .closest(".list-group-item")
    .index(); // child elements are indexed starting at zero

  // object[returns an array][returns the object at the given index in the array].returns the text property of the object at the given index.
  // updates task in array and re-saves to localStorage
  tasks[status][index].text = text;
  saveTasks();

  // recreate <p>
  var taskP = $("<p>").addClass("m-1").text(text);
  // replace <textarea> with <p> element
  $(this).replaceWith(taskP);
});

// clicking on task's due date. jQuery delagation method
$(".list-group").on("click", "span", function() {
  // gets current text & trim any whitespace
  var date = $(this).text().trim();

  // creates new <input> element
  var dateInput = $("<input>")
    .attr("type", "text") // jQuery attr w/ 2 arguments sets an attribute. <input type="text">
    .addClass("form-control")
    .val(date);
  // swaps out elements
  $(this).replaceWith(dateInput);

  // automatically focuses on new element
  dateInput.trigger("focus");
});

// event listener | when the user clicks outside the due date <span>
$(".list-group").on("blur", "input[type='text']", function() {
  // gets current text
  var date = $(this).val().trim();

  // gets parent <ul> id atrribute | <ul class="list-group" id="...">
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // gets task's index position among the other <li> elements in the <ul>
  var index = $(this).closest(".list-group-item").index();

  // updates task in array and re-saves to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreates <span> with bootstrap classes
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  // replaces <input> with <span>
  $(this).replaceWith(taskSpan);
});


// sortable method, jQueryUI | moving tasks within a task list and across task lists.
// vanilla js: pageContentEl.addEventListener("dragstart", function(event) {});
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone", // prevents click events from accidentally triggering on original <li>
  activate: function(event) { // triggers all lists when dragging starts
    console.log("activate", this);
  },
  deactivate: function(event) { //triggers all lists when dragging stops
    console.log("deactivate", this);
  },
  over: function(event) { // triggers when dragged item enters a connected list
    console.log("over", event.target);
  },
  out: function(event) { // triggers when a dragged item leaves a connected list
    console.log("out", event.target);
  },
  update: function(event) { // triggers when a list's contents have changed (items re-ordered, removed, or added)
    // task data is stored in array
    var tempArr = [];

    // loops over current set of children in sortable list.
    // - each() | runs callback function for every item/element in array
    // - $(this) | inside the callback function, $(this) refers to child eleent at that index.
    $(this).children().each(function() {
      var text = $(this).find("p").text().trim();
      var date = $(this).find("span").text().trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trims down list id to match object property
    var arrName = $(this).attr("id").replace("list-", "");

    // updates array on tasks object and save. now tasks stay in status column when browser refreshes
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// selects <... id=trash>, applied droppable widget
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) { // targets draggable item to remove it from dom. triggers update() which triggers saveTasks
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
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


