package main.java;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

class Task {
    private final String id;
    private final String title;

    Task(String title) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
    }

    String getId() {
        return id;
    }

    String getTitle() {
        return title;
    }
}

class TaskManager {
    private final List<Task> tasks = new ArrayList<>();

    public Task addTask(String title) {
        Task task = new Task(title);
        tasks.add(task);
        return task;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public boolean deleteTask(String taskId) {
        return tasks.removeIf(task -> task.getId().equals(taskId));
    }
}

public class Main {

    public static void main(String[] args) {
        TaskManager manager = new TaskManager();

        manager.addTask("Study for exam");
        manager.addTask("Finish practice");

        for (Task task : manager.getTasks()) {
            System.out.println(task.getTitle());
        }
    }
}
