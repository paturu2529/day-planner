const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const timeInput = document.getElementById('time-input');
const timeSlots = document.querySelector('.time-slots');
const currentDateElement = document.getElementById('current-date');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function createTimeSlots() {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(timeString);
    }
    return slots;
}
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');
    if (task.completed) {
        taskItem.classList.add('completed');
    }

    taskItem.innerHTML = `
        <span class="task-text">${task.text}</span>
        <div class="task-actions">
            <button class="complete-btn" onclick="toggleComplete(${task.id})">
                <i class="fas fa-check"></i>
            </button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return taskItem;
}

// Render tasks in timeline
function renderTasks() {
    timeSlots.innerHTML = '';
    const slots = createTimeSlots();
    
    slots.forEach(slotTime => {
        const timeSlot = document.createElement('div');
        timeSlot.classList.add('time-slot');
        
        const formattedTime = formatTime(slotTime);
        
        timeSlot.innerHTML = `
            <span class="time-label">${formattedTime}</span>
            <div class="time-slot-content">
                ${getTasksForTimeSlot(slotTime)}
            </div>
        `;
        
        timeSlots.appendChild(timeSlot);
    });
}// Get tasks for a specific time slot
function getTasksForTimeSlot(slotTime) {
    const slotHour = parseInt(slotTime.split(':')[0]);
    const slotTasks = tasks.filter(task => {
        const taskHour = parseInt(task.time.split(':')[0]);
        return taskHour === slotHour;
    });

    if (slotTasks.length === 0) {
        return '<div class="empty-slot-message">No tasks scheduled</div>';
    }

    return slotTasks
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(task => createTaskElement(task).outerHTML)
        .join('');
}

// Add new task
function addTask(e) {
    e.preventDefault();

    const taskText = taskInput.value.trim();
    const taskTime = timeInput.value;

    if (!taskText || !taskTime) return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        time: taskTime,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    taskInput.value = '';
    timeInput.value = '';
}

// Toggle task completion
function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Event listeners
taskForm.addEventListener('submit', addTask);

// Initialize app
updateCurrentDate();
renderTasks();

// Update date every minute
setInterval(updateCurrentDate, 60000);
