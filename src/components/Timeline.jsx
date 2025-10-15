import TaskBlock from "./TaskBlock";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";


export default function Timeline({ tasks, setTasks, onDelete, elapsedTime }) {
  const PIXELS_PER_MINUTE = 6; // must match TaskBlock
  const [isOverTrash, setIsOverTrash] = useState(false);
   const [isDragging, setIsDragging] = useState(false);
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0);

  // Total timeline height in px
  const timelineHeight = tasks.reduce((sum, t) => sum + t.duration * PIXELS_PER_MINUTE, 0);

  // Vertical position of progress line
  const progressPercent = Math.min(elapsedTime / totalDuration, 1);
  const progressPx = timelineHeight * progressPercent;

  // Determine which task is currently active
  let cumulativeTime = 0;
  const tasksWithHighlight = tasks.map((task) => {
    cumulativeTime += task.duration;
    const isActive = elapsedTime <= cumulativeTime && elapsedTime > cumulativeTime - task.duration;
    return { ...task, isActive };
  });

  // Handle drag & drop reordering
 const handleDragEnd = (result) => {
     setIsDragging(false);
    if (!result.destination) return;

    // Check if dropped in trash zone
    if (result.destination.droppableId === "trash") {
      const taskId = tasks[result.source.index].id;
      onDelete(taskId);
      setIsOverTrash(false);
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
    <DragDropContext  onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
            }}
          >
            {/* Horizontal progress line */}
            <div
              style={{
                position: "absolute",
                top: progressPx,
                left: 0,
                width: "100%",
                height: "3px",
                backgroundColor: "white",
                transition: "top 0.5s linear",
                zIndex: 10,
              }}
            />

            {/* Task blocks */}
            {tasksWithHighlight.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      width: "100%",
                      boxShadow: snapshot.isDragging
                        ? "0 4px 12px rgba(0,0,0,0.2)"
                        : "none",
                      borderRadius: "5px",
                      marginBottom: "2px",
                      touchAction: "none",
                    }}
                  >
                    <TaskBlock task={task} onDelete={onDelete} highlight={task.isActive}  onEdit={handleEditPlan} />
                  </div>
                )}
              </Draggable>
            ))}

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
              bottom: "0",
              left: "0",
              width: "100%",
              height: "70px",
              backgroundColor: snapshot.isDraggingOver
                ? "#ff4444"
                : "rgba(30,30,30,0.9)",
              color: "white",
              textAlign: "center",
              lineHeight: "70px",
              fontSize: "16px",
              zIndex: 1000,
              opacity: isDragging ? 1 : 0,
              pointerEvents: isDragging ? "auto" : "none",
              transition: "opacity 0.4s ease, background-color 0.3s ease",
            }}
          >
            🗑️ Drop Here to Delete
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
