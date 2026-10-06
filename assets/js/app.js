const cl = console.log;
// form-controls
const todoForm = document.getElementById("todoForm");
const todoName = document.getElementById("todoName");
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
  let arr = Object.entries(obj);
  let arrofMovie = arr.map((movie) => {
    movie[1].id = movie[0];
    state.todoArr.push(movie[1]);
    cl(state.todoArr);
  });
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

    todoForm.reset();
  } catch {
    snackbar(err, "error");
  } finally {
    showSpinner(false);
  }
}

// cretaeLI

function createLI(newTodo) {
  let li = document.createElement("li");

  li.id = newTodo.id;

  li.className = `list-group-item d-flex justify-content-between`;

  li.innerHTML = `
      <div>
        <input type="checkbox" ${newTodo.isCompleted ? "checked" : ""}>
        <strong>${newTodo.todoItem}</strong>
    </div>
    <div>
        <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">Edit</button>
        <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger">Remove</button>
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
  } catch {
    snackbar("Something went wrong", "error");
  } finally {
    showSpinner(false);
  }
}

showOnUI();

// rendering

function rendering(arr) {
  let result = "";

  arr.forEach((obj) => {
    result += `
          <li class="list-group-item d-flex justify-content-between" id="${obj.id}">
          <div>
              <input type="checkbox" ${obj.isCompleted ? "checked" : ""}>
              <strong>${obj.todoItem}</strong>
          </div>
          <div>
              <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">Edit</button>
              <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger">Remove</button>
          </div>
      </li>
    `;
  });

  todoContainer.innerHTML = result;
}

// edit

function onTodoEdit(ele) {
  let editId = ele.closest("li").id;
  state.editId = editId;

  let editObj = state.todoArr.find((ele) => ele.id === editId);

  todoName.value = editObj.todoItem;
  isCompleted.value = editObj.isCompleted ? "yes" : "no";

  updateTodoBtn.classList.remove("d-none");
  addTodoBtn.classList.add("d-none");
}

// update

async function onTodoUpdate() {
  try {
    let updateId = state.editId;

    let updatedObj = {
      id: updateId,
      todoItem: todoName.value.trim(),
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

    updateTodoBtn.classList.add("d-none");
    addTodoBtn.classList.remove("d-none");
    state.editId = null;
    todoForm.reset();
  } catch {
    snackbar("Something went wrong", "error");
  } finally {
    showSpinner(false);
  }
}

// updatedLI

function updatedLI(data) {
  let li = document.getElementById(data.id);

  li.innerHTML = `
    <div>
      <input type="checkbox" ${data.isCompleted ? "checked" : ""}>
      <strong>${data.todoItem}</strong>
  </div>
  <div>
      <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">Edit</button>
      <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger">Remove</button>
  </div>
  `;
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

      cl(data);

      let getIndex = state.todoArr.findIndex((ele) => ele.id === removeId);

      state.todoArr.splice(getIndex, 1);

      ele.closest("li").remove();
    } catch {
      snackbar("something went wrong", "error");
    } finally {
      showSpinner(false);
    }
  }
}
todoForm.addEventListener("submit", onTodoAdd);
updateTodoBtn.addEventListener("click", onTodoUpdate);
