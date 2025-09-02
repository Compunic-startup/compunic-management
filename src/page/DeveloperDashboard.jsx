import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, updateDoc, orderBy, Timestamp, getDocs, addDoc } from 'firebase/firestore';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- Helper Components ---
const timeAgo = (date) => {
  if (!date) return 'N/A';
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
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>{status}</span>;
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

function DeveloperDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- State Management ---
  const [myExpenses, setMyExpenses] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [testers, setTesters] = useState([]);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionError, setResolutionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [hrUser, setHrUser] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  
  // --- NEW: State for Task Details Modal ---
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  
  // --- Data Fetching ---
  useEffect(() => {
    const fetchAuxData = async () => {
      const testersQuery = query(collection(db, "users"), where("role", "==", "tester"));
      const testersSnapshot = await getDocs(testersQuery);
      setTesters(testersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const hrQuery = query(collection(db, "users"), where("role", "==", "hr"));
      const hrSnapshot = await getDocs(hrQuery);
      if (!hrSnapshot.empty) {
        setHrUser(hrSnapshot.docs[0].data());
      }
    };
    fetchAuxData();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const tokensQuery = query(collection(db, "tokens"), where("assignedDeveloper", "==", currentUser.email), orderBy("createdAt", "desc"));
    const unsubscribeTokens = onSnapshot(tokensQuery, (snapshot) => {
        setTokens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    });
    const requestsQuery = query(collection(db, "leaveRequests"), where("userId", "==", currentUser.uid), orderBy("appliedAt", "desc"));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => setLeaveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const tasksQuery = query(collection(db, "tasks"), where("assignedToId", "==", currentUser.uid), orderBy("deadline", "asc"));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => setMyTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", currentUser.uid), orderBy("submittedAt", "desc"));
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => setMyExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => {
        unsubscribeTokens();
        unsubscribeRequests();
        unsubscribeTasks();
        unsubscribeExpenses();
    };
  }, [currentUser]);

  // --- Filtering and Pagination Logic ---
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      const searchMatch = !searchTerm || token.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || token.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus === 'all' || token.status === filterStatus;
      return searchMatch && statusMatch;
    });
  }, [tokens, searchTerm, filterStatus]);
  const paginatedTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTokens.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTokens, currentPage]);
  const totalPages = Math.ceil(filteredTokens.length / ITEMS_PER_PAGE);

  // --- Event Handlers ---
  const handleLogout = async () => { try { await signOut(auth); navigate('/login'); } catch(e) { console.error(e) } };
  const handleOpenDetailsModal = (token) => { setSelectedToken(token); setIsDetailsModalOpen(true); };
  const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setSelectedToken(null); };
  const handleOpenResolveModal = (token) => { setSelectedToken(token); setIsResolveModalOpen(true); };
  const handleCloseResolveModal = () => { setIsResolveModalOpen(false); setResolutionNotes(''); setResolutionError(''); };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) { setResolutionError('Resolution notes are required.'); return; }
    setIsSubmitting(true); setResolutionError('');
    const tokenRef = doc(db, 'tokens', selectedToken.id);
    try {
      await updateDoc(tokenRef, { status: 'Resolved', resolutionNotes, resolvedAt: Timestamp.now(), resolvedBy: currentUser.email });
      const message = `*Token Resolved*\n\n*Ticket ID:* ${selectedToken.ticketId}\n*Resolved By:* ${currentUser.email}\n\n*Resolution Notes:*\n${resolutionNotes}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      handleCloseResolveModal();
    } catch (error) { console.error("Error updating token:", error); setResolutionError('An error occurred.'); }
    finally { setIsSubmitting(false); }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedLeaveDate = new Date(leaveDate + 'T00:00:00');
    if (selectedLeaveDate < today) {
      setLeaveError("You cannot apply for leave on a past date."); return;
    }
    if (!leaveReason.trim()) {
      setLeaveError("A reason for leave is required."); return;
    }
    setLeaveError('');
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "leaveRequests"), {
        userId: currentUser.uid, email: currentUser.email, leaveDate: leaveDate,
        reason: leaveReason, status: 'Pending', appliedAt: Timestamp.now(),
      });
      const message = `*Leave Application Submitted*\n\n*Employee:* ${currentUser.email}\n*Date:* ${leaveDate}\n*Reason:* ${leaveReason}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      setIsLeaveModalOpen(false); setLeaveReason('');
    } catch (error) { console.error("Error submitting leave request:", error); setLeaveError("Failed to submit request."); }
    finally { setIsSubmitting(false); }
  };

  const handleMarkTaskDone = async (task) => {
    const taskRef = doc(db, "tasks", task.id);
    try {
      await updateDoc(taskRef, {
        status: 'Done',
        completedAt: Timestamp.now(),
      });
      const message = `*Task Completed*\n\n*Task:* ${task.description}\n*Completed By:* ${currentUser.email}\n\nThis task has now been marked as done.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (error) {
      console.error("Error marking task as done:", error);
      alert("Failed to update the task status. Please try again.");
    }
  };
  
  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('My Tokens');
    sheet.columns = [
      { header: 'Ticket ID', key: 'ticketId', width: 20 }, { header: 'Status', key: 'status', width: 15 },
      { header: 'Project', key: 'projectName', width: 25 }, { header: 'Description', key: 'description', width: 50 },
      { header: 'Raised By', key: 'raisedBy', width: 30 }, { header: 'Date Raised', key: 'createdAt', width: 25 },
      { header: 'Resolution Notes', key: 'resolutionNotes', width: 50 },
    ];
    sheet.getRow(1).font = { bold: true };
    filteredTokens.forEach(token => {
      sheet.addRow({
        ticketId: token.ticketId, status: token.status, projectName: token.projectName,
        description: token.description, raisedBy: token.raisedBy,
        createdAt: token.createdAt ? token.createdAt.toDate().toLocaleString() : 'N/A',
        resolutionNotes: token.resolutionNotes || 'N/A'
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `My_Tokens_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(expenseAmount) || !expenseReason.trim()) {
      setExpenseError("Please enter a valid amount and reason.");
      return;
    }
    setExpenseError('');
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "expenses"), {
        userId: currentUser.uid,
        email: currentUser.email,
        amount: parseFloat(expenseAmount),
        reason: expenseReason,
        status: 'Pending',
        submittedAt: Timestamp.now(),
      });
      setIsExpenseModalOpen(false);
      setExpenseAmount('');
      setExpenseReason('');
    } catch (error) {
      console.error("Error submitting expense:", error);
      setExpenseError("Failed to submit expense claim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTaskDetailsModal = (task) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };
  const closeTaskDetailsModal = () => {
    setIsTaskDetailsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-lg font-bold">Developer Dashboard</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsExpenseModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-sm hover:bg-teal-600">Submit Expense</button>
              <button onClick={() => setIsLeaveModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600">Apply Leave</button>
              <button onClick={handleDownloadExcel} className="px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600">Report</button>
              <button onClick={handleLogout} className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Assigned" value={tokens.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
          <StatCard title="Open for Work" value={tokens.filter(t => t.status === 'Open').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Recently Resolved" value={tokens.filter(t => t.status === 'Resolved').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">My Assigned Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Search by Ticket ID or Project..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border border-slate-300 dark:border-slate-600 rounded-md w-full bg-white dark:bg-slate-700" />
            <select className="p-2 border border-slate-300 dark:border-slate-600 rounded-md w-full bg-white dark:bg-slate-700" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option> <option value="Open">Open</option> <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Raised By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {loading && <tr><td colSpan="6" className="text-center py-4 text-slate-500 dark:text-slate-400">Loading...</td></tr>}
                {!loading && paginatedTokens.map((token) => (
                  <tr key={token.id} onClick={() => handleOpenDetailsModal(token)} className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">{token.ticketId}</td>
                    <td className="px-6 py-4 text-sm font-medium">{token.projectName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{token.raisedBy}</td>
                    <td className="px-6 py-4"><StatusBadge status={token.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{timeAgo(token.createdAt.toDate())}</td>
                    <td className="px-6 py-4">
                      {token.status === 'Open' && (
                        <button onClick={(e) => { e.stopPropagation(); handleOpenResolveModal(token); }} className="bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-600">
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50">Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">My Assigned Tasks</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Deadline</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {myTasks.map((task) => (
                    <tr key={task.id} onClick={() => openTaskDetailsModal(task)} className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                        <td className="px-6 py-4 text-sm max-w-md truncate">{task.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{task.assignedBy}</td>
                        <td className="px-6 py-4 text-sm font-mono">{task.deadline}</td>
                        <td className="px-6 py-4"><TaskStatusBadge task={task} /></td>
                        <td className="px-6 py-4 text-center">
                          <div onClick={e => e.stopPropagation()}>
                            {task.status !== 'Done' ? (
                              <button onClick={() => handleMarkTaskDone(task)} className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/80">
                                Mark as Done
                              </button>
                            ) : (
                              <span className="flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                    </tr>
                ))}
                {myTasks.length === 0 && (<tr><td colSpan="5" className="text-center py-4 text-slate-500 dark:text-slate-400">No tasks assigned to you.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">My Expenses</h2>
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
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{exp.submittedAt.toDate().toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={exp.status} /></td>
                  </tr>
                ))}
                {myExpenses.length === 0 && (<tr><td colSpan="4" className="text-center py-4 text-slate-500 dark:text-slate-400">No expenses submitted.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">My Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Leave Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {leaveRequests.map(req => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 text-sm font-medium">{req.leaveDate}</td>
                    <td className="px-6 py-4 text-sm truncate max-w-sm">{req.reason}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
                {leaveRequests.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-4 text-slate-500 dark:text-slate-400">No leave requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {isDetailsModalOpen && selectedToken && (
          <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-1">Token Details</h2>
                <p className="font-mono text-sm text-slate-500 dark:text-slate-400 mb-4">{selectedToken.ticketId}</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</h4>
                        <p className="whitespace-pre-wrap">{selectedToken.description}</p>
                    </div>
                    {selectedToken.resolutionNotes && (
                         <div>
                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolution Notes</h4>
                            <p className="whitespace-pre-wrap">{selectedToken.resolutionNotes}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Status</h4><StatusBadge status={selectedToken.status} /></div>
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Project</h4><p>{selectedToken.projectName}</p></div>
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Raised By</h4><p>{selectedToken.raisedBy}</p></div>
                        <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Date Raised</h4><p>{selectedToken.createdAt.toDate().toLocaleString()}</p></div>
                        {selectedToken.resolvedAt && <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Date Resolved</h4><p>{selectedToken.resolvedAt.toDate().toLocaleString()}</p></div>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleCloseDetailsModal} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Close</button>
                </div>
              </div>
          </div>
      )}
      
      {isResolveModalOpen && selectedToken && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-2">Resolve Token</h2>
                <form onSubmit={handleResolveSubmit}>
                    <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} rows="5" className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" placeholder="e.g., Fixed the null pointer..."/>
                    {resolutionError && <p className="text-red-500 text-sm mt-2">{resolutionError}</p>}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={handleCloseResolveModal} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-500 text-white rounded-md">
                            {isSubmitting ? 'Submitting...' : 'Submit Resolution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">Apply for Leave</h2>
            <form onSubmit={handleLeaveSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date of Leave</label>
                <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
                <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows="4" className="mt-1 block w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"></textarea>
              </div>
              {leaveError && <p className="text-red-500 text-sm mb-4">{leaveError}</p>}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300">
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">Submit Expense Claim</h2>
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
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300">{isSubmitting ? 'Submitting...' : 'Submit Expense'}</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {isTaskDetailsModalOpen && selectedTask && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Task Details</h2>
            <div className="space-y-3">
              <p><span className="font-semibold">Assigned By:</span> {selectedTask.assignedBy}</p>
              <p><span className="font-semibold">Deadline:</span> {selectedTask.deadline}</p>
              <p className="whitespace-pre-wrap"><span className="font-semibold">Description:</span> {selectedTask.description}</p>
              <p className="flex items-center gap-2"><span className="font-semibold">Status:</span> <TaskStatusBadge task={selectedTask}/></p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeTaskDetailsModal} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperDashboard;