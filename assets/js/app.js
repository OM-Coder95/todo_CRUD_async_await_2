const cl = console.log;
// form-controls
const todoForm = document.getElementById("todoForm");
const todoName = document.getElementById("todoName");
const todoDescription = document.getElementById("todoDescription");
const isCompleted = document.getElementById("isCompleted");

// Container
const todoContainer = document.getElementById("todoContainer");

// buttons
const addTodoBtn = document.getElementById("addTodoBtn");
const updateTodoBtn = document.getElementById("updateTodoBtn");

// spinner
const spinner = document.getElementById("spinner");

const BASE_URL = `https://todo-crud-async-await-generic-default-rtdb.firebaseio.com`;

const TODO_URL = `${BASE_URL}/todo2.json`;

let state = {
  todoArr: [],
  editId: null,
};

// Functions

function popup(msg, icon) {
  Swal.fire({
    text: msg,
    icon: icon,
    timer: 1800,
  });
}

// arrOfObj

function objToArr(obj) {
  state.todoArr = Object.entries(obj)
    .map(([id, todo]) => {
      return {
        ...todo,
        id: id,
      };
    })
    .reverse();
}

// spinner

function showSpinner(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

// snackbar

function snackbar(msg, icon) {
  Swal.fire({
    text: msg,
    icon: icon,
    timer: 1800,
  });
}

// Create

async function onTodoAdd(event) {
  event.preventDefault();

  try {
    let newTodo = {
      todoItem: todoName.value.trim(),
      description: todoDescription.value.trim(),
      isCompleted: isCompleted.value === "yes" ? true : false,
    };

    showSpinner(true);
    let res = await fetch(TODO_URL, {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: {
        "Content-Type": "Application/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();

    cl(data);

    newTodo.id = data.name;

    state.todoArr.unshift(newTodo);

    createLI(newTodo);

    snackbar("Todo created successfully!", "success");

    todoForm.reset();
  } catch (err) {
    snackbar(err, "error");
  } finally {
    showSpinner(false);
  }
}

// cretaeLI

function createLI(newTodo) {
  let li = document.createElement("li");

  li.id = newTodo.id;

  li.className = `list-group-item`;

  li.innerHTML = `

                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <input type="checkbox" onclick="onTodosStatusChange(this)" ${
                                          newTodo.isCompleted ? "checked" : ""
                                        }>
                                        <strong>${newTodo.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">
                                            Edit
                                        </button>

                                        <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger deleteBtn">
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div class="accordion mt-2" id="accordion-${newTodo.id}">
                                    <div class="card">

                                        <div class="card-header">
                                            <button class="btn btn-link" type="button" data-toggle="collapse"
                                                data-target="#description-${newTodo.id}" aria-expanded="false"
                                                aria-controls="description-${newTodo.id}">

                                                View Description
                                            </button>
                                        </div>

                                        <div id="description-${newTodo.id}" class="collapse"
                                            data-parent="#accordion-${newTodo.id}">

                                            <div class="card-body">
                                                ${newTodo.description || "No description available"}
                                            </div>

                                        </div>

                                    </div>
                                </div>

                            `;
  todoContainer.prepend(li);
}

// Read

async function showOnUI() {
  try {
    showSpinner(true);
    let res = await fetch(TODO_URL, {
      method: "GET",
      body: null,
      headers: {
        "Content-Type": "Application/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();
    cl(data);

    objToArr(data);

    cl(state.todoArr);

    rendering(state.todoArr);
  } catch (err) {
    snackbar(err.message, "error");
  } finally {
    showSpinner(false);
  }
}

showOnUI();

// rendering

function rendering(arr) {
  let result = "";

  arr.forEach((obj) => {
    result += `<li class="list-group-item" id="${obj.id}">

                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <input type="checkbox" onclick="onTodosStatusChange(this)" ${
                                          obj.isCompleted ? "checked" : ""
                                        }>
                                        <strong>${obj.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">
                                            Edit
                                        </button>

                                        <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger deleteBtn">
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div class="accordion mt-2" id="accordion-${obj.id}">
                                    <div class="card">

                                        <div class="card-header">
                                            <button class="btn btn-link" type="button" data-toggle="collapse"
                                                data-target="#description-${obj.id}" aria-expanded="false"
                                                aria-controls="description-${obj.id}">

                                                View Description
                                            </button>
                                        </div>

                                        <div id="description-${obj.id}" class="collapse"
                                            data-parent="#accordion-${obj.id}">

                                            <div class="card-body">
                                                ${obj.description || "No description available"}
                                            </div>

                                        </div>

                                    </div>
                                </div>

                            </li>`;
  });

  todoContainer.innerHTML = result;
}

// edit

function onTodoEdit(ele) {
  let editId = ele.closest("li").id;
  state.editId = editId;

  let allDeleteBtns = document.querySelectorAll(".deleteBtn");

  allDeleteBtns.forEach((ele) => {
    ele.disabled = false;
  });

  let li = ele.closest("li");
  li.querySelector(".deleteBtn").disabled = true;

  let editObj = state.todoArr.find((ele) => ele.id === editId);
  cl(editObj);

  todoName.value = editObj.todoItem;
  todoDescription.value = editObj.description;
  isCompleted.value = editObj.isCompleted ? "yes" : "no";

  updateTodoBtn.classList.remove("d-none");
  addTodoBtn.classList.add("d-none");
}

// update

async function onTodoUpdate() {
  try {
    let updateId = state.editId;

    let li = document.getElementById(updateId);
    li.querySelector(".deleteBtn").disabled = false;

    let updatedObj = {
      id: updateId,
      todoItem: todoName.value.trim(),
      description: todoDescription.value.trim(),
      isCompleted: isCompleted.value === "yes" ? true : false,
    };

    let UPDATED_URL = `${BASE_URL}/todo2/${updateId}.json`;

    showSpinner(true);
    let res = await fetch(UPDATED_URL, {
      method: "PATCH",
      body: JSON.stringify(updatedObj),
      headers: {
        "Content-Type": "application/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();
    cl(data);

    let getIndex = state.todoArr.findIndex((ele) => ele.id === updateId);

    state.todoArr[getIndex] = updatedObj;

    updatedLI(data);

    snackbar("Todo updated successfully!", "success");

    updateTodoBtn.classList.add("d-none");
    addTodoBtn.classList.remove("d-none");
    state.editId = null;
    todoForm.reset();
  } catch (err) {
    snackbar(err.message, "error");
  } finally {
    showSpinner(false);
  }
}

// updatedLI

function updatedLI(data) {
  let li = document.getElementById(data.id);

  li.innerHTML = `

                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <input type="checkbox" onclick="onTodosStatusChange(this)" ${
                                          data.isCompleted ? "checked" : ""
                                        }>
                                        <strong>${data.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">
                                            Edit
                                        </button>

                                        <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger deleteBtn">
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div class="accordion mt-2" id="accordion-${data.id}">
                                    <div class="card">

                                        <div class="card-header">
                                            <button class="btn btn-link" type="button" data-toggle="collapse"
                                                data-target="#description-${data.id}" aria-expanded="false"
                                                aria-controls="description-${data.id}">

                                                View Description
                                            </button>
                                        </div>

                                        <div id="description-${data.id}" class="collapse"
                                            data-parent="#accordion-${data.id}">

                                            <div class="card-body">
                                                ${data.description || "No description available"}
                                            </div>

                                        </div>

                                    </div>
                                </div>`;
}

// Remove

async function onTodoRemove(ele) {
  let removeId = ele.closest("li").id;

  let result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });
  if (result.isConfirmed) {
    try {
      let REMOVE_URL = `${BASE_URL}/todo2/${removeId}.json`;

      showSpinner(true);
      let res = await fetch(REMOVE_URL, {
        method: "DELETE",
        body: null,
        headers: {
          "Content-Type": "Application/json",
          Authorization: "JWT TOKEN",
        },
      });

      let data = await res.json();


      let getIndex = state.todoArr.findIndex((ele) => ele.id === removeId);

      state.todoArr.splice(getIndex, 1);

      ele.closest("li").remove();

      snackbar("Todo removed successfully!", "success");
    } catch (err) {
      snackbar(err.message, "error");
    } finally {
      showSpinner(false);
    }
  }
}

// onTodosStatusChange

async function onTodosStatusChange(ele) {
  try {
    let todoId = ele.closest("li").id;

    let isCompleted = ele.checked;

    let STATUSCHANGE_URL = `${BASE_URL}/todo2/${todoId}.json`;

    showSpinner(true);
    let res = await fetch(STATUSCHANGE_URL, {
      method: "PATCH",
      body: JSON.stringify({ isCompleted: isCompleted }),
      headers: {
        "Content-Type": "application/json",
        authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();
    cl(data);

    let localObj = state.todoArr.find((ele) => ele.id === todoId);

    localObj.isCompleted = isCompleted;

    cl(state.todoArr);
  } catch (err) {
    snackbar(err.message, "error");
    console.error(err);
  } finally {
    showSpinner(false);
  }
}

todoForm.addEventListener("submit", onTodoAdd);
updateTodoBtn.addEventListener("click", onTodoUpdate);
