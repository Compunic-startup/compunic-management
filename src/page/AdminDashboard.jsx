import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, updateDoc, orderBy, Timestamp, getDocs, addDoc } from 'firebase/firestore';
import { Chart } from 'primereact/chart';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- Helper functions and components with Dark Mode ---
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  </div>
);
const StatusBadge = ({ status }) => {
  const statusClasses = { 
    'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', 
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', 
    'Closed': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', 
    'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', 
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>{status}</span>;
};
const RoleBadge = ({ role }) => {
  const roleClasses = { 
    'admin': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', 
    'developer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300', 
    'tester': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' 
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${roleClasses[role] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>{role}</span>;
};
const TaskStatusBadge = ({ task }) => {
    if (task.status === 'Done') {
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Done</span>;
    }
    const now = new Date();
    const deadlineDate = new Date(task.deadline + 'T00:00:00');
    now.setHours(0,0,0,0);
    const isOverdue = deadlineDate < now;
    if (isOverdue) {
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Overdue</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Assigned</span>;
};

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [allTokens, setAllTokens] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [taskError, setTaskError] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [myExpenses, setMyExpenses] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isExpenseDetailsModalOpen, setIsExpenseDetailsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubTokens = onSnapshot(query(collection(db, "tokens"), orderBy("createdAt", "desc")), (snap) => setAllTokens(snap.docs.map(d => ({...d.data(), id: d.id}))));
    const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) => setUsers(snap.docs.map(d => ({...d.data(), id: d.id}))));
    const unsubTasks = onSnapshot(query(collection(db, "tasks"), orderBy("deadline", "asc")), (snap) => setTasks(snap.docs.map(d => ({...d.data(), id: d.id}))));
    const unsubAllExpenses = onSnapshot(query(collection(db, "expenses"), orderBy("submittedAt", "desc")), (snap) => setAllExpenses(snap.docs.map(d => ({...d.data(), id: d.id}))));
    const unsubMyExpenses = onSnapshot(query(collection(db, "expenses"), where("userId", "==", currentUser.uid)), (snap) => setMyExpenses(snap.docs.map(d => ({...d.data(), id: d.id}))));
    setLoading(false);
    return () => { unsubTokens(); unsubUsers(); unsubTasks(); unsubAllExpenses(); unsubMyExpenses(); };
  }, [currentUser]);

  const projectChartData = useMemo(() => {
    const projectCounts = allTokens.reduce((acc, token) => {
      acc[token.projectName] = (acc[token.projectName] || 0) + 1;
      return acc;
    }, {});
    const labels = Object.keys(projectCounts);
    const data = Object.values(projectCounts);
    return { labels, datasets: [{ data, backgroundColor: ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'], hoverBackgroundColor: ['#4F46E5', '#D946EF', '#059669', '#D97706', '#2563EB'] }] };
  }, [allTokens]);
  
  const handleLogout = async () => { try { await signOut(auth); navigate('/login'); } catch(e) { console.error(e) } };
  const handleOpenDetailsModal = (token) => { setSelectedToken(token); setIsDetailsModalOpen(true); };
  const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setSelectedToken(null); };
  
  const handleDownloadExcel = async (range) => {
    setIsReportDropdownOpen(false);
    let tokensToExport = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (range) {
      case 'today': tokensToExport = allTokens.filter(token => token.createdAt.toDate() >= startOfToday); break;
      case 'last_week':
          const endOfLastWeek = new Date(startOfToday);
          endOfLastWeek.setDate(startOfToday.getDate() - now.getDay());
          const startOfLastWeek = new Date(endOfLastWeek);
          startOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
          tokensToExport = allTokens.filter(token => {
              const tokenDate = token.createdAt.toDate();
              return tokenDate >= startOfLastWeek && tokenDate < endOfLastWeek;
          });
          break;
      case 'last_month':
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const startOfLastMonth = new Date(endOfLastMonth);
          startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
          tokensToExport = allTokens.filter(token => {
              const tokenDate = token.createdAt.toDate();
              return tokenDate >= startOfLastMonth && tokenDate < endOfLastMonth;
          });
          break;
      default: tokensToExport = allTokens; break;
    }
    if (tokensToExport.length === 0) {
      alert(`No tokens found for the selected period: ${range.replace('_', ' ')}`); return;
    }
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Compunic Token Management';
    const usersSheet = workbook.addWorksheet('Users');
    usersSheet.columns = [
      { header: 'Email', key: 'email', width: 30 }, { header: 'Role', key: 'role', width: 15 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 }, { header: 'User ID', key: 'id', width: 35 },
    ];
    usersSheet.getRow(1).font = { bold: true };
    users.forEach(user => { usersSheet.addRow({ ...user }); });
    const tokensSheet = workbook.addWorksheet('Tokens');
    tokensSheet.columns = [
      { header: 'Ticket ID', key: 'ticketId', width: 20 }, { header: 'Status', key: 'status', width: 15 },
      { header: 'Project', key: 'projectName', width: 25 }, { header: 'Description', key: 'description', width: 50 },
      { header: 'Raised By', key: 'raisedBy', width: 30 }, { header: 'Assigned To', key: 'assignedDeveloper', width: 30 },
      { header: 'Date Raised', key: 'createdAt', width: 25 }, { header: 'Date Resolved', key: 'resolvedAt', width: 25 },
    ];
    tokensSheet.getRow(1).font = { bold: true };
    tokensToExport.forEach(token => {
      tokensSheet.addRow({
        ...token,
        createdAt: token.createdAt ? token.createdAt.toDate().toLocaleString() : 'N/A',
        resolvedAt: token.resolvedAt ? token.resolvedAt.toDate().toLocaleString() : 'N/A',
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `Compunic_${range}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!assignedTo || !taskDescription || !taskDeadline) {
      setTaskError("All fields are required."); return;
    }
    setTaskError('');
    setIsSubmittingTask(true);
    const assignedUser = users.find(u => u.id === assignedTo);
    try {
      await addDoc(collection(db, "tasks"), {
        assignedToId: assignedUser.id, assignedToEmail: assignedUser.email,
        description: taskDescription, deadline: taskDeadline,
        assignedBy: currentUser.email, assignedAt: Timestamp.now(), status: 'Assigned'
      });
      const message = `*New Task Assigned*\n\n*Assigned By:* ${currentUser.email}\n*Deadline:* ${taskDeadline}\n\n*Task:*\n${taskDescription}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      setIsTaskModalOpen(false); setTaskDescription(''); setAssignedTo('');
    } catch (error) { console.error("Error assigning task:", error); setTaskError("Failed to assign task."); }
    finally { setIsSubmittingTask(false); }
  };
  
  const handleNotifyAgain = (task) => {
    const message = `*Task Overdue Reminder*\n\n*To:* ${task.assignedToEmail}\n*Deadline was:* ${task.deadline}\n\n*Task:*\n${task.description}\n\nPlease provide an update.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleOpenEditTaskModal = (task) => {
    if (task.status === 'Done') return;
    setSelectedTask(task);
    setAssignedTo(task.assignedToId);
    setTaskDescription(task.description);
    setTaskDeadline(task.deadline);
    setTaskError('');
    setIsEditTaskModalOpen(true);
  };
  
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!assignedTo || !taskDescription || !taskDeadline) {
      setTaskError("All fields are required."); return;
    }
    setTaskError(''); setIsSubmittingTask(true);
    const assignedUser = users.find(u => u.id === assignedTo);
    const taskRef = doc(db, "tasks", selectedTask.id);
    try {
      await updateDoc(taskRef, {
        assignedToId: assignedUser.id,
        assignedToEmail: assignedUser.email,
        description: taskDescription,
        deadline: taskDeadline,
      });
      setIsEditTaskModalOpen(false);
    } catch (error) { console.error("Error updating task:", error); setTaskError("Failed to update task."); }
    finally { setIsSubmittingTask(false); }
  };
  
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(expenseAmount) || !expenseReason.trim()) {
      setExpenseError("Valid amount and reason required."); return;
    }
    setExpenseError(''); setIsSubmittingExpense(true);
    try {
      await addDoc(collection(db, "expenses"), {
        userId: currentUser.uid, email: currentUser.email,
        amount: parseFloat(expenseAmount), reason: expenseReason,
        status: 'Pending', submittedAt: Timestamp.now(),
      });
      setIsExpenseModalOpen(false); setExpenseAmount(''); setExpenseReason('');
    } catch (error) { console.error("Error submitting expense:", error); setExpenseError("Failed to submit claim."); }
    finally { setIsSubmittingExpense(false); }
  };
  
  const handleExpenseUpdate = async (expense, newStatus) => {
    const expenseRef = doc(db, "expenses", expense.id);
    await updateDoc(expenseRef, { status: newStatus });
    setIsExpenseDetailsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsExpenseModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-sm hover:bg-teal-600">Submit Expense</button>
              <button onClick={() => setIsTaskModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600">Assign Task</button>
              <div className="relative">
                <button onClick={() => setIsReportDropdownOpen(prev => !prev)} className="px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600">Report</button>
                {isReportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg z-20">
                    <ul className="py-1">
                      <li><button onClick={() => handleDownloadExcel('today')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Today</button></li>
                      <li><button onClick={() => handleDownloadExcel('yesterday')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Yesterday</button></li>
                      <li><button onClick={() => handleDownloadExcel('this_week')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">This Week</button></li>
                      <li><button onClick={() => handleDownloadExcel('last_week')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Last Week</button></li>
                      <li><button onClick={() => handleDownloadExcel('this_month')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">This Month</button></li>
                      <li><button onClick={() => handleDownloadExcel('last_month')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Last Month</button></li>
                      <li><button onClick={() => handleDownloadExcel('all')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">All Time</button></li>
                    </ul>
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Tokens" value={allTokens.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
          <StatCard title="Open" value={allTokens.filter(t => t.status === 'Open').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Resolved" value={allTokens.filter(t => t.status === 'Resolved').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Active Projects" value={projectChartData.labels.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Tokens by Project</h2>
            {loading ? <p className="text-center text-slate-500 dark:text-slate-400">Loading chart...</p> : allTokens.length > 0 ? <Chart type="pie" data={projectChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } } }} /> : <p className="text-center text-slate-500 py-8">No token data.</p>}
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">User Management</h2>
             <div className="overflow-x-auto max-h-64">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {!loading && users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 text-sm font-medium">{user.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.phoneNumber || 'N/A'}</td>
                                <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Master Token Log</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ticket</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Age</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {allTokens.map((token) => (
                            <tr key={token.id} onClick={() => handleOpenDetailsModal(token)} className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                                <td className="px-6 py-4"><p className="font-mono text-sm text-slate-600 dark:text-slate-400">{token.ticketId}</p></td>
                                <td className="px-6 py-4"><StatusBadge status={token.status} /></td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{timeAgo(token.createdAt.toDate())}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">All Assigned Tasks</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {tasks.map((task) => {
                  const isDone = task.status === 'Done';
                  const isOverdue = !isDone && new Date(task.deadline) < new Date().setHours(0,0,0,0);
                  return (
                    <tr key={task.id} onClick={() => handleOpenEditTaskModal(task)} className={`${isDone ? 'opacity-60' : 'cursor-pointer'} ${isOverdue ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      <td className="px-6 py-4 text-sm font-medium">{task.assignedToEmail}</td>
                      <td className="px-6 py-4 text-sm max-w-md truncate">{task.description}</td>
                      <td className="px-6 py-4 text-sm font-mono">{task.deadline}</td>
                      <td className="px-6 py-4"><TaskStatusBadge task={task} /></td>
                      <td className="px-6 py-4 text-center">
                        {isOverdue && (
                          <button onClick={(e) => { e.stopPropagation(); handleNotifyAgain(task); }} className="px-3 py-1 text-sm font-semibold text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200">
                            Notify Again
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                 {!loading && tasks.length === 0 && (<tr><td colSpan="5" className="text-center py-4 text-slate-500 dark:text-slate-400">No tasks assigned.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Master Expense Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Submitted By</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {allExpenses.map(exp => (
                  <tr key={exp.id} onClick={() => { setSelectedExpense(exp); setIsExpenseDetailsModalOpen(true); }} className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                    <td className="px-6 py-4 text-sm font-medium">{exp.email}</td>
                    <td className="px-6 py-4 text-sm">₹{exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">{exp.submittedAt.toDate().toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={exp.status} /></td>
                  </tr>
                ))}
                {allExpenses.length === 0 && (<tr><td colSpan="4" className="text-center py-4 text-slate-500 dark:text-slate-400">No expenses submitted yet.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">My Expenses</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {myExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 text-sm font-medium">₹{exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm max-w-sm truncate">{exp.reason}</td>
                    <td className="px-6 py-4 text-sm">{exp.submittedAt.toDate().toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={exp.status} /></td>
                  </tr>
                ))}
                {myExpenses.length === 0 && (<tr><td colSpan="4" className="text-center py-4 text-slate-500 dark:text-slate-400">You have not submitted any expenses.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {isDetailsModalOpen && selectedToken && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-200">Token Details</h2>
                <p className="font-mono text-sm text-slate-500 dark:text-slate-400 mb-4">{selectedToken.ticketId}</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</h4>
                        <p className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{selectedToken.description}</p>
                    </div>
                    {selectedToken.resolutionNotes && (
                         <div>
                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolution Notes</h4>
                            <p className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{selectedToken.resolutionNotes}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Status</h4><StatusBadge status={selectedToken.status} /></div>
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Project</h4><p>{selectedToken.projectName}</p></div>
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Raised By</h4><p>{selectedToken.raisedBy}</p></div>
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Assigned To</h4><p>{selectedToken.assignedDeveloper}</p></div>
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Date Raised</h4><p>{selectedToken.createdAt.toDate().toLocaleString()}</p></div>
                        {selectedToken.resolvedAt && <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Date Resolved</h4><p>{selectedToken.resolvedAt.toDate().toLocaleString()}</p></div>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleCloseDetailsModal} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Close</button>
                </div>
            </div>
        </div>
      )}
      
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-200">Assign a New Task</h2>
            <form onSubmit={handleAssignTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign To</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md">
                  <option value="" disabled>Select an employee</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.email} ({user.role})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Task Description</label>
                <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows="4" className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline</label>
                <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
              </div>
              {taskError && <p className="text-red-500 text-sm mb-4">{taskError}</p>}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmittingTask} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                  {isSubmittingTask ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditTaskModalOpen && selectedTask && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-200">Edit Task</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign To</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md">
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.email} ({user.role})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Task Description</label>
                <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows="4" className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline</label>
                <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
              </div>
              {taskError && <p className="text-red-500 text-sm mb-4">{taskError}</p>}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditTaskModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmittingTask} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                  {isSubmittingTask ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExpenseDetailsModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Expense Details</h2>
            <div className="space-y-3 text-slate-800 dark:text-slate-300">
              <p><span className="font-semibold">Employee:</span> {selectedExpense.email}</p>
              <p><span className="font-semibold">Amount:</span> ₹{selectedExpense.amount.toFixed(2)}</p>
              <p className="whitespace-pre-wrap"><span className="font-semibold">Reason:</span> {selectedExpense.reason}</p>
              <p><span className="font-semibold">Date:</span> {selectedExpense.submittedAt.toDate().toLocaleString()}</p>
              <p className="flex items-center gap-2"><span className="font-semibold">Status:</span> <StatusBadge status={selectedExpense.status}/></p>
            </div>
            {selectedExpense.status === 'Pending' && (
              <div className="mt-6 flex justify-end space-x-4">
                <button onClick={() => handleExpenseUpdate(selectedExpense, 'Rejected')} className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-md hover:bg-red-200">Reject</button>
                <button onClick={() => handleExpenseUpdate(selectedExpense, 'Approved')} className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-md hover:bg-green-200">Approve</button>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsExpenseDetailsModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-200">Submit Expense Claim</h2>
            <form onSubmit={handleSubmitExpense}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
                    <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason / Description</label>
                    <textarea value={expenseReason} onChange={e => setExpenseReason(e.target.value)} rows="4" className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"></textarea>
                </div>
                {expenseError && <p className="text-red-500 text-sm mb-4">{expenseError}</p>}
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Cancel</button>
                    <button type="submit" disabled={isSubmittingExpense} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300">{isSubmittingExpense ? 'Submitting...' : 'Submit Expense'}</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;