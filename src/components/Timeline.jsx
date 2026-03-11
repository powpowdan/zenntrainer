import TaskBlock from "./TaskBlock";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";

export default function Timeline({
  tasks,
  setTasks,
  onDelete,
  elapsedTime,
  onSelectTask,
  selectedTask,
}) {
  const PIXELS_PER_MINUTE = 6; // must match TaskBlock
  const [isDragging, setIsDragging] = useState(false);
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0);

  // Total timeline height in px
  const timelineHeight = totalDuration * PIXELS_PER_MINUTE;

  // Vertical position of progress line
  const progressPercent = totalDuration
    ? Math.min(elapsedTime / totalDuration, 1)
    : 0;
  const progressPx = timelineHeight * progressPercent;

  // Determine which task is visually active based on progress line
  let cumulativePx = 0;
  const tasksWithHighlight = tasks.map((task) => {
    const taskHeight = task.duration * PIXELS_PER_MINUTE;
    const startPx = cumulativePx;
    const endPx = cumulativePx + taskHeight;
    cumulativePx = endPx;

    // Active only when the progress line has *entered* this block
    const isActive = progressPx > startPx && progressPx <= endPx;

    return { ...task, isActive };
  });

  // Handle drag & drop reordering
  const handleDragEnd = (result) => {
    setIsDragging(false);
    if (!result.destination) return;

    if (result.destination.droppableId === "trash") {
      const taskId = tasks[result.source.index].id;
      onDelete(taskId);
      return;
    }

    const newTasks = Array.from(tasks);
    const [movedTask] = newTasks.splice(result.source.index, 1);
    newTasks.splice(result.destination.index, 0, movedTask);
    setTasks(newTasks);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleEditPlan = (taskId, newPlan) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, plan: newPlan } : t))
    );
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable droppableId="timeline">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflowY: "auto",
              background:
                "radial-gradient(circle at top, rgba(37, 99, 235, 0.12), transparent 55%), var(--bg-surface)",
              padding: "8px 10px",
              borderRadius: "16px 16px 0 0",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {/* Horizontal progress line */}
            <div
              style={{
                position: "absolute",
                top: progressPx,
                left: 0,
                width: "100%",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                boxShadow: "0 0 10px rgba(59,130,246,0.4)",
                transition: "top 0.12s linear",
                zIndex: 10,
              }}
            />

            {/* Task blocks */}
            {tasksWithHighlight.map((task, index) => {
              const isSelected = selectedTask && selectedTask.id === task.id;

              return (
                <Draggable
                  key={task.id}
                  draggableId={task.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        width: "100%",
                        boxShadow: snapshot.isDragging
                          ? "0 10px 30px rgba(15,23,42,0.9)"
                          : "0 1px 4px rgba(0,0,0,0.45)",
                        borderRadius: "12px",
                        marginBottom: "6px",
                        touchAction: "pan-y",
                      }}
                    >
                      <TaskBlock
                        task={task}
                        onDelete={onDelete}
                        highlight={task.isActive}
                        selected={selectedTask && selectedTask.id === task.id}
                        onEdit={handleEditPlan}
                        onSelect={() => onSelectTask(task)}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {/* Floating Trash Zone */}
      <Droppable droppableId="trash">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "auto",
              padding: 10,
              backgroundColor: snapshot.isDraggingOver
                ? "rgba(248, 113, 113, 0.95)"
                : "rgba(31, 41, 55, 0.96)",
              color: "var(--text-primary)",
              textAlign: "center",
              fontSize: 16,
              zIndex: 1000,
              opacity: isDragging ? 1 : 0,
              pointerEvents: isDragging ? "auto" : "none",
              transition:
                "opacity 0.4s ease, background-color 0.3s ease, transform 0.2s ease",
              transform: snapshot.isDraggingOver ? "scale(1.05)" : "scale(1)",
              boxShadow: snapshot.isDraggingOver
                ? "0 0 18px rgba(248,113,113,0.75)"
                : "0 -6px 20px rgba(0,0,0,0.7)",
            }}
          >
            🗑 Drag here to delete
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
