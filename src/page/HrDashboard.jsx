import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, setDoc, getDocs, Timestamp, updateDoc, addDoc, orderBy } from 'firebase/firestore';
import { Chart } from 'primereact/chart';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
// --- Helper Components ---
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-4 rounded-lg shadow-sm flex items-center space-x-3`}>
    <div className={`p-2 rounded-full ${color} text-white font-bold flex items-center justify-center h-8 w-8 text-xs`}>{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusClasses = { 
    'Present': 'bg-green-100 text-green-800', 
    'Absent': 'bg-red-100 text-red-800', 
    'Leave': 'bg-amber-100 text-amber-800',
    'Pending': 'bg-amber-100 text-amber-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800'
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

function HrDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- State Management ---
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [attendanceReason, setAttendanceReason] = useState('');
  const [formError, setFormError] = useState('');
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [myExpenses, setMyExpenses] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isExpenseDetailsModalOpen, setIsExpenseDetailsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  // --- Data Fetching ---
  useEffect(() => {
    if (!currentUser) return;
    const employeesQuery = query(collection(db, "users"), where("role", "in", ["developer", "tester", "hr"]));
    const unsubEmployees = onSnapshot(employeesQuery, (snapshot) => setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    
    const attendanceQuery = query(collection(db, "attendance"), where("date", "==", selectedDate));
    const unsubAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      setAttendance(snapshot.docs.reduce((acc, doc) => { acc[doc.data().userId] = doc.data(); return acc; }, {}));
      setLoading(false);
    });
    
    const pendingRequestsQuery = query(collection(db, "leaveRequests"), where("status", "==", "Pending"), where("role", "in", ["developer", "tester"]));
    const unsubPending = onSnapshot(pendingRequestsQuery, (snapshot) => setPendingLeaveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    const myRequestsQuery = query(collection(db, "leaveRequests"), where("userId", "==", currentUser.uid), orderBy("appliedAt", "desc"));
    const unsubMyRequests = onSnapshot(myRequestsQuery, (snapshot) => setMyLeaveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    const myTasksQuery = query(collection(db, "tasks"), where("assignedToId", "==", currentUser.uid), orderBy("deadline", "asc"));
    const unsubMyTasks = onSnapshot(myTasksQuery, (snapshot) => setMyTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    const allExpensesQuery = query(collection(db, "expenses"), orderBy("submittedAt", "desc"));
    const unsubAllExpenses = onSnapshot(allExpensesQuery, (snapshot) => setAllExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    const myExpensesQuery = query(collection(db, "expenses"), where("userId", "==", currentUser.uid), orderBy("submittedAt", "desc"));
    const unsubMyExpenses = onSnapshot(myExpensesQuery, (snapshot) => setMyExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => { unsubEmployees(); unsubAttendance(); unsubPending(); unsubMyRequests(); unsubMyTasks(); unsubAllExpenses(); unsubMyExpenses(); };
  }, [selectedDate, currentUser]);
  
  const filteredEmployees = useMemo(() => employees.filter(emp => emp.email.toLowerCase().includes(searchTerm.toLowerCase())), [employees, searchTerm]);

  // --- Event Handlers ---
  const handleLogout = async () => { try { await signOut(auth); navigate('/login'); } catch(e) { console.error(e) } };

  const openMarkingModal = (employee) => {
    setSelectedEmployee(employee);
    setAttendanceStatus(attendance[employee.id]?.status || 'Present');
    setAttendanceReason(attendance[employee.id]?.reason || '');
    setFormError('');
    setIsMarkingModalOpen(true);
  };
  
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (attendanceStatus === 'Leave' && !attendanceReason.trim()) {
      setFormError('A reason is required for Leave status.'); return;
    }
    setFormError('');
    const docId = `${selectedDate}_${selectedEmployee.id}`;
    const attendanceRef = doc(db, "attendance", docId);
    try {
      await setDoc(attendanceRef, {
        userId: selectedEmployee.id, email: selectedEmployee.email, date: selectedDate,
        status: attendanceStatus, reason: attendanceReason, markedBy: currentUser.email,
        timestamp: Timestamp.now()
      }, { merge: true });
      setIsMarkingModalOpen(false);
    } catch(error) { console.error("Error marking attendance:", error); setFormError('Failed to save.'); }
  };

  const openAnalysisModal = (employee) => { setSelectedEmployee(employee); setIsAnalysisModalOpen(true); };

  const handleLeaveRequestUpdate = async (request, newStatus) => {
    const requestRef = doc(db, "leaveRequests", request.id);
    try {
      await updateDoc(requestRef, { status: newStatus, reviewedBy: currentUser.email, reviewedAt: Timestamp.now() });
      if (newStatus === 'Approved') {
        const attendanceDocId = `${request.leaveDate}_${request.userId}`;
        const attendanceRef = doc(db, "attendance", attendanceDocId);
        await setDoc(attendanceRef, {
          userId: request.userId, email: request.email, date: request.leaveDate,
          status: 'Leave', reason: `Approved: ${request.reason}`,
          markedBy: 'System (Auto)', timestamp: Timestamp.now()
        }, { merge: true });
      }
      const message = `*Leave Request Update*\n\nYour leave request for *${request.leaveDate}* has been *${newStatus}*.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (error) { console.error("Error updating leave request:", error); }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) { setLeaveError("A reason is required."); return; }
    setLeaveError(''); setIsSubmitting(true);
    try {
      await addDoc(collection(db, "leaveRequests"), {
        userId: currentUser.uid, email: currentUser.email, leaveDate,
        reason: leaveReason, status: 'Pending', appliedAt: Timestamp.now(), role: 'hr'
      });
      const message = `*HR Leave Application Submitted*\n\n*Employee:* ${currentUser.email}\n*Date:* ${leaveDate}\n*Reason:* ${leaveReason}\n\nThis is for record-keeping. Please seek manual approval from management.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      setIsLeaveModalOpen(false); setLeaveReason('');
    } catch (error) { console.error("Error submitting leave request:", error); setLeaveError("Failed to submit."); }
    finally { setIsSubmitting(false); }
  };

  const handleMarkTaskDone = async (task) => {
    const taskRef = doc(db, "tasks", task.id);
    try {
      await updateDoc(taskRef, { status: 'Done', completedAt: Timestamp.now() });
      const message = `*Task Completed*\n\n*Task:* ${task.description}\n*Completed By:* ${currentUser.email}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (error) { console.error("Error marking task done:", error); alert("Failed to update task."); }
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
  
  const handleExpenseUpdate = async (expense, newStatus) => {
    const expenseRef = doc(db, "expenses", expense.id);
    await updateDoc(expenseRef, { status: newStatus });
    setIsExpenseDetailsModalOpen(false);
  };
   const handleDownloadAttendanceExcel = async (range) => {
    setIsReportDropdownOpen(false);
    let attendanceToExport = [];
    const now = new Date();
    
    // Use the same 'YYYY-MM-DD' format as our selectedDate state
    const todayStr = new Date().toISOString().split('T')[0];
    
    let attendanceQuery;

    try {
      switch(range) {
        case 'today':
          attendanceQuery = query(collection(db, "attendance"), where("date", "==", todayStr));
          break;
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          attendanceQuery = query(collection(db, "attendance"), where("timestamp", ">=", startOfMonth), orderBy("timestamp", "asc"));
          break;
        default:
          alert("Invalid report range selected.");
          return;
      }

      const querySnapshot = await getDocs(attendanceQuery);
      attendanceToExport = querySnapshot.docs.map(doc => doc.data());

      if (attendanceToExport.length === 0) {
          alert(`No attendance records found for this ${range}.`);
          return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(`Attendance Report - ${range}`);
      
      sheet.columns = [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Employee Email', key: 'email', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Reason', key: 'reason', width: 40 },
        { header: 'Marked By', key: 'markedBy', width: 30 },
      ];
      sheet.getRow(1).font = { bold: true };

      // Sort the data by date and then by email for a clean report
      attendanceToExport.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        if (a.email < b.email) return -1;
        if (a.email > b.email) return 1;
        return 0;
      });

      attendanceToExport.forEach(record => {
          sheet.addRow({
              date: record.date,
              email: record.email,
              status: record.status,
              reason: record.reason || 'N/A',
              markedBy: record.markedBy
          });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, `Attendance_Report_${range}_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
        console.error("Error generating attendance report: ", error);
        alert("Failed to generate the report. Please check the console for errors.");
    }
  };
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-md sticky top-0 z-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">HR Dashboard</h1>
              <p className="text-xs text-slate-500">{currentUser?.email}</p>
            </div>
            {/* --- REPLACE THE BUTTONS DIV WITH THIS --- */}
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsExpenseModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-sm hover:bg-teal-600">Submit Expense</button>
              <button onClick={() => setIsLeaveModalOpen(true)} className="px-3 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600">Apply Leave</button>
              <div className="relative">
                <button
                  onClick={() => setIsReportDropdownOpen(prev => !prev)}
                  className="px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600"
                >
                  Report
                </button>
                {isReportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                    <ul className="py-1">
                      <li><button onClick={() => handleDownloadAttendanceExcel('today')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Today's Attendance</button></li>
                      <li><button onClick={() => handleDownloadAttendanceExcel('month')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">This Month's Attendance</button></li>
                    </ul>
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600">Sign Out</button>
            </div>
            {/* --- END REPLACEMENT --- */}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Daily Attendance</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input type="text" placeholder="Filter by employee email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border border-slate-300 rounded-md shadow-sm w-full md:w-64"/>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border border-slate-300 rounded-md shadow-sm"/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status for {selectedDate}</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading && <tr><td colSpan="3" className="text-center py-4 text-slate-500">Loading...</td></tr>}
                {!loading && filteredEmployees.map((employee) => (
                  <tr key={employee.id} onClick={() => openAnalysisModal(employee)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{employee.email}</p>
                      <p className="text-sm text-slate-500 capitalize">{employee.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      {attendance[employee.id] ? <StatusBadge status={attendance[employee.id].status} /> : <span className="text-slate-400">Not Marked</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={(e) => { e.stopPropagation(); openMarkingModal(employee); }} className="px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">
                        Mark / Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Leave Requests</h2>
          <div className="overflow-x-auto">
            {pendingLeaveRequests.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Leave Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Reason</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {pendingLeaveRequests.map(req => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 text-sm font-medium">{req.email}</td>
                      <td className="px-6 py-4 text-sm">{req.leaveDate}</td>
                      <td className="px-6 py-4 text-sm max-w-sm truncate">{req.reason}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button onClick={() => handleLeaveRequestUpdate(req, 'Approved')} className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200">Approve</button>
                        <button onClick={() => handleLeaveRequestUpdate(req, 'Rejected')} className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (<p className="text-center py-4 text-slate-500">No pending leave requests.</p>)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Master Expense Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Submitted By</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {allExpenses.map(exp => (
                  <tr key={exp.id} onClick={() => { setSelectedExpense(exp); setIsExpenseDetailsModalOpen(true); }} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 text-sm font-medium">{exp.email}</td>
                    <td className="px-6 py-4 text-sm">₹{exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">{exp.submittedAt.toDate().toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={exp.status} /></td>
                  </tr>
                ))}
                {allExpenses.length === 0 && (<tr><td colSpan="4" className="text-center py-4 text-slate-500">No expenses submitted yet.</td></tr>)}
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
                {myLeaveRequests.map(req => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{req.leaveDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-sm">{req.reason}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
                {myLeaveRequests.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-4 text-slate-500">You have not applied for any leave.</td></tr>
                )}
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
      </main>
      
      {isMarkingModalOpen && (
         <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-2">Mark Attendance</h2>
                <p className="text-sm text-slate-600 mb-6">For {selectedEmployee?.email} on {selectedDate}</p>
                <form onSubmit={handleMarkAttendance}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <select value={attendanceStatus} onChange={(e) => setAttendanceStatus(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md">
                            <option>Present</option><option>Absent</option><option>Leave</option>
                        </select>
                    </div>
                    {(attendanceStatus === 'Absent' || attendanceStatus === 'Leave') && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700">Reason {attendanceStatus === 'Leave' && <span className="text-red-500">*</span>}</label>
                            <textarea value={attendanceReason} onChange={(e) => setAttendanceReason(e.target.value)} rows="3" className="mt-1 block w-full p-2 border border-slate-300 rounded-md"></textarea>
                        </div>
                    )}
                    {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={() => setIsMarkingModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
      {isAnalysisModalOpen && selectedEmployee && (
        <AnalysisModal 
          employee={selectedEmployee}
          onClose={() => setIsAnalysisModalOpen(false)}
        />
      )}

      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-20 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
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

      {isExpenseDetailsModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Expense Details</h2>
            <div className="space-y-3">
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
              <button onClick={() => setIsExpenseDetailsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AnalysisModal = ({ employee, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const analysisQuery = query(
        collection(db, "attendance"),
        where("userId", "==", employee.id),
        where("timestamp", ">=", firstDay),
        where("timestamp", "<=", lastDay)
      );
      const querySnapshot = await getDocs(analysisQuery);
      setMonthlyRecords(querySnapshot.docs.map(doc => doc.data()));
      setIsLoading(false);
    };
    fetchMonthlyData();
  }, [currentDate, employee.id]);
  const { calendarData, chartData, summary } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const statusMap = monthlyRecords.reduce((acc, rec) => {
      const recordDate = new Date(rec.date + 'T00:00:00');
      acc[recordDate.getDate()] = {status: rec.status, reason: rec.reason};
      return acc;
    }, {});
    let calendar = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, ...statusMap[i + 1] }));
    let emptyCells = Array.from({ length: firstDayOfWeek }, () => ({day: null}));
    calendar = [...emptyCells, ...calendar];
    const counts = monthlyRecords.reduce((acc, rec) => {
      acc[rec.status] = (acc[rec.status] || 0) + 1;
      return acc;
    }, { 'Present': 0, 'Absent': 0, 'Leave': 0 });
    const chart = {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor: ['#10B981', '#EF4444', '#F59E0B'], hoverBackgroundColor: ['#059669', '#DC2626', '#D97706'] }]
    };
    return { calendarData: calendar, chartData: chart, summary: counts };
  }, [monthlyRecords, currentDate]);
  const changeMonth = (delta) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };
  return (
    <div className="fixed inset-0 z-20  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Monthly Analysis</h2>
            <p className="text-indigo-600">{employee.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-200">{"<"}</button>
            <span className="font-semibold w-32 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-200">{">"}</button>
          </div>
        </div>
        {isLoading ? <p>Loading data...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
            <div className="md:col-span-2">
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-bold text-slate-500">{day}</div>)}
                {calendarData.map((d, i) => (
                  <div key={i} className={`h-16 flex flex-col items-center justify-center rounded text-xs p-1 ${d.status === 'Present' ? 'bg-green-400 text-white' : d.status === 'Absent' ? 'bg-red-400 text-white' : d.status === 'Leave' ? 'bg-amber-400 text-white' : 'bg-slate-100'}`}>
                    <span className="font-bold text-base">{d.day}</span>
                    <span className="truncate w-full text-center">{d.reason}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <h3 className="font-semibold text-slate-700">Summary</h3>
              <div className="flex-grow flex items-center justify-center">
                {monthlyRecords.length > 0 ? <Chart type="pie" data={chartData} /> : <p className="text-slate-500">No records for this month.</p>}
              </div>
              <div className="space-y-2">
                <StatCard title="Present" value={summary.Present} icon={"P"} color="bg-green-500" />
                <StatCard title="Absent" value={summary.Absent} icon={"A"} color="bg-red-500" />
                <StatCard title="Leave" value={summary.Leave} icon={"L"} color="bg-amber-500" />
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Close</button>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;