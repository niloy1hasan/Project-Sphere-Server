exports.getRandomColor = () => {
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const formatStatus = (status) => {
  const map = {
    active: "In Progress",
    completed: "Completed",
    archived: "Archived",
    on_hold: "On Hold",
  };
  return map[status] || "In Progress";
};