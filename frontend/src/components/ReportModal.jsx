import React, { useState } from 'react';
import { RiCloseLine, RiShieldCheckFill, RiUserSharedLine, RiToolsFill } from 'react-icons/ri';
import './ReportModal.css';

const ReportModal = ({ park, onClose, onSubmit }) => {
  const [report, setReport] = useState({
    safety: 'Safe',
    crowd: 'Moderate',
    status: 'Operational',
    comment: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting report for:", park.name, report);
    onSubmit(report);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="report-modal glass-morphism">
        <div className="modal-header">
          <h2>Report Condition: {park.name}</h2>
          <button onClick={onClose} className="close-btn"><RiCloseLine size={24} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><RiShieldCheckFill /> Safety Level</label>
            <select value={report.safety} onChange={(e) => setReport({...report, safety: e.target.value})}>
              <option value="Safe">Safe / Verified</option>
              <option value="Caution">Caution Advised</option>
              <option value="Unsafe">Unsafe / Avoid</option>
            </select>
          </div>

          <div className="form-group">
            <label><RiUserSharedLine /> Crowd Level</label>
            <select value={report.crowd} onChange={(e) => setReport({...report, crowd: e.target.value})}>
              <option value="Quiet">Quiet</option>
              <option value="Moderate">Moderate</option>
              <option value="Crowded">Very Crowded</option>
            </select>
          </div>

          <div className="form-group">
            <label><RiToolsFill /> Facility Status</label>
            <select value={report.status} onChange={(e) => setReport({...report, status: e.target.value})}>
              <option value="Operational">All Operational</option>
              <option value="Maintenance">Under Maintenance</option>
              <option value="Closed">Facility Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              placeholder="e.g. 'Main gate is temporarily locked' or 'Very clean today!'"
              value={report.comment}
              onChange={(e) => setReport({...report, comment: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary full-width">Submit Report</button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;