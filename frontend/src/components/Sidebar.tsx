import React from "react";
import "./Sidebar.css";

interface Folder {
  key: string;
  doc_count: number;
}

interface Props {
  folders: Folder[];
  accounts: any[];
  labels: { key: string, doc_count: number }[];
  selectedFolder: string;
  selectedAccount: string;
  selectedLabel: string;
  onFolderSelect: (folder: string) => void;
  onAccountSelect: (account: string) => void;
  onLabelSelect: (label: string) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({
  folders,
  accounts,
  labels,
  selectedFolder,
  selectedAccount,
  selectedLabel,
  onFolderSelect,
  onAccountSelect,
  onLabelSelect,
  onClose
}) => {
  const labelIcons: { [key: string]: { icon: string, color: string } } = {
    'All Labels': { icon: '🏷️', color: '#333' },
    'Interested': { icon: '✅', color: '#28a745' },
    'Meeting Booked': { icon: '📅', color: '#007bff' },
    'Not Interested': { icon: '❌', color: '#dc3545' },
    'Spam': { icon: '🚫', color: '#6c757d' },
    'Out of Office': { icon: '🏖️', color: '#ffc107' },
    'Unknown': { icon: '❓', color: '#6c757d' }
  };

  const allLabels = [
    { key: '', doc_count: 0, name: 'All Labels' },
    { key: 'Interested', doc_count: 0, name: 'Interested' },
    { key: 'Meeting Booked', doc_count: 0, name: 'Meeting Booked' },
    { key: 'Not Interested', doc_count: 0, name: 'Not Interested' },
    { key: 'Spam', doc_count: 0, name: 'Spam' },
    { key: 'Out of Office', doc_count: 0, name: 'Out of Office' },
    { key: 'Unknown', doc_count: 0, name: 'Unknown' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>📁 Folders</h3>
        <button className="sidebar-close-btn" onClick={onClose} title="Close sidebar">
          ✕
        </button>
      </div>
      
      <div className="sidebar-section">
        <h4>📧 Accounts</h4>
        <div className="folder-item">
          <button
            className={`folder-button ${!selectedAccount ? 'active' : ''}`}
            onClick={() => onAccountSelect('')}
          >
            <span className="folder-icon">📬</span>
            <span className="folder-name">All Accounts</span>
          </button>
        </div>
        {accounts.map((account) => (
          <div key={account.user} className="folder-item">
            <button
              className={`folder-button ${selectedAccount === account.user ? 'active' : ''}`}
              onClick={() => onAccountSelect(account.user)}
            >
              <span className="folder-icon">📧</span>
              <span className="folder-name">{account.user}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <h4>📂 Email Folders</h4>
        <div className="folder-item">
          <button
            className={`folder-button ${!selectedFolder ? 'active' : ''}`}
            onClick={() => onFolderSelect('')}
          >
            <span className="folder-icon">📁</span>
            <span className="folder-name">All Folders</span>
          </button>
        </div>
        {folders.map((folder) => (
          <div key={folder.key} className="folder-item">
            <button
              className={`folder-button ${selectedFolder === folder.key ? 'active' : ''}`}
              onClick={() => onFolderSelect(folder.key)}
            >
              <span className="folder-icon">📁</span>
              <span className="folder-name">{folder.key}</span>
              <span className="folder-count">({folder.doc_count})</span>
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <h4>🏷️ AI Labels</h4>
        {allLabels.map(label => (
          <div key={label.key} className="folder-item">
            <button
              className={`folder-button ${selectedLabel === label.key ? 'active' : ''}`}
              onClick={() => onLabelSelect(label.key)}
            >
              <span className="folder-icon" style={{ color: labelIcons[label.name]?.color }}>
                {labelIcons[label.name]?.icon}
              </span>
              <span className="folder-name">{label.name}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 