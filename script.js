document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const deadlineInput = document.getElementById('deadline-input');
    const taskList = document.getElementById('task-list');
    const addTaskButton = document.getElementById('add-task');
    const ctx = document.getElementById('priority-chart')?.getContext('2d');

    let chart;

    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        if (taskList) {
            renderTasks(tasks);
        }
        if (ctx) {
            updateChart(tasks);
        }
    };

    const renderTasks = (tasks) => {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
    };

    const addTaskToDOM = (task) => {
        const li = document.createElement('li');
        li.className = `${task.priority} ${task.completed ? 'completed' : ''}`; // Apply priority and completed classes

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskText.style.textDecoration = task.completed ? 'line-through' : 'none'; // Cross completed tasks

        const deadlineSpan = document.createElement('span');
        deadlineSpan.classList.add('deadline');
        deadlineSpan.textContent = `Due: ${task.deadline}`;

        const completeButton = document.createElement('button');
        completeButton.textContent = task.completed ? 'Undo' : 'Complete';
        completeButton.addEventListener('click', () => {
            task.completed = !task.completed;
            updateTaskInStorage(task);
            loadTasks();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            removeTaskFromStorage(task);
            loadTasks();
        });

        // Append elements to li
        li.appendChild(taskText);
        li.appendChild(deadlineSpan);
        li.appendChild(completeButton);
        li.appendChild(deleteButton);

        // Append li to the task list
        taskList.appendChild(li);
    };

    const addTaskToStorage = (task) => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const removeTaskFromStorage = (task) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(t => t.text !== task.text);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const updateTaskInStorage = (task) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(t => t.text === task.text ? task : t);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const updateChart = (tasks) => {
        const priorityCounts = { low: 0, medium: 0, high: 0 };

        tasks.forEach(task => {
            if (!task.completed) priorityCounts[task.priority]++;
        });

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Low', 'Medium', 'High'],
                datasets: [{
                    label: 'Task Priority Distribution',
                    data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
                    backgroundColor: ['#d4edda', '#ffeeba', '#f8d7da'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Task Priorities'
                    }
                }
            }
        });
    };

    if (addTaskButton) {
        addTaskButton.addEventListener('click', () => {
            const taskText = taskInput.value.trim();
            const priority = prioritySelect.value;
            const deadline = deadlineInput.value;
            if (taskText && deadline) {
                const task = { text: taskText, priority, completed: false, deadline };
                addTaskToStorage(task);
                taskInput.value = '';
                deadlineInput.value = '';
                loadTasks();
            } else {
                alert("Please fill in both the task description and deadline.");
            }
        });
    }

    loadTasks();
});
