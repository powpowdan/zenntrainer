import TaskBlock from "./TaskBlock";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";


export default function Timeline({ tasks, setTasks, onDelete, elapsedTime }) {
  const PIXELS_PER_MINUTE = 6; // must match TaskBlock 
   const [isDragging, setIsDragging] = useState(false);
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0);

  // Total timeline height in px
  const timelineHeight = totalDuration * PIXELS_PER_MINUTE;

  // Vertical position of progress line
  const progressPercent = totalDuration ? Math.min(elapsedTime / totalDuration, 1) : 0;
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
                transition: "top 0.1s linear", //usually 0.5
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
              backgroundColor: snapshot.isDraggingOver
                ? "#ff0000ff"
                : "rgba(187, 32, 32, 0.9)",
              color: "white",
              paddingTop: "10px",  
                paddingBottom: "10px",
                height: "auto", 
              textAlign: "center", 
              fontSize: "20px",
              zIndex: 1000,
              opacity: isDragging ? 1 : 0,
             pointerEvents: isDragging ? "auto" : "none",
              transition: "opacity 0.4s ease, background-color 0.3s ease",
            }}
          >
            🗑️ Drop Below Here to Delete
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
