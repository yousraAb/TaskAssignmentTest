// Helper function to validate input data
function validateInput(developers, tasks) {
    if (!Array.isArray(developers) || !Array.isArray(tasks)) {
        throw new Error("Invalid input: Developers and tasks should be arrays.");
    }
    developers.forEach(dev => {
        if (!dev.name || typeof dev.skillLevel !== 'number' || typeof dev.maxHours !== 'number') {
            throw new Error("Invalid developer data: Each developer should have a name, skill level, and max hours.");
        }
    });
    tasks.forEach(task => {
        if (!task.taskName || typeof task.difficulty !== 'number' || typeof task.hoursRequired !== 'number') {
            throw new Error("Invalid task data: Each task should have a name, difficulty, and hours required.");
        }
    });
}

// Helper function to check if all dependencies for a task are met
function dependenciesMet(task, completedTasks) {
    return task.dependencies.every(dep => completedTasks.has(dep));
}

// Helper function to find an available developer for a specific task
function findDeveloperForTask(task, developers, assignedTasks, allowAnyType = false) {
    return developers.find(dev =>
        dev.skillLevel >= task.difficulty &&
        dev.maxHours >= assignedTasks[dev.name].totalHours + task.hoursRequired &&
        (allowAnyType || dev.preferredTaskType === task.taskType || dev.preferredTaskType === 'any')
    );
}

// Main function to assign tasks with priority and dependencies
function assignTasksWithPriorityAndDependencies(developers, tasks) {
    try {
        // Validate input data
        validateInput(developers, tasks);

        const assignedTasks = {}; // Store each developer's assigned tasks
        const completedTasks = new Set(); // Track completed tasks
        const unassignedTasks = [];

        // Initialize developers in the assignedTasks dictionary
        developers.forEach(dev => {
            assignedTasks[dev.name] = { tasks: [], totalHours: 0 };
        });

        // Sort tasks by priority in descending order
        tasks.sort((a, b) => b.priority - a.priority);

        // Attempt to assign each task to a developer
        for (const task of tasks) {
            let taskAssigned = false;

            // Check if task dependencies are completed
            if (dependenciesMet(task, completedTasks)) {
                // First pass: Assign based on preferred task type
                let developer = findDeveloperForTask(task, developers, assignedTasks);

                // Second pass: Relax the preferred task type constraint
                if (!developer) {
                    developer = findDeveloperForTask(task, developers, assignedTasks, true);
                }

                // If a suitable developer is found, assign the task
                if (developer) {
                    assignedTasks[developer.name].tasks.push(task.taskName);
                    assignedTasks[developer.name].totalHours += task.hoursRequired;
                    completedTasks.add(task.taskName);
                    taskAssigned = true;
                }
            }

            // If no developer can take the task, add it to unassignedTasks
            if (!taskAssigned) {
                unassignedTasks.push(task.taskName);
            }
        }

        return { assignedTasks, unassignedTasks };

    } catch (error) {
        console.error("An error occurred:", error.message);
        return { assignedTasks: {}, unassignedTasks: [], error: error.message };
    }
}

// Detect if running in a browser or Node.js
if (typeof document !== 'undefined') {
    // Browser: Run the function and display result in HTML
    document.addEventListener("DOMContentLoaded", () => {
        const result = assignTasksWithPriorityAndDependencies(window.developers, window.tasks);
        document.getElementById('output').textContent = JSON.stringify(result, null, 2);
    });
} else {
    // Node.js: Run the function and log result to console
    const { developers, tasks } = require('./data');
    const result = assignTasksWithPriorityAndDependencies(developers, tasks);
    console.log(JSON.stringify(result, null, 2));
}
