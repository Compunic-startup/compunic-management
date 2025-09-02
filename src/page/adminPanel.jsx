import React, { use, useEffect, useState } from "react";
import { apiGet, apiPost, apiPut } from "../services/apiRequestResponse";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Initial data structure for roles and their permissions
// const initialRolesAndPermissions = {
//   Admin: {
//     icon: "👑",
//     permissions: {
//       "Manage Users": true,
//       "Manage Roles & Permissions": true,
//       "Manage System Settings": true,
//       "View All Company Reports": true,
//       "Approve Leave": true,
//       "Approve Team Leave": true,
//       "Apply for Leave": true,
//       "View Own Records": true,
//       "Mark Attendance": true,
//     },
//   },
//   "HR (Human Resources)": {
//     icon: "🧑‍💼",
//     permissions: {
//       "Manage Users": true,
//       "Manage Roles & Permissions": false,
//       "Manage System Settings": false,
//       "View All Company Reports": true,
//       "Approve Leave": false,
//       "Approve Team Leave": false,
//       "Apply for Leave": true,
//       "View Own Records": true,
//       "Mark Attendance": true,
//     },
//   },
//   Manager: {
//     icon: "👨‍🏫",
//     permissions: {
//       "Manage Users": false,
//       "Manage Roles & Permissions": false,
//       "Manage System Settings": false,
//       "View All Company Reports": false,
//       "Approve Leave": false,
//       "Approve Team Leave": true,
//       "Apply for Leave": true,
//       "View Own Records": true,
//       "Mark Attendance": true,
//     },
//   },
//   Employee: {
//     icon: "👷",
//     permissions: {
//       "Manage Users": false,
//       "Manage Roles & Permissions": false,
//       "Manage System Settings": false,
//       "View All Company Reports": false,
//       "Approve Leave": false,
//       "Approve Team Leave": false,
//       "Apply for Leave": true,
//       "View Own Records": true,
//       "Mark Attendance": true,
//     },
//   },
// };

// A list of all possible permissions to ensure consistent order
// const allPermissions = [
//   "Manage Users",
//   "Manage Roles & Permissions",
//   "Manage System Settings",
//   "View All Company Reports",
//   "Approve Leave",
//   "Approve Team Leave",
//   "View Own Records",
//   "Apply for Leave",
//   "Mark Attendance",
// ];

// Reusable component for a single editable permission checkbox
// const EditablePermissionCheckbox = ({ label, isChecked, onChange }) => (
//   <label className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
//     <input
//       type="checkbox"
//       checked={isChecked}
//       onChange={onChange}
//       className="form-checkbox h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-1"
//     />
//     <span className={isChecked ? "font-medium" : "text-gray-600"}>{label}</span>
//   </label>
// );

// Main component to display the roles and permissions UI
// export function RolesAndPermission() {
//   // Store the roles and permissions in state to make them editable
//   const [roles, setRoles] = useState(initialRolesAndPermissions);

//   // Handler to update the state when a checkbox is changed
//   const handlePermissionChange = (roleName, permissionName, isChecked) => {
//     setRoles((prevRoles) => {
//       // Create a deep copy to avoid direct state mutation
//       const newRoles = JSON.parse(JSON.stringify(prevRoles));
//       newRoles[roleName].permissions[permissionName] = isChecked;
//       return newRoles;
//     });
//   };

//   // Handler for the save button
//   const handleSaveChanges = () => {
//     // In a real app, you would send the 'roles' state to your backend API
//     console.log("Saving updated permissions:", roles);
//     alert("Changes saved to the console!"); // Replace with a proper notification
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen space-y-8">
//       <div className="bg-white p-6 rounded-xl shadow-lg">
//         <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
//           <h3 className="text-xl font-semibold text-gray-800 flex items-center">
//             <i className="fas fa-tasks mr-3 text-blue-500"></i>Role & Permission
//             Management
//           </h3>
//           <button
//             onClick={handleSaveChanges}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
//           >
//             <i className="fas fa-save"></i>
//             <span>Save Changes</span>
//           </button>
//         </div>
//         <div className="space-y-6">
//           {Object.entries(roles).map(([role, data]) => (
//             <div
//               key={role}
//               className="border border-gray-200 p-5 rounded-lg transition-shadow hover:shadow-md"
//             >
//               <h4 className="font-bold text-lg text-gray-800 mb-4">
//                 {data.icon} {role}
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                 {allPermissions.map((permission) => (
//                   <EditablePermissionCheckbox
//                     key={permission}
//                     label={permission}
//                     isChecked={!!data.permissions[permission]}
//                     onChange={(e) =>
//                       handlePermissionChange(role, permission, e.target.checked)
//                     }
//                   />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <style jsx global>{`
//         @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");
//         @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

//         body {
//           font-family: "Inter", sans-serif;
//         }
//       `}</style>
//     </div>
//   );
// }
export default function AdminPanel() {
  const [userData, setUserData] = useState([]);
  const [show, setShow] = useState(false);
  const [refresh, setRefresh] = useState(false);
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  // depatment
  // State for new user form data
  // LOGIC TO ADD HERE:
  // 1. State to control the new modal's visibility
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);

  // 2. Convert the 'departments' array to a state so it can be updated
  const [departments, setDepartments] = useState([]);
  const [refreshDepartmentEffect, setRefreshDepartmentEffect] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    date: "",
    role: "Employee", // Default role
    department: "Frontend Development", // Default department
    password: "",
  });
  // 3. State for the input field in the new modal
  const [newDepartmentName, setNewDepartmentName] = useState([]);
  useEffect(() => {
    const getDepartment = async () => {
      try {
        const res = await apiGet("/department");
        console.log(res);
        setDepartments(res);
      } catch (err) {
        console.log(err);
      }
    };
    getDepartment();
  }, [refreshDepartmentEffect]);
  // ... existing useEffect and other handlers

  // 4. Handler function for the new department form
  const handleDepartmentSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    if (newDepartmentName.trim()) {
      // Add the new department to the list
      setDepartments(newDepartmentName.trim());
      const addDepartment = async () => {
        try {
          const res = await apiPost("/department", {
            newDepartment: newDepartmentName.trim(),
          });
          console.log(res);
          // Close the modal and reset the input
          setIsDepartmentModalOpen(false);
          setNewDepartmentName("");
          setRefreshDepartmentEffect(!refreshDepartmentEffect);
        } catch (err) {
          console.log(err);
        }
      };
      addDepartment();
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await apiGet("/employee");
        console.log(res);
        setUserData(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUserData();
  }, [refresh]);

  // Handle input changes in the modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to create the user
    console.log("Submitting New User:", newUser);
    // Close the modal and reset the form
    const addUSer = async () => {
      try {
        const res = await apiPost("/employee", newUser);
        console.log(res);
        setRefresh(!refresh);
        setIsModalOpen(false);
        setNewUser({
          name: "",
          email: "",
          date: "",
          role: "Employee",
          department: "Frontend Development",
          password: "",
        });
      } catch (err) {
        console.log(err);
      }
    };
    addUSer();
  };
  const [editDetail, setEditDetail] = useState({
    name: "",
    email: "",
    date: "",
    role: "",
    department: "",
  });
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const handleEditUser = (e, item) => {
    e.preventDefault();
    editDetail.name = item.name;
    editDetail.date = item.hire_date;
    editDetail.email = item.email;
    editDetail.role = item.role_name;
    editDetail.department = item.department_name;
    setCurrentEmployeeId(item.employee_id);
    console.log(item);
    setIsModalOpenEdit(true);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDetail((prevState) => ({ ...prevState, [name]: value }));
  };
  const handleEdit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to create the user
    const submitDetail = {
      editDetail,
      employeeId: currentEmployeeId,
    };
    console.log(submitDetail);
    const updateUserData = async () => {
      try {
        const res = await apiPut("/employee", submitDetail);
        console.log(res);
        setCurrentEmployeeId(null);
        // Close the modal and reset the form
        setIsModalOpenEdit(false);
        setRefresh(!refresh);
        setEditDetail({
          name: "",
          email: "",
          date: "",
          role: "Employee",
          department: "Frontend Development",
        });
      } catch (err) {
        console.log(err);
      }
    };
    updateUserData();
  };
  // 1. State to hold tasks for all users, keyed by employee ID.
  const [allUserTasks, setAllUserTasks] = useState({
    // Example: { 1: [{id: 101, text: 'Complete onboarding', completed: false}] }
  });

  // 2. State to control the new task modal's visibility.
  //const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // 3. State to store the user object that the admin is currently assigning a task to.
  const [selectedUserForTask, setSelectedUserForTask] = useState(null);

  // 4. State for the input field in the new task modal.
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  // ... existing useEffects and handlers...

  // 5. Handler to open the task modal for a specific user.
  // RENAME THIS FUNCTION from handleOpenTaskModal to handleSelectUser
  const handleSelectUser = (user) => {
    setSelectedUserForTask(user); // This line stays the same
    // DELETE THIS LINE: setIsTaskModalOpen(true);
  };

  // 6. Handler to add a new task to the selected user's task list.
 // Replace the old handleAssignTask with this one
const handleAssignTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedUserForTask || !newTaskDueDate) return;

    const newTask = {
      id: selectedUserForTask.employee_id,
      text: newTaskText,
      completed: false,
      assignmentDate: new Date().toISOString().split('T')[0], // Adds today's date
      dueDate: newTaskDueDate,
    };
    
    console.log(newTask);
    setNewTaskText("");
    setNewTaskDueDate(""); // Reset the due date input
};
  // ADD THIS NEW HANDLER FUNCTION
  const handleDeleteTask = (taskIdToDelete) => {
    if (!selectedUserForTask) return; // Safety check

    const userId = selectedUserForTask.employee_id;

    // Update the main task state by filtering out the deleted task
    setAllUserTasks((currentTasks) => ({
      ...currentTasks, // Copy tasks for all other users
      [userId]: currentTasks[userId].filter(
        (task) => task.id !== taskIdToDelete
      ),
    }));
  };
  // LOGIC TO ADD HERE FOR PAGINATION:
  // 1. State for the current page and items per page.
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2); // You can change this number

  // 2. Logic to calculate the items for the current page.
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Use this 'currentUsers' variable in your table map instead of 'userData'
  const currentUsers = userData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(userData.length / itemsPerPage);

  // 3. Handler functions for page navigation.
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const calculateDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Overdue", color: "text-red-600" };
    if (diffDays === 0) return { text: "Due Today", color: "text-orange-600" };
    return { text: `${diffDays} days left`, color: "text-gray-500" };
};
  return (
    <>
      <div className="space-y-8">
        {/* User Management Card */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4 max-[430px]:block">
            <h3 className="text-xl font-semibold">
              <i className="fas fa-users-cog mr-2"></i>User Management
            </h3>
            {/* Button to open the add user modal */}
            <div>
              <div className="flex items-center space-x-2">
                {/* ADD THIS BUTTON */}
                <button
                  onClick={() => setIsDepartmentModalOpen(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  <span className="max-[380px]:hidden">+ Add Department</span>
                  <span className="max-[380px]:block hidden">+ Department</span>
                </button>

                {/* Existing "Add User" button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <span className="max-[380px]:hidden">+ Add User</span>
                  <span className="max-[380px]:block hidden">+ User</span>
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Role</th>
                  <th className="px-4 py-2 text-left font-medium">Department</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((item) => (
                    <tr 
                        key={item.employee_id} 
                        className={`border-b cursor-pointer hover:bg-gray-100 ${selectedUserForTask?.employee_id === item.employee_id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleSelectUser(item)}
                    >
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.employee_email}</td>
                      <td className="px-4 py-3">{item.role_name}</td>
                      <td className="px-4 py-3">{item.employee_position}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${item.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => handleEditUser(e, item)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No user data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role & Permission Management Card */}
        {/* <RolesAndPermission /> */}
        <div className="flex ps-4 pe-4 justify-between items-center mt-4">
            <span className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, userData.length)} of {userData.length} users
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
      </div>
      {selectedUserForTask && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Task Management for <span className="text-blue-600">{selectedUserForTask.name}</span>
          </h3>
          
          {/* Task List with dates and delete button */}
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {(allUserTasks[selectedUserForTask.employee_id] || []).length > 0 ? 
              (allUserTasks[selectedUserForTask.employee_id] || []).map(task => {
                  const daysRemaining = calculateDaysRemaining(task.dueDate);
                  return (
                      <div key={task.id} className="p-3 bg-gray-100 rounded-md">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                  <i className="fas fa-tasks text-gray-500 mr-3"></i>
                                  <span className="text-sm text-gray-800">{task.text}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                  <span className={`text-xs font-semibold ${daysRemaining.color}`}>
                                      {daysRemaining.text}
                                  </span>
                                  <button 
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="text-red-500 hover:text-red-700 font-medium text-xs"
                                  >
                                      Delete
                                  </button>
                              </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 pl-6">
                              Assigned: {task.assignmentDate} | Due: {task.dueDate}
                          </div>
                      </div>
                  );
              }) : (
              <p className="text-sm text-gray-500 text-center">No tasks assigned yet.</p>
              )
            }
          </div>

          {/* Form to add a new task with due date */}
          <form onSubmit={handleAssignTask} className="space-y-4 border-t pt-4">
            <div>
                <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign New Task
                </label>
                <input
                    placeholder="Enter a new task description..."
                    type="text"
                    id="taskName"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                </label>
                <input
                    type="date"
                    id="dueDate"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                    Add Task
                </button>
            </div>
          </form>
        </div>
      )}        
      {/* Add User Modal */}
      {isModalOpen && (
        <div
          // Backdrop with blur and fade-in animation
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out"
          style={{ animation: "fadeIn 0.3s" }}
        >
          <div
            // Modal panel with scale-in animation
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-transform duration-300 ease-out"
            style={{ animation: "scaleIn 0.3s" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times fa-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="enter name"
                  type="text"
                  name="name"
                  id="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="enter email"
                  type="email"
                  name="email"
                  id="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hire Date <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="enter date"
                  type="date"
                  name="date"
                  id="date"
                  value={newUser.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  id="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>HR</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  id="department"
                  value={newUser.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                >
                  {departments.length ? (
                    <>
                      {departments.map((dept) => (
                        <option
                          key={dept.department_name}
                          value={dept.department_name}
                        >
                          {dept.department_name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option>Loading..</option>
                  )}
                </select>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative password-container">
                  <style>
                    {`
          .password-container input[type="password"]::-ms-reveal {
            display: none;
          }

          .password-container input[type="password"]::-ms-clear {
            display: none;
          }

          .password-container input[type="password"] {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
          }
        `}
                  </style>
                  <input
                    type={show ? "text" : "password"}
                    placeholder="*****"
                    name="password"
                    id="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span
                    onClick={(e) => {
                      setShow(!show);
                    }}
                    className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  >
                    {show ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isModalOpenEdit && (
        <div
          // Backdrop with blur and fade-in animation
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out"
          style={{ animation: "fadeIn 0.3s" }}
        >
          <div
            // Modal panel with scale-in animation
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-transform duration-300 ease-out"
            style={{ animation: "scaleIn 0.3s" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit User detail
              </h2>
              <button
                onClick={() => setIsModalOpenEdit(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times fa-lg"></i>
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  placeholder="enter name"
                  type="text"
                  name="name"
                  id="name"
                  value={editDetail.name}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  placeholder="enter email"
                  type="email"
                  name="email"
                  id="email"
                  value={editDetail.email}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hire Date
                </label>
                <input
                  placeholder="enter email"
                  type="date"
                  name="date"
                  id="date"
                  value={editDetail.date}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={editDetail.role}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>HR</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department
                </label>
                <select
                  name="department"
                  id="department"
                  value={editDetail.department}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                >
                  {departments.length ? (
                    <>
                      {departments.map((dept) => (
                        <option
                          key={dept.department_name}
                          value={dept.department_name}
                        >
                          {dept.department_name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option>Loading..</option>
                  )}
                </select>
              </div>
              <div className="flex justify-end pt-4 space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpenEdit(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Edit User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDepartmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out"
          style={{ animation: "fadeIn 0.3s" }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-transform duration-300 ease-out"
            style={{ animation: "scaleIn 0.3s" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Add New Department
              </h2>
              <button
                onClick={() => setIsDepartmentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times fa-lg"></i>
              </button>
            </div>
            <form onSubmit={handleDepartmentSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="departmentName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g., Frontend"
                  type="text"
                  id="departmentName"
                  name="departmentName"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 capitalize"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-4">
                <button
                  type="button"
                  onClick={() => setIsDepartmentModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Simple CSS for animations if not using a library */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
