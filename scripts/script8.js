const taskList = document.querySelector('.task-list');
const newTaskInput = document.getElementById('newTask');
const addButton = document.getElementById('addButton');
const removeCompletedButton = document.getElementById('removeCompleted');
const removeAllButton = document.getElementById('removeAll');
const sortAscendingButton = document.getElementById('sortAscending');
const sortDescendingButton = document.getElementById('sortDescending');
const clearStorageButton = document.getElementById('clearStorage');
const pickRandomTaskButton = document.getElementById('pickRandomTask');

class TodoItem {
    constructor(taskText) {
        this.taskText = taskText;
        this.completed = false;
        this.createdDate = new Date();
        this.editedDate = new Date();
    }
}

class TodoItemPremium extends TodoItem {
    constructor(taskText, imageOrIcon) {
        super(taskText);
        this.imageOrIcon = imageOrIcon;
    }
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.classList.add('checkbox');

    const taskTextElement = document.createElement('span');
    taskTextElement.textContent = task.taskText;

    const createdDateElement = document.createElement('span');
    createdDateElement.textContent = `Created: ${task.createdDate.toLocaleString()}`;
    createdDateElement.classList.add('date-time');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';

    taskElement.appendChild(checkBox);
    taskElement.appendChild(taskTextElement);
    taskElement.appendChild(createdDateElement);
    taskElement.appendChild(removeButton);

    taskElement.addEventListener('click', toggleTaskStatus);
    let isEditing = false;

    // Add event listener for the task element to toggle its status
    taskElement.addEventListener('click', (event) => {
        if (!isEditing) {
            toggleTaskStatus(event);
        }
    });

    removeButton.addEventListener('click', removeTask);
    taskElement.addEventListener('dblclick', () => {
        if (!isEditing) {
            isEditing = true;
            updateTask(taskElement, taskTextElement, createdDateElement);
        }
    });

    if (task instanceof TodoItemPremium) {
        const imageElement = document.createElement('img');
        imageElement.src = task.imageOrIcon;
        taskElement.appendChild(imageElement);
    }

    return taskElement;
}

function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') return;

    // For simplicity, alternate between TodoItem and TodoItemPremium
    const task = Math.random() < 0.5
        ? new TodoItem(taskText)
        : new TodoItemPremium(taskText, 'path/to/your/image.png');

    const taskElement = createTaskElement(task);
    taskList.prepend(taskElement);

    saveTasksToLocalStorage();

    newTaskInput.value = '';
}

function toggleTaskStatus(event) {
    const taskElement = event.currentTarget;
    const checkBox = taskElement.querySelector('.checkbox');
    const taskTextElement = taskElement.querySelector('span');

    if (checkBox.checked) {
        checkBox.checked = false;
        taskTextElement.style.textDecoration = 'none';
    } else {
        checkBox.checked = true;
        taskTextElement.style.textDecoration = 'line-through';
    }

    saveTasksToLocalStorage();
}

function removeTask(event) {
    const taskElement = event.target.parentElement;
    taskElement.remove();
    saveTasksToLocalStorage();
}

function removeCompletedTasks() {
    const completedTasks = document.querySelectorAll('.task .checkbox:checked');
    completedTasks.forEach(task => task.parentElement.remove());
    saveTasksToLocalStorage();
}

function removeAllTasks() {
    const uncompletedTasks = document.querySelectorAll('.task .checkbox:not(:checked)');
    if (uncompletedTasks.length > 0) {
        const confirmRemove = confirm('Remove all tasks including uncompleted ones?');
        if (!confirmRemove) return;
    }
    taskList.innerHTML = '';
    saveTasksToLocalStorage();
}

function updateTask(taskElement, taskTextElement, createDateElement) {
    const newText = prompt('Update the task:', taskTextElement.textContent);

    if (newText !== null) {
        taskTextElement.textContent = newText;
        const editedDate = new Date();
        const editedDateTimeString = editedDate.toLocaleString();
        createDateElement.textContent = `Edited: ${editedDateTimeString}`;
    }
}

function sortTasksAscending() {
    const tasks = Array.from(document.querySelectorAll('.task'));
    tasks.sort((a, b) => {
        const aDate = new Date(a.querySelector('.date-time').textContent.split(': ')[1]);
        const bDate = new Date(b.querySelector('.date-time').textContent.split(': ')[1]);
        return aDate - bDate;
    });
    taskList.innerHTML = '';
    tasks.forEach(task => taskList.appendChild(task));
}

function sortTasksDescending() {
    const tasks = Array.from(document.querySelectorAll('.task'));
    tasks.sort((a, b) => {
        const aDate = new Date(a.querySelector('.date-time').textContent.split(': ')[1]);
        const bDate = new Date(b.querySelector('.date-time').textContent.split(': ')[1]);
        return bDate - aDate;
    });
    taskList.innerHTML = '';
    tasks.forEach(task => taskList.appendChild(task));
}

function saveTasksToLocalStorage() {
    const tasks = Array.from(document.querySelectorAll('.task')).map(taskElement => {
        const taskText = taskElement.querySelector('span').textContent;
        const completed = taskElement.querySelector('.checkbox').checked;
        const createdDate = taskElement.querySelector('.date-time').textContent.split(': ')[1];
        return { taskText, completed, createdDate };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

function clearLocalStorage() {
    localStorage.removeItem('tasks');
}

function pickRandomTask() {
    const tasks = Array.from(document.querySelectorAll('.task'));
    if (tasks.length === 0) return;

    // Reset the background and other styles for all tasks
    tasks.forEach(task => {
        task.style.backgroundColor = '';
        task.style.color = '';
    });

    const randomIndex = Math.floor(Math.random() * tasks.length);
    const randomTask = tasks[randomIndex];

    // Add styles to highlight the randomly selected task
    randomTask.style.backgroundColor = '#e06e6e';
    randomTask.style.color = 'white';
}


addButton.addEventListener('click', addTask);
removeCompletedButton.addEventListener('click', removeCompletedTasks);
removeAllButton.addEventListener('click', removeAllTasks);
sortAscendingButton.addEventListener('click', sortTasksAscending);
sortDescendingButton.addEventListener('click', sortTasksDescending);
clearStorageButton.addEventListener('click', clearLocalStorage);
pickRandomTaskButton.addEventListener('click', pickRandomTask);

newTaskInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Load tasks from local storage when the app starts
loadTasksFromLocalStorage();
