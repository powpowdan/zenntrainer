import TaskBlock from "./TaskBlock";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";

export default function Timeline({
  tasks,
  onDelete,
  onReorder,
  onSelectTask,
  selectedTask,
}) {
  const PIXELS_PER_MINUTE = 6;
  const MIN_BLOCK_HEIGHT = 64;
  const [isDragging, setIsDragging] = useState(false);

  const getBlockHeight = (task) =>
    Math.max(Number(task.duration || 0) * PIXELS_PER_MINUTE, MIN_BLOCK_HEIGHT);

  const tasksWithHeight = tasks.map((task) => ({
    ...task,
    taskHeight: getBlockHeight(task),
  }));

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
    onReorder(newTasks);
  };

  const handleDragStart = () => {
    setIsDragging(true);
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
              background: "var(--surface)",
              padding: "8px 10px",
              borderRadius: "var(--radius-md) var(--radius-md) 0 0",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {tasks.length === 0 ? (
              <div className="timeline-empty-state">
                <span className="timeline-empty-kicker">Your class plan is empty</span>
                <h2>Add your first timed block</h2>
                <p>
                  Build the session in order, then add coaching notes before you start.
                </p>
                <span className="timeline-empty-hint">Use “Add block” below to begin.</span>
              </div>
            ) : null}

            {tasksWithHeight.map((task, index) => {
              return (
                <Draggable
                  key={task.id}
                  draggableId={task.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      className="timeline-draggable"
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      aria-label={`Reorder block ${index + 1}: ${task.name}`}
                      style={{
                        ...provided.draggableProps.style,
                        width: "100%",
                        boxShadow: snapshot.isDragging
                          ? "0 10px 30px rgba(0, 0, 0, 0.9)"
                          : "0 1px 4px rgba(0, 0, 0, 0.45)",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "6px",
                        touchAction: "pan-y",
                      }}
                    >
                      <TaskBlock
                        task={task}
                        sequence={index + 1}
                        height={task.taskHeight}
                        onDelete={onDelete}
                        selected={selectedTask && selectedTask.id === task.id}
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
                ? "var(--accent)"
                : "var(--surface)",
              color: snapshot.isDraggingOver
                ? "var(--on-accent)"
                : "var(--text-primary)",
              textAlign: "center",
              fontSize: 16,
              zIndex: 1000,
              opacity: isDragging ? 1 : 0,
              pointerEvents: isDragging ? "auto" : "none",
              transition:
                "opacity 0.4s ease, background-color 0.3s ease, transform 0.2s ease",
              transform: snapshot.isDraggingOver ? "scale(1.05)" : "scale(1)",
              boxShadow: snapshot.isDraggingOver
                ? "0 0 18px color-mix(in srgb, var(--accent) 70%, transparent)"
                : "0 -6px 20px rgba(0, 0, 0, 0.7)",
            }}
          >
            <span aria-hidden="true">Drag block here to delete</span>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
