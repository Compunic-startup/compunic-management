// LeaveModal.jsx
import React, { useState, useEffect, useRef } from 'react'; // 1. Import useRef

// --- SVG Icons and Helper Functions (No changes here) ---
const CalendarIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);
const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);
const UploadIcon = () => (
    <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h.5a3.5 3.5 0 013.5 3.5v.5a4 4 0 01-4 4H7zM10 21H7a4 4 0 01-4-4V7a4 4 0 014-4h.5a3.5 3.5 0 013.5 3.5v.5a4 4 0 01-4 4H7zM10 21H7"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 16a4 4 0 004-4v-5a3.5 3.5 0 00-3.5-3.5H14a4 4 0 00-4 4v5a4 4 0 004 4z"></path></svg>
);
const DocumentIcon = () => (
    <svg className="w-8 h-8 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
);
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
function LeaveModal({ user, onClose }) {
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    startHalfDay: 'First Half',
    endHalfDay: 'First Half',
    reason: '',
  });

  // 2. Create refs for the date inputs
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const MAX_SIZE_BYTES = 1048576;
        if (file.size > MAX_SIZE_BYTES) {
          alert('File size exceeds 1 MB. Please choose a smaller file.');
          e.target.value = null;
          return;
        }
        setFormData(prev => ({ ...prev, [name]: file }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
        alert("Please select a start and end date.");
        return;
    }
    console.log("Submitting Leave Application:", formData);
    alert('Leave request submitted successfully!');
    handleClose();
  };
  
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-xl transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Leave Application</h2>
                <p className="text-sm text-gray-500 mt-1">Applying as as</p>
            </div>
            <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800">
                <CloseIcon />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
              
              {/* Leave Type */}
              <div className="md:col-span-2">
                <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">Leave Type <span className="text-red-500">*</span></label>
                <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 block p-2.5 transition-all">
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Earned Leave</option>
                  <option>Unpaid Leave</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                {/* 3. Add onClick to the container div */}
                <div className="relative cursor-pointer" onClick={() => startDateRef.current.showPicker()}>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon /></div>
                    {/* 4. Assign the ref to the input */}
                    <input ref={startDateRef} type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} min={today} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 block pl-10 p-2.5 transition-all" />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                 <div className="relative cursor-pointer" onClick={() => endDateRef.current.showPicker()}>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon /></div>
                    <input ref={endDateRef} type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || today} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 block pl-10 p-2.5 transition-all" />
                </div>
              </div>
              
              {/* Other Fields (No changes here) */}
               <div>
                <label htmlFor="startHalfDay" className="block text-sm font-medium text-gray-700 mb-1">Half Day (Start)</label>
                <select id="startHalfDay" name="startHalfDay" value={formData.startHalfDay} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 block p-2.5 transition-all">
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>
              <div>
                <label htmlFor="endHalfDay" className="block text-sm font-medium text-gray-700 mb-1">Half Day (End)</label>
                <select id="endHalfDay" name="endHalfDay" value={formData.endHalfDay} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 block p-2.5 transition-all">
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
                <textarea id="reason" name="reason" rows="4" value={formData.reason} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 block p-2.5 transition-all" placeholder="Please provide a brief reason..."></textarea>
              </div>
              
              {/* <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Document</label>
                <div className={`flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-all ${formData.attachment ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}>
                  {formData.attachment ? (
                    <div className="flex flex-col items-center justify-center text-center w-full h-full">
                      <DocumentIcon />
                      <p className="font-semibold text-gray-800 text-sm truncate w-full px-4">{formData.attachment.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(formData.attachment.size)}</p>
                      <label htmlFor="attachment-upload" className="cursor-pointer text-sm text-blue-600 hover:underline mt-1.5 font-medium">Change document</label>
                    </div>
                  ) : (
                    <label htmlFor="attachment-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <UploadIcon />
                        <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 1MB)</p>
                    </label>
                  )}
                  <input id="attachment-upload" name="attachment" type="file" className="hidden" accept=".png, .jpg, .jpeg, .pdf" onChange={handleChange} />
                </div>
              </div> */}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-5 flex justify-end bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <div className="flex space-x-3">
                  <button type="button" onClick={handleClose} className="px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 font-semibold text-sm transition-all transform hover:scale-105">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:scale-105">Submit Request</button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveModal;