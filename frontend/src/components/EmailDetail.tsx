import React from "react";
import { Email } from "../services/emailApi";
import "./EmailDetail.css";

interface EmailDetailProps {
  email: Email | null;
  onClose: () => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ email, onClose }) => {
  if (!email) return null;

  const getLabelColor = (label: string) => {
    const colors: { [key: string]: string } = {
      'Interested': '#28a745',
      'Meeting Booked': '#007bff',
      'Not Interested': '#dc3545',
      'Spam': '#6c757d',
      'Out of Office': '#ffc107'
    };
    return colors[label] || '#6c757d';
  };

  return (
    <div className="email-detail-overlay" onClick={onClose}>
      <div className="email-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="email-detail-header">
          <h2>Email Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="email-detail-content">
          <div className="email-meta">
            <div className="meta-row">
              <strong>From:</strong> {email.from}
            </div>
            <div className="meta-row">
              <strong>To:</strong> {email.to}
            </div>
            <div className="meta-row">
              <strong>Subject:</strong> {email.subject}
            </div>
            <div className="meta-row">
              <strong>Date:</strong> {new Date(email.date).toLocaleString()}
            </div>
            <div className="meta-row">
              <strong>Account:</strong> {email.account}
            </div>
            <div className="meta-row">
              <strong>Label:</strong>
              <span 
                className="email-label" 
                style={{ backgroundColor: getLabelColor(email.label) }}
              >
                {email.label}
              </span>
            </div>
          </div>
          
          <div className="email-body">
            <h3>Content:</h3>
            {email.html ? (
              <div 
                className="email-html-content"
                dangerouslySetInnerHTML={{ __html: email.html }}
              />
            ) : (
              <div className="email-text-content">
                {email.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 