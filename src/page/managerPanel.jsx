// Import the React library and the 'useState' hook for managing component state.
import React, { useState } from 'react';

// --- Reusable Components ---

// A component to display a key statistic in a styled card.
const StatCard = ({ icon, title, value, color }) => (
    // Main container for the card with styling for background, padding, shadow, and hover effects.
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105">
        {/* A colored circle for the icon. The background color is passed as a prop. */}
        <div className={`p-3 rounded-full ${color}`}>
            {/* The icon itself, using Font Awesome classes passed in via props. */}
            <i className={`fas ${icon} text-white fa-lg`}></i>
        </div>
        {/* Container for the text content. */}
        <div>
            {/* Displays the title of the stat card (e.g., "Pending Requests"). */}
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            {/* Displays the main value of the stat card (e.g., a number). */}
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// A component to render a styled badge based on a status string.
const StatusBadge = ({ status }) => {
    // Base CSS classes that apply to all badges.
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block";
    // A variable to hold the color-specific classes.
    let statusClasses = "";

    // A switch statement to determine the style based on the 'status' prop.
    switch (status) {
        case 'Approved':
        case 'Present':
            // If status is 'Approved' or 'Present', use green styles.
            statusClasses = "bg-green-100 text-green-800";
            break;
        case 'Denied':
        case 'Absent':
            // If status is 'Denied' or 'Absent', use red styles.
            statusClasses = "bg-red-100 text-red-800";
            break;
        case 'On Leave':
             // If status is 'On Leave', use blue styles.
             statusClasses = "bg-blue-100 text-blue-800";
             break;
        case 'Pending':
        default:
            // For 'Pending' or any other status, use yellow styles.
            statusClasses = "bg-yellow-100 text-yellow-800";
            break;
    }
    // Return a span element with combined base and color classes, displaying the status text.
    return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

// NEW: Attendance Modal Component
const AttendanceModal = ({ employee, attendanceData, onClose }) => {
    // For this example, today's date is hardcoded. In a real app, you'd use new Date().getDate().
    const today = 18; 

    return (
        // Modal backdrop with blur effect.
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
            {/* Modal panel with styling. */}
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg m-4">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Attendance for {employee.name} - July 2025</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times fa-lg"></i>
                    </button>
                </div>
                {/* Modal Body with Calendar */}
                <div className="p-6">
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-3">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells for month start alignment (July 2025 starts on a Tuesday) */}
                        <div />
                        <div />
                        {/* Map through 31 days of July. */}
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                            const status = attendanceData[day];
                            let statusClass = "bg-gray-100 text-gray-800"; // Default style
                            switch (status) {
                                case 'Present': statusClass = "bg-green-100 text-green-800"; break;
                                case 'Absent': statusClass = "bg-red-100 text-red-800"; break;
                                case 'Holiday': statusClass = "bg-blue-100 text-blue-800"; break;
                                case 'Weekend': statusClass = "bg-gray-200 text-gray-600"; break;
                                default: statusClass = "bg-white border border-gray-200 text-gray-900"; break;
                            }
                            // Add a highlight class if the day is 'today'.
                            const isTodayClass = day === today ? 'ring-2 ring-blue-500' : '';
                            return (
                                <div key={day} className={`h-12 flex items-center justify-center rounded-lg text-sm font-medium ${statusClass} ${isTodayClass}`}>
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---

// Defines the main component for the manager's dashboard.
export default function ManagerPanel() {
  // State for managing the list of leave applications. Initialized with hardcoded data.
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, name: 'Alex Ray', avatar: 'https://placehold.co/100x100/3498db/ffffff?text=AR', from: '2025-07-28', to: '2025-07-29', type: 'Sick Leave', reason: 'Fever and cold.', status: 'Pending' },
    { id: 2, name: 'Jordan Lee', avatar: 'https://placehold.co/100x100/2ecc71/ffffff?text=JL', from: '2025-08-10', to: '2025-08-15', type: 'Vacation', reason: 'Family trip to the mountains.', status: 'Pending' },
    { id: 3, name: 'Casey Morgan', avatar: 'https://placehold.co/100x100/e74c3c/ffffff?text=CM', from: '2025-07-18', to: '2025-07-18', type: 'Personal Day', reason: 'Attending a personal appointment.', status: 'Approved' },
  ]);

  // State for managing the daily attendance status of the team.
  const [teamDailyStatus, setTeamDailyStatus] = useState([
      { id: 1, name: 'Alex Ray', avatar: 'https://placehold.co/100x100/3498db/ffffff?text=AR', status: 'Present' },
      { id: 2, name: 'Jordan Lee', avatar: 'https://placehold.co/100x100/2ecc71/ffffff?text=JL', status: 'Present' },
      { id: 3, name: 'Casey Morgan', avatar: 'https://placehold.co/100x100/e74c3c/ffffff?text=CM', status: 'Absent' },
      { id: 4, name: 'Riley Smith', avatar: 'https://placehold.co/100x100/f1c40f/ffffff?text=RS', status: 'On Leave' },
      { id: 5, name: 'Taylor Green', avatar: 'https://placehold.co/100x100/9b59b6/ffffff?text=TG', status: 'Present' },
  ]);

  // State for managing tasks assigned to team members. It's an object where keys are employee IDs.
  const [teamTasks, setTeamTasks] = useState({
      1: [{ id: 101, text: 'Review frontend code for new feature', completed: true }],
      2: [{ id: 102, text: 'Deploy backend to staging server', completed: false }],
      3: [{ id: 103, text: 'Update UI mockups based on feedback', completed: false }],
      4: [],
      5: [{ id: 104, text: 'Prepare weekly report', completed: true }, {id: 105, text: 'Onboard new intern', completed: false}],
  });
  
  // NEW: State for full monthly attendance data for each employee.
  const [teamMonthlyAttendance, setTeamMonthlyAttendance] = useState({
      1: { 1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Weekend', 6: 'Weekend', 7: 'Present', 8: 'Present', 9: 'Present', 10: 'Present', 11: 'Present', 12: 'Weekend', 13: 'Weekend', 14: 'Present', 15: 'Holiday', 16: 'Present', 17: 'Present', 18: 'Present', 19: 'Weekend', 20: 'Weekend', 21: 'Present', 22: 'Present', 23: 'Present', 24: 'Present', 25: 'Present', 26: 'Weekend', 27: 'Weekend', 28: 'Absent', 29: 'Absent', 30: 'Present', 31: 'Present' },
      2: { 1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Weekend', 6: 'Weekend', 7: 'Present', 8: 'Present', 9: 'Present', 10: 'Present', 11: 'Present', 12: 'Weekend', 13: 'Weekend', 14: 'Present', 15: 'Holiday', 16: 'Absent', 17: 'Present', 18: 'Present', 19: 'Weekend', 20: 'Weekend', 21: 'Present', 22: 'Present', 23: 'Present', 24: 'Present', 25: 'Present', 26: 'Weekend', 27: 'Weekend', 28: 'Present', 29: 'Present', 30: 'Present', 31: 'Present' },
      3: { 1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Weekend', 6: 'Weekend', 7: 'Present', 8: 'Present', 9: 'Present', 10: 'Present', 11: 'Present', 12: 'Weekend', 13: 'Weekend', 14: 'Present', 15: 'Holiday', 16: 'Present', 17: 'Present', 18: 'Absent', 19: 'Weekend', 20: 'Weekend', 21: 'Present', 22: 'Present', 23: 'Present', 24: 'Present', 25: 'Present', 26: 'Weekend', 27: 'Weekend', 28: 'Present', 29: 'Present', 30: 'Present', 31: 'Present' },
      4: { 1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Weekend', 6: 'Weekend', 7: 'Present', 8: 'Present', 9: 'Present', 10: 'Present', 11: 'Present', 12: 'Weekend', 13: 'Weekend', 14: 'Present', 15: 'Holiday', 16: 'Present', 17: 'On Leave', 18: 'Present', 19: 'Weekend', 20: 'Weekend', 21: 'Present', 22: 'Present', 23: 'Present', 24: 'Present', 25: 'Present', 26: 'Weekend', 27: 'Weekend', 28: 'Present', 29: 'Present', 30: 'Present', 31: 'Present' },
      5: { 1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Weekend', 6: 'Weekend', 7: 'Present', 8: 'Present', 9: 'Present', 10: 'Present', 11: 'Present', 12: 'Weekend', 13: 'Weekend', 14: 'Present', 15: 'Holiday', 16: 'Present', 17: 'Present', 18: 'Present', 19: 'Weekend', 20: 'Weekend', 21: 'Present', 22: 'Present', 23: 'Present', 24: 'Present', 25: 'On Leave', 26: 'Weekend', 27: 'Weekend', 28: 'Present', 29: 'Present', 30: 'Present', 31: 'Present' },
  });

  // State to track which employee is currently selected in the task management section.
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(1);
  // State to hold the text of the new task being typed by the manager.
  const [newTaskText, setNewTaskText] = useState('');
  // State to track which task is currently being edited. Holds the task object or null.
  const [editingTask, setEditingTask] = useState(null); // Will hold { id, text }
  // NEW: State to manage the attendance modal's visibility.
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  // NEW: State to hold the data of the employee whose attendance is being viewed.
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Handler function to approve or deny a leave request.
  const handleRequestAction = (id, newStatus) => {
      setLeaveRequests(prevRequests => 
          prevRequests.map(req => 
              req.id === id ? { ...req, status: newStatus } : req
          )
      );
  };
  
  // Handler for the manager to manually update an employee's daily attendance.
  const handleStatusChange = (employeeId, newStatus) => {
      setTeamDailyStatus(currentStatus => 
        currentStatus.map(emp => 
            emp.id === employeeId ? { ...emp, status: newStatus } : emp
        )
      );
  };

  // Handler to assign a new task to the selected employee.
  const handleAssignTask = (e) => {
      e.preventDefault();
      if (!newTaskText.trim()) return;
      const newTask = { id: Date.now(), text: newTaskText, completed: false };
      setTeamTasks(currentTasks => ({
          ...currentTasks,
          [selectedEmployeeId]: [...(currentTasks[selectedEmployeeId] || []), newTask]
      }));
      setNewTaskText('');
  };

  // Handler to save the changes after editing a task.
  const handleUpdateTask = (e) => {
      e.preventDefault();
      if (!editingTask || !editingTask.text.trim()) return;
      setTeamTasks(currentTasks => {
          const updatedTasksForEmployee = currentTasks[selectedEmployeeId].map(task => 
              task.id === editingTask.id ? { ...task, text: editingTask.text } : task
          );
          return { ...currentTasks, [selectedEmployeeId]: updatedTasksForEmployee };
      });
      setEditingTask(null); 
  };
  
  // NEW: Handler to open the attendance modal for a specific employee.
  const handleViewAttendance = (employee) => {
    setViewingEmployee(employee); // Set the employee to be viewed.
    setIsAttendanceModalOpen(true); // Open the modal.
  };

  // --- Calculate stats on every render ---
  const pendingCount = leaveRequests.filter(req => req.status === 'Pending').length;
  const teamOnLeaveToday = teamDailyStatus.filter(emp => emp.status === 'On Leave').length;
  const presentTodayCount = teamDailyStatus.filter(emp => emp.status === 'Present').length;
  const selectedEmployee = teamDailyStatus.find(emp => emp.id === selectedEmployeeId);
  const tasksForSelectedEmployee = teamTasks[selectedEmployeeId] || [];

  // The JSX that defines the component's UI.
  return (
    // Main container with a gray background and padding.
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
            <p className="text-gray-600 mt-1">Review leave, attendance, and tasks for your team.</p>
        </div>

        {/* Statistics Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard icon="fa-hourglass-half" title="Pending Requests" value={pendingCount} color="bg-yellow-500" />
            <StatCard icon="fa-plane-departure" title="Team on Leave Today" value={teamOnLeaveToday} color="bg-blue-500" />
            <StatCard icon="fa-user-check" title="Present Today" value={presentTodayCount} color="bg-green-500" />
        </div>

        {/* Today's Attendance Section */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Today's Team Status</h2>
            </div>
            <div className="divide-y divide-gray-200">
                {teamDailyStatus.map(employee => (
                    // Make the entire row clickable to open the attendance modal.
                    <div key={employee.id} onClick={() => handleViewAttendance(employee)} className="p-4 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={employee.avatar} alt={`${employee.name}'s avatar`} />
                            <p className="ml-4 font-medium text-gray-900">{employee.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={employee.status} />
                            {employee.status !== 'On Leave' && (
                                <div className="flex items-center space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(employee.id, 'Present'); }} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs font-bold disabled:bg-gray-300" disabled={employee.status === 'Present'}>Present</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(employee.id, 'Absent'); }} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs font-bold disabled:bg-gray-300" disabled={employee.status === 'Absent'}>Absent</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Team Task Management Section */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
             <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Team Task Management</h2>
            </div>
            <div className="p-4 flex space-x-2 sm:space-x-4 border-b border-gray-200 overflow-x-auto">
                {teamDailyStatus.map(employee => (
                    <button
                        key={employee.id}
                        onClick={() => {setSelectedEmployeeId(employee.id); setEditingTask(null);}}
                        className={`flex-shrink-0 flex items-center space-x-2 p-2 rounded-lg transition-colors ${selectedEmployeeId === employee.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    >
                        <img src={employee.avatar} className="h-8 w-8 rounded-full" alt={`${employee.name}'s avatar`} />
                        <span className={`font-medium text-sm ${selectedEmployeeId === employee.id ? 'text-blue-700' : 'text-gray-700'}`}>{employee.name}</span>
                    </button>
                ))}
            </div>
            <div className="p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Tasks for {selectedEmployee?.name}</h3>
                <div className="space-y-2 mb-4">
                    {tasksForSelectedEmployee.length > 0 ? tasksForSelectedEmployee.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            {editingTask?.id === task.id ? (
                                <form onSubmit={handleUpdateTask} className="flex-grow flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={editingTask.text}
                                        onChange={(e) => setEditingTask({...editingTask, text: e.target.value})}
                                        className="flex-grow px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded-md text-xs">Save</button>
                                    <button type="button" onClick={() => setEditingTask(null)} className="px-3 py-1 bg-gray-500 text-white rounded-md text-xs">Cancel</button>
                                </form>
                            ) : (
                                <>
                                    <div className="flex items-center">
                                        <i className={`fas ${task.completed ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-300'} mr-3`}></i>
                                        <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</span>
                                    </div>
                                    <button onClick={() => setEditingTask({ id: task.id, text: task.text })} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs">Edit</button>
                                </>
                            )}
                        </div>
                    )) : <p className="text-sm text-gray-500">No tasks assigned.</p>}
                </div>
                <form onSubmit={handleAssignTask} className="flex gap-2">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder={`Assign a new task to ${selectedEmployee?.name}...`}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Assign</button>
                </form>
            </div>
        </div>

        {/* Leave Requests Table Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800">Pending Leave Requests</h2>
            </div>
            <div className="overflow-x-auto">
                {/* The table would be rendered here */}
            </div>
        </div>
      </div>
      
      {/* NEW: Render the Attendance Modal conditionally */}
      {isAttendanceModalOpen && viewingEmployee && (
          <AttendanceModal 
            employee={viewingEmployee} 
            attendanceData={teamMonthlyAttendance[viewingEmployee.id]}
            onClose={() => setIsAttendanceModalOpen(false)} 
          />
      )}

      {/* Style tag to import external fonts and stylesheets. */}
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
