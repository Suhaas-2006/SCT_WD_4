let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

const taskList = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");
const searchTask = document.getElementById("searchTask");

addBtn.addEventListener("click", addTask);

document
    .getElementById("themeToggle")
    .addEventListener("click", toggleTheme);

searchTask.addEventListener("keyup", renderTasks);

function saveTasks() {
    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function addTask() {

    const text =
        document.getElementById("taskInput").value;

    const date =
        document.getElementById("taskDate").value;

    const priority =
        document.getElementById("priority").value;

    const category =
        document.getElementById("category").value;

    if (text.trim() === "") {
        showToast("Enter a task");
        return;
    }

    tasks.push({
        text,
        date,
        priority,
        category,
        completed: false
    });

    saveTasks();

    renderTasks();

    document.getElementById("taskInput").value = "";
    document.getElementById("taskDate").value = "";

    showToast("Task Added Successfully");
}

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    if (currentFilter === "active") {
        filteredTasks =
            filteredTasks.filter(
                task => !task.completed
            );
    }

    if (currentFilter === "completed") {
        filteredTasks =
            filteredTasks.filter(
                task => task.completed
            );
    }

    const search =
        searchTask.value.toLowerCase();

    filteredTasks =
        filteredTasks.filter(task =>
            task.text
                .toLowerCase()
                .includes(search)
        );

    filteredTasks.forEach((task, index) => {

        let dueLabel = "";

        if (task.date) {

            const dueDate =
                new Date(task.date);

            const now =
                new Date();

            const diff =
                dueDate - now;

            const hours =
                diff / (1000 * 60 * 60);

            if (hours < 0 && !task.completed) {

                dueLabel =
                    '<span class="overdue">❌ Overdue</span>';

            } else if (
                hours <= 24 &&
                !task.completed
            ) {

                dueLabel =
                    '<span class="due-soon">⚠ Due Soon</span>';
            }
        }

        const li =
            document.createElement("li");

        li.className =
            task.completed
                ? "task completed"
                : "task";

        li.innerHTML = `

        <div class="task-info">

            <div class="task-title">
                ${task.text}
            </div>

            <div class="task-meta">

                <span class="priority ${task.priority.toLowerCase()}">
                    ${task.priority}
                </span>

                📂 ${task.category}

                <br>

                📅 ${task.date || "No Due Date"}

                <br>

                ${dueLabel}

            </div>

        </div>

        <div class="actions">

            <button
                class="complete"
                onclick="toggleTask(${index})">
                ✔
            </button>

            <button
                class="edit"
                onclick="editTask(${index})">
                ✏
            </button>

            <button
                class="delete"
                onclick="deleteTask(${index})">
                🗑
            </button>

        </div>
        `;

        taskList.appendChild(li);
    });

    updateStats();
}

function toggleTask(index) {

    tasks[index].completed =
        !tasks[index].completed;

    saveTasks();

    renderTasks();

    if (tasks[index].completed) {

        confetti({
            particleCount: 150,
            spread: 100
        });

        showToast(
            "Task Completed 🎉"
        );
    }
}

function editTask(index) {

    let updated =
        prompt(
            "Edit Task",
            tasks[index].text
        );

    if (
        updated !== null &&
        updated.trim() !== ""
    ) {

        tasks[index].text =
            updated;

        saveTasks();

        renderTasks();

        showToast(
            "Task Updated"
        );
    }
}

function deleteTask(index) {

    const confirmDelete =
        confirm(
            "Delete this task?"
        );

    if (!confirmDelete)
        return;

    tasks.splice(index, 1);

    saveTasks();

    renderTasks();

    showToast(
        "Task Deleted"
    );
}

function updateStats() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const pending =
        total - completed;

    document.getElementById(
        "totalTasks"
    ).innerText = total;

    document.getElementById(
        "completedTasks"
    ).innerText = completed;

    document.getElementById(
        "pendingTasks"
    ).innerText = pending;

    const progress =
        total === 0
            ? 0
            : (completed / total) * 100;

    document.getElementById(
        "progressBar"
    ).style.width =
        progress + "%";

    document.getElementById(
        "progressText"
    ).innerText =
        progress.toFixed(0) +
        "% Completed";
}

function filterTasks(type) {

    currentFilter = type;

    renderTasks();
}

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );

    localStorage.setItem(
        "theme",
        document.body.classList.contains(
            "light-mode"
        )
    );
}

if (
    localStorage.getItem(
        "theme"
    ) === "true"
) {
    document.body.classList.add(
        "light-mode"
    );
}

new Sortable(taskList, {

    animation: 200,

    onEnd: function (evt) {

        const movedItem =
            tasks.splice(
                evt.oldIndex,
                1
            )[0];

        tasks.splice(
            evt.newIndex,
            0,
            movedItem
        );

        saveTasks();
    }
});

renderTasks();