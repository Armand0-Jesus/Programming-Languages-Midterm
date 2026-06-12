package main.java;

import java.util.UUID;
import org.teavm.jso.JSBody;

public final class TaskBridgeEntry {
    private TaskBridgeEntry() {
    }

    public static void main(String[] args) {
        exposeBridge();
    }

    @JSBody(script = "window.JavaTaskBridge = {"
            + " normalizeTitle: function(rawTitle) {"
            + "   return javaMethods.get('main.java.TaskBridgeEntry.normalizeTitle(Ljava/lang/String;)Ljava/lang/String;').invoke(rawTitle);"
            + " },"
            + " canAddTask: function(rawTitle) {"
            + "   return javaMethods.get('main.java.TaskBridgeEntry.canAddTask(Ljava/lang/String;)Z').invoke(rawTitle);"
            + " },"
            + " createTaskId: function() {"
            + "   return javaMethods.get('main.java.TaskBridgeEntry.createTaskId()Ljava/lang/String;').invoke();"
            + " }"
            + "};")
    private static native void exposeBridge();

    public static String normalizeTitle(String rawTitle) {
        if (rawTitle == null) {
            return "";
        }

        String trimmed = rawTitle.trim();
        if (trimmed.isEmpty()) {
            return "";
        }

        return trimmed.replaceAll("\\\\s+", " ");
    }

    public static boolean canAddTask(String rawTitle) {
        return !normalizeTitle(rawTitle).isEmpty();
    }

    public static String createTaskId() {
        return UUID.randomUUID().toString();
    }
}
