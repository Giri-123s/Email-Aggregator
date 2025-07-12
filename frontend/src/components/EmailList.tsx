import React, { useEffect, useState, useCallback, useMemo } from "react";
import { fetchEmails, fetchStats, fetchFilteredStats, fetchAccounts, fetchFolders, Email, EmailFilters } from "../services/emailApi";
import { SearchBar } from "./SearchBar";
import { EmailDetail } from "./EmailDetail";
import { Sidebar } from "./Sidebar";
import "./EmailList.css";

export const EmailList: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filteredStats, setFilteredStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState<EmailFilters>({});
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [lastFilters, setLastFilters] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Memoize filters to prevent unnecessary API calls
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  // Load initial data only once
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load emails first (most important)
        const emailsData = await fetchEmails({});
        setEmails(emailsData);
        
        // Try to load stats, but don't fail if they don't work
        try {
          const [statsData, accountsData, foldersData, filteredStatsData] = await Promise.all([
            fetchStats(),
            fetchAccounts(),
            fetchFolders(),
            fetchFilteredStats({})
          ]);
          setStats(statsData);
          setAccounts(accountsData);
          setFolders(foldersData);
          setFilteredStats(filteredStatsData);
        } catch (statsError) {
          console.warn("Stats failed to load, but emails are available:", statsError);
          // Set default values so UI doesn't break
          setStats({ labels: [], accounts: [], folders: [] });
          setAccounts([]);
          setFolders([]);
          setFilteredStats({ labels: [], total: emailsData.length });
        }
        
        setLastFilters(JSON.stringify({})); // Set initial filters state
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Load emails and filtered stats when filters change (with caching)
  useEffect(() => {
    const loadFilteredData = async () => {
      if (loading) return; // Don't load if still loading initial data
      if (filtersKey === lastFilters) return; // Don't reload if filters haven't changed
      
      setSearchLoading(true);
      try {
        console.log('Loading data with filters:', filters);
        const emailsData = await fetchEmails(filters);
        setEmails(emailsData);
        
        // Try to load filtered stats, but don't fail if they don't work
        try {
          const filteredStatsData = await fetchFilteredStats(filters);
          setFilteredStats(filteredStatsData);
        } catch (statsError) {
          console.warn("Filtered stats failed to load:", statsError);
          // Set default filtered stats
          setFilteredStats({ labels: [], total: emailsData.length });
        }
        
        setLastFilters(filtersKey);
      } catch (error) {
        console.error("Error loading filtered data:", error);
      } finally {
        setSearchLoading(false);
      }
    };
    loadFilteredData();
  }, [filtersKey, loading, lastFilters]);

  const updateFilter = useCallback((key: keyof EmailFilters, value: string) => {
    console.log(`Updating filter: ${key} = "${value}"`);
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value && value.trim()) {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      console.log('New filters:', newFilters);
      return newFilters;
    });
  }, []);

  const handleFolderSelect = useCallback((folder: string) => {
    updateFilter('folder', folder);
  }, [updateFilter]);

  const handleAccountSelect = useCallback((account: string) => {
    updateFilter('account', account);
  }, [updateFilter]);
  
  const handleLabelSelect = useCallback((label: string) => {
    updateFilter('label', label);
  }, [updateFilter]);

  const handleEmailClick = useCallback((email: Email) => {
    setSelectedEmail(email);
  }, []);

  const closeEmailDetail = useCallback(() => {
    setSelectedEmail(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const getLabelColor = useCallback((label: string) => {
    const colors: { [key: string]: string } = {
      'Interested': '#28a745',
      'Meeting Booked': '#007bff',
      'Not Interested': '#dc3545',
      'Spam': '#6c757d',
      'Out of Office': '#ffc107'
    };
    return colors[label] || '#6c757d';
  }, []);

  if (loading) {
    return <div className="loading">Loading emails...</div>;
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar
        folders={folders}
        accounts={accounts}
        labels={stats?.labels || []}
        selectedFolder={filters.folder || ""}
        selectedAccount={filters.account || ""}
        selectedLabel={filters.label || ""}
        onFolderSelect={handleFolderSelect}
        onAccountSelect={handleAccountSelect}
        onLabelSelect={handleLabelSelect}
        onClose={closeSidebar}
      />
      
      <div className="main-content">
        <button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? '❮' : '❯'}
        </button>

        <div className="email-container">
          <div className="header">
            <h1>📧 Email Inbox</h1>
            <div className="stats">
              {filteredStats ? (
                <div className="stat-cards">
                  <div className="stat-card">
                    <h3>Total Emails</h3>
                    <p>{filteredStats.total || emails.length}</p>
                  </div>
                  {filteredStats.labels?.map((label: any) => (
                    <div key={label.key} className="stat-card" style={{ borderLeftColor: getLabelColor(label.key) }}>
                      <h3>{label.key}</h3>
                      <p>{label.doc_count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="stat-cards">
                  <div className="stat-card">
                    <h3>Total Emails</h3>
                    <p>{emails.length}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Status</h3>
                    <p>Stats unavailable</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="filters">
            <SearchBar 
              onSearch={(query) => updateFilter('query', query)} 
              isLoading={searchLoading}
            />
          </div>

          <div className="email-list">
            {searchLoading ? (
              <div className="loading">Searching emails...</div>
            ) : emails.length === 0 ? (
              <div className="no-emails">No emails found</div>
            ) : (
              emails.map((email) => (
                <div 
                  key={email.id} 
                  className="email-item"
                  onClick={() => handleEmailClick(email)}
                >
                  <div className="email-header">
                    <div className="email-sender">
                      <strong>{email.from}</strong>
                      <span className="email-account">({email.account})</span>
                    </div>
                    <div className="email-date">
                      {new Date(email.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="email-subject">
                    <strong>{email.subject}</strong>
                    <span 
                      className="email-label" 
                      style={{ backgroundColor: getLabelColor(email.label) }}
                    >
                      {email.label}
                    </span>
                  </div>
                  <div className="email-preview">
                    {email.text?.slice(0, 150)}...
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedEmail && (
            <EmailDetail 
              email={selectedEmail} 
              onClose={closeEmailDetail} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
