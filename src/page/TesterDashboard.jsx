import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, where, getDocs, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- Helper function for dynamic "Time Ago" dates ---
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

// --- Helper Components ---
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="bg-indigo-100 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusClasses = {
    'Open': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-slate-100 text-slate-600',
    'Pending': 'bg-amber-100 text-amber-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-slate-100 text-slate-800'}`}>{status}</span>;
};

const TaskStatusBadge = ({ task }) => {
    if (task.status === 'Done') {
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Done</span>;
    }
    const now = new Date();
    const deadlineDate = new Date(task.deadline + 'T00:00:00');
    now.setHours(0,0,0,0);
    const isOverdue = deadlineDate < now;
    if (isOverdue) {
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Assigned</span>;
};

function TesterDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- State Management ---
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [assignedDeveloper, setAssignedDeveloper] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDeveloper, setFilterDeveloper] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [myTasks, setMyTasks] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [myExpenses, setMyExpenses] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDevelopers = async () => {
      const developersQuery = query(collection(db, "users"), where("role", "==", "developer"));
      const devSnapshot = await getDocs(developersQuery);
      setDevelopers(devSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchDevelopers();
  }, []);
  
  useEffect(() => {
    if (!currentUser) return;
    const tokensQuery = query(collection(db, "tokens"), orderBy("createdAt", "desc"));
    const unsubTokens = onSnapshot(tokensQuery, (snapshot) => {
      setTokens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    
    const requestsQuery = query(collection(db, "leaveRequests"), where("userId", "==", currentUser.uid), orderBy("appliedAt", "desc"));
    const unsubRequests = onSnapshot(requestsQuery, (snapshot) => setLeaveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    const tasksQuery = query(collection(db, "tasks"), where("assignedToId", "==", currentUser.uid), orderBy("deadline", "asc"));
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => setMyTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    
    const myExpensesQuery = query(collection(db, "expenses"), where("userId", "==", currentUser.uid), orderBy("submittedAt", "desc"));
    const unsubMyExpenses = onSnapshot(myExpensesQuery, (snapshot) => setMyExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => { unsubTokens(); unsubRequests(); unsubTasks(); unsubMyExpenses(); };
  }, [currentUser]);

  // --- Filtering Logic ---
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      const searchMatch = !searchTerm || token.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || token.description.toLowerCase().includes(searchTerm.toLowerCase());
      const developerMatch = filterDeveloper === 'all' || token.assignedDeveloper === filterDeveloper;
      const statusMatch = filterStatus === 'all' || token.status === filterStatus;
      const dateMatch = !filterDate || new Date(token.createdAt.toDate()).toLocaleDateString() === new Date(filterDate).toLocaleDateString();
      return searchMatch && developerMatch && statusMatch && dateMatch;
    });
  }, [tokens, searchTerm, filterDeveloper, filterStatus, filterDate]);

  // --- Event Handlers ---
  const handleLogout = async () => { try { await signOut(auth); navigate('/login'); } catch(e) { console.error(e) } };
  
  const handleRaiseTokenSubmit = async (e) => {
    e.preventDefault();
    if (!projectName || !assignedDeveloper || !description) {
      setFormError('All fields are required.'); return;
    }
    setFormError(''); setIsSubmitting(true);
    try {
      const ticketId = `COMP-${Date.now().toString().slice(-6)}`;
      await addDoc(collection(db, "tokens"), { ticketId, projectName, assignedDeveloper, description, status: 'Open', raisedBy: currentUser.email, createdAt: Timestamp.now() });
      const message = `*New Token Raised*\n\n*Ticket ID:* ${ticketId}\n*To:* ${assignedDeveloper}\n*From:* ${currentUser.email}\n\n*Project:* ${projectName}\n*Description:*\n${description}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      setIsModalOpen(false); setProjectName(''); setAssignedDeveloper(''); setDescription('');
    } catch (error) { console.error("Error adding document:", error); setFormError('Failed to raise token.'); }
    finally { setIsSubmitting(false); }
  };
  
  const handleTokenStatusUpdate = async (tokenId, newStatus) => {
    const tokenRef = doc(db, 'tokens', tokenId);
    await updateDoc(tokenRef, { status: newStatus });
  };
  
  const handleReraiseClick = (tokenToReraise) => {
    setProjectName(tokenToReraise.projectName);
    setAssignedDeveloper(tokenToReraise.assignedDeveloper);
    setDescription(`(Re-raised from ticket ${tokenToReraise.ticketId})\n\n${tokenToReraise.description}`);
    setIsModalOpen(true);
  };
  
  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('All Tokens');
    sheet.columns = [
      { header: 'Ticket ID', key: 'ticketId', width: 20 }, { header: 'Status', key: 'status', width: 15 },
      { header: 'Project', key: 'projectName', width: 25 }, { header: 'Assigned To', key: 'assignedDeveloper', width: 30 },
      { header: 'Raised By', key: 'raisedBy', width: 30 }, { header: 'Date Raised', key: 'createdAt', width: 25 },
    ];
    sheet.getRow(1).font = { bold: true };
    filteredTokens.forEach(token => {
      sheet.addRow({
        ticketId: token.ticketId, status: token.status, projectName: token.projectName,
        assignedDeveloper: token.assignedDeveloper, raisedBy: token.raisedBy,
        createdAt: token.createdAt ? token.createdAt.toDate().toLocaleString() : 'N/A'
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `All_Tokens_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) { setLeaveError("A reason is required."); return; }
    setLeaveError(''); setIsSubmitting(true);
    try {
      await addDoc(collection(db, "leaveRequests"), {
        userId: currentUser.uid, email: currentUser.email, leaveDate,
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
      await updateDoc(taskRef, { status: 'Done', completedAt: Timestamp.now() });
      const message = `*Task Completed*\n\n*Task:* ${task.description}\n*Completed By:* ${currentUser.email}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (error) { console.error("Error marking task as done:", error); alert("Failed to update task status."); }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(expenseAmount) || !expenseReason.trim()) {
      setExpenseError("Please enter a valid amount and reason."); return;
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

  const openDetailsModal = (token) => {
    setSelectedToken(token);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedToken(null);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">Tester Dashboard</h1>
              <p className="text-xs text-slate-500">{currentUser?.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-lg shadow-sm hover:bg-indigo-600">Raise Token</button>
              <button onClick={() => setIsExpenseModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-sm hover:bg-teal-600">Submit Expense</button>
              <button onClick={() => setIsLeaveModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600">Apply Leave</button>
              <button onClick={handleDownloadExcel} disabled={loading || filteredTokens.length === 0} className="px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 disabled:bg-slate-300">Report</button>
              <button onClick={handleLogout} className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Tokens" value={tokens.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
          <StatCard title="Open" value={tokens.filter(t => t.status === 'Open').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Resolved" value={tokens.filter(t => t.status === 'Resolved').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Closed" value={tokens.filter(t => t.status === 'Closed').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">All Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border border-slate-300 rounded-md w-full" />
            <select className="p-2 border border-slate-300 rounded-md w-full" value={filterDeveloper} onChange={e => setFilterDeveloper(e.target.value)}>
              <option value="all">All Developers</option>
              {developers.map(dev => (<option key={dev.id} value={dev.email}>{dev.email}</option>))}
            </select>
            <select className="p-2 border border-slate-300 rounded-md w-full" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option> <option value="Open">Open</option>
              <option value="Resolved">Resolved</option> <option value="Closed">Closed</option>
            </select>
            <input type="date" className="p-2 border border-slate-300 rounded-md w-full" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Age</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading && <tr><td colSpan="5" className="text-center py-4 text-slate-500">Loading...</td></tr>}
                {!loading && filteredTokens.map((token) => (
                  <tr key={token.id} onClick={() => openDetailsModal(token)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-slate-600">{token.ticketId}</p>
                      <p className="text-sm text-slate-800 font-medium truncate max-w-xs">{token.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{token.assignedDeveloper}</td>
                    <td className="px-6 py-4"><StatusBadge status={token.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{timeAgo(token.createdAt.toDate())}</td>
                    <td className="px-6 py-4 text-center">
                      <div onClick={e => e.stopPropagation()} className="flex justify-center space-x-2">
                        {token.status === 'Resolved' && (
                          <>
                            <button onClick={() => handleTokenStatusUpdate(token.id, 'Closed')} className="font-semibold text-green-600 hover:text-green-800">Close</button>
                            <button onClick={() => handleTokenStatusUpdate(token.id, 'Open')} className="font-semibold text-red-600 hover:text-red-800">Re-open</button>
                          </>
                        )}
                        {token.status === 'Closed' && (
                          <button onClick={() => handleReraiseClick(token)} className="font-semibold text-indigo-600 hover:text-indigo-800">Re-raise</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">My Assigned Tasks</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assigned By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Deadline</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {myTasks.map((task) => (
                    <tr key={task.id}>
                        <td className="px-6 py-4 text-sm max-w-md truncate">{task.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{task.assignedBy}</td>
                        <td className="px-6 py-4 text-sm font-mono">{task.deadline}</td>
                        <td className="px-6 py-4"><TaskStatusBadge task={task} /></td>
                        <td className="px-6 py-4 text-center">
                          {task.status !== 'Done' && (
                            <button onClick={() => handleMarkTaskDone(task)} className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200">
                              Mark as Done
                            </button>
                          )}
                        </td>
                    </tr>
                ))}
                {myTasks.length === 0 && (<tr><td colSpan="5" className="text-center py-4 text-slate-500">No tasks assigned to you.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">My Expenses</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {myExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 text-sm font-medium">₹{exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm max-w-sm truncate">{exp.reason}</td>
                    <td className="px-6 py-4 text-sm">{exp.submittedAt.toDate().toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={exp.status} /></td>
                  </tr>
                ))}
                {myExpenses.length === 0 && (<tr><td colSpan="4" className="text-center py-4 text-slate-500">You have not submitted any expenses.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">My Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Leave Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {leaveRequests.map(req => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{req.leaveDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-sm">{req.reason}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
                {leaveRequests.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-4 text-slate-500">You have no leave requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">Raise a New Token</h2>
            <form onSubmit={handleRaiseTokenSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700">Project Name</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700">Assign to Developer</label>
                 <select value={assignedDeveloper} onChange={(e) => setAssignedDeveloper(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md">
                    <option value="" disabled>Select a developer</option>
                    {developers.map(dev => (<option key={dev.id} value={dev.email}>{dev.email}</option>))}
                 </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md"></textarea>
              </div>
              {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 font-semibold rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-md disabled:bg-indigo-300">
                  {isSubmitting ? 'Submitting...' : 'Submit Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">Apply for Leave</h2>
            <form onSubmit={handleLeaveSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700">Date of Leave</label>
                <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700">Reason</label>
                <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows="4" className="mt-1 block w-full p-2 border border-slate-300 rounded-md"></textarea>
              </div>
              {leaveError && <p className="text-red-500 text-sm mb-4">{leaveError}</p>}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300">
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">Submit Expense Claim</h2>
            <form onSubmit={handleSubmitExpense}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700">Amount (₹)</label>
                    <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700">Reason / Description</label>
                    <textarea value={expenseReason} onChange={e => setExpenseReason(e.target.value)} rows="4" className="mt-1 block w-full p-2 border border-slate-300 rounded-md"></textarea>
                </div>
                {expenseError && <p className="text-red-500 text-sm mb-4">{expenseError}</p>}
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={isSubmittingExpense} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300">{isSubmittingExpense ? 'Submitting...' : 'Submit Expense'}</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedToken && (
        <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-1">Token Details</h2>
            <p className="font-mono text-sm text-slate-500 mb-4">{selectedToken.ticketId}</p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                    <p className="text-slate-800 whitespace-pre-wrap">{selectedToken.description}</p>
                </div>
                {selectedToken.resolutionNotes && (
                     <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Resolution Notes</h4>
                        <p className="text-slate-800 whitespace-pre-wrap">{selectedToken.resolutionNotes}</p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div><h4 className="text-sm font-bold text-slate-500">Status</h4><StatusBadge status={selectedToken.status} /></div>
                    <div><h4 className="text-sm font-bold text-slate-500">Project</h4><p>{selectedToken.projectName}</p></div>
                    <div><h4 className="text-sm font-bold text-slate-500">Raised By</h4><p>{selectedToken.raisedBy}</p></div>
                    <div><h4 className="text-sm font-bold text-slate-500">Assigned To</h4><p>{selectedToken.assignedDeveloper}</p></div>
                    <div><h4 className="text-sm font-bold text-slate-500">Date Raised</h4><p>{selectedToken.createdAt.toDate().toLocaleString()}</p></div>
                    {selectedToken.resolvedAt && <div><h4 className="text-sm font-bold text-slate-500">Date Resolved</h4><p>{selectedToken.resolvedAt.toDate().toLocaleString()}</p></div>}
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={closeDetailsModal} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TesterDashboard;