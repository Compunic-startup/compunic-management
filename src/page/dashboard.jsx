import React, { useState, useEffect } from 'react';
import LeaveModal from './leaveModal';

// --- Reusable Components ---

const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className={`text-4xl font-bold ${color}`}>{value}</div>
        <div className="text-gray-500 mt-2 flex items-center justify-center">
            <i className={`fas ${icon} mr-2`}></i>
            <span>{title}</span>
        </div>
    </div>
);

const CalendarDay = ({ day, status }) => {
    let statusClass = "bg-gray-100 text-gray-800";
    if (day) {
        switch (status) {
            case 'Present': statusClass = "bg-green-100 text-green-800"; break;
            case 'Absent': statusClass = "bg-red-100 text-red-800"; break;
            case 'Holiday': statusClass = "bg-blue-100 text-blue-800"; break;
            case 'Weekend': statusClass = "bg-gray-200 text-gray-600"; break;
            default: statusClass = "bg-white border border-gray-200 text-gray-900"; break;
        }
    }
    return (
        <div className={`h-12 flex items-center justify-center rounded-lg text-sm font-medium ${statusClass}`}>
            {day}
        </div>
    );
};

const AttendanceLegend = () => (
    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-100 mr-2"></span>Present</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-100 mr-2"></span>Absent</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-100 mr-2"></span>Holiday</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-200 mr-2"></span>Weekend</div>
    </div>
);

// --- Daily Attendance and Task Log Component ---
const DailyLog = () => {
    const [status, setStatus] = useState('Clocked Out');
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [clockInTime, setClockInTime] = useState(null);

    const handleClockIn = () => {
        setStatus('Clocked In');
        setClockInTime(new Date());
    };

    const handleClockOut = () => {
        const clockOutTime = new Date();
        const duration = clockInTime ? Math.round((clockOutTime - clockInTime) / 1000 / 60) : 0; // Duration in minutes
        const completedTasks = tasks.filter(task => task.completed);

        // Prepare email body
        const subject = `Daily Report - ${new Date().toLocaleDateString()}`;
        let body = `Hi Manager,\n\nHere is my report for today.\n\n`;
        body += `Clock In: ${clockInTime.toLocaleTimeString()}\n`;
        body += `Clock Out: ${clockOutTime.toLocaleTimeString()}\n`;
        body += `Total Duration: ${duration} minutes\n\n`;
        body += `Tasks Completed:\n`;
        completedTasks.forEach(task => {
            body += `- ${task.text}\n`;
        });

        // Inform user and open email client
        alert("Your email client is opening with the daily report. Please review and send.");
        window.location.href = `mailto:manager@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Reset state
        setStatus('Clocked Out');
        setClockInTime(null);
        setTasks([]);
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg mt-8">
            <div className="p-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Daily Attendance & Task Log</h2>
                {status === 'Clocked Out' ? (
                    <button onClick={handleClockIn} className="px-5 py-2 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 font-semibold flex items-center">
                        <i className="fas fa-play-circle mr-2"></i>Clock In
                    </button>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="font-semibold text-gray-600">Clocked In at:</span>
                            <span className="ml-2 font-bold text-green-700 bg-green-100 px-2 py-1 rounded">{clockInTime.toLocaleTimeString()}</span>
                        </div>
                        <button onClick={handleClockOut} className="px-5 py-2 text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 font-semibold flex items-center">
                            <i className="fas fa-stop-circle mr-2"></i>Clock Out & Send Report
                        </button>
                    </div>
                )}
            </div>
            {status === 'Clocked In' && (
                <div className="p-6">
                    <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task for today..."
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add</button>
                    </form>
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <div key={task.id} onClick={() => toggleTask(task.id)} className="flex items-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                <input type="checkbox" checked={task.completed} readOnly className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className={`ml-3 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Dashboard Component ---

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const attendanceData = {
        1: 'Present', 2: 'Present', 3: 'Present', 4: 'Present', 5: 'Weekend', 6: 'Weekend',
        7: 'Present', 8: 'Absent', 9: 'Present', 10: 'Present', 11: 'Present', 12: 'Weekend', 13: 'Weekend',
        14: 'Present', 15: 'Holiday', 16: 'Present', 17: 'Present', 18: 'Present', 19: 'Weekend', 20: 'Weekend',
        21: 'Present', 22: 'Present', 23: 'Present', 24: 'Present', 25: 'Present', 26: 'Weekend', 27: 'Weekend',
        28: 'Present', 29: 'Present', 30: 'Present', 31: 'Absent'
    };
    
    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
                    <p className="text-gray-600 mt-1">Your personal leave and attendance overview.</p>
                </div>

                {/* Daily Log component added here */}
                <DailyLog />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                    <StatCard title="Privilege Leave (PL)" value="0" color="text-blue-600" icon="fa-briefcase" />
                    <StatCard title="Casual Leave (CL)" value="0" color="text-green-600" icon="fa-coffee" />
                    <StatCard title="Sick Leave (SL)" value="0" color="text-orange-600" icon="fa-notes-medical" />
                </div>

                <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Your Leave Applications</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-5 py-2 text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 font-semibold flex items-center justify-center transition-colors"
                        >
                            <i className="fas fa-plus-circle mr-2"></i>
                            Apply for Leave
                        </button>
                    </div>

                    {isModalOpen && <LeaveModal onClose={() => setIsModalOpen(false)} />}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 text-gray-700">N/A</td>
                                    <td className="px-6 py-4 text-gray-700">N/A</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            No Applications
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg mt-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Attendance Review - July 2025</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-3">
                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            <CalendarDay /> 
                            <CalendarDay />
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <CalendarDay key={day} day={day} status={attendanceData[day]} />
                            ))}
                        </div>
                        <AttendanceLegend />
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                }
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes scaleIn {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
