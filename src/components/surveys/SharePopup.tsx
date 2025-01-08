import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Search, Users, Mail, Plus } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

// Type for a user
interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

interface SharePopupProps {
    data: {
        title: string;
    };
    surveyID: string;
  onClose: () => void; 
}

const SharePopup: React.FC<SharePopupProps> = ({data, surveyID, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'users' | 'email'>('users');
  const [newEmail, setNewEmail] = useState<string>(""); 
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]); 
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const surveyLink = `http://localhost:3000/surveys/${surveyID}`;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const response = await res.json();
        
        if (response.success) {
          setUsers(response.data); 
        } else {
          console.error("Failed to fetch users: ", response.message);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    
    fetchUsers();
  }, []);

  const sendSurveyEmails = async () => {
    const emailsToSend = [
      ...selectedUsers.map((u) => u.id), 
      ...invitedEmails,                    // Additional invited emails
    ];
  
    if (emailsToSend.length === 0) return;
  
    setIsSending(true);
    try {
      const payload = {
        title: data.title, 
        surveyID: surveyID,
        selectedUsers: emailsToSend
      };
  
      const response = await fetch('/api/send-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        setSelectedUsers([]); 
        setInvitedEmails([]);
        onClose()
          toast({
        title: "Success",
        description: "Survey created successfully",
      });
        window.location.href = '/surveys';
      } else {
        const errorData = await response.json();
        console.error('Failed to send survey invitations:', errorData.message);
        alert('Failed to send survey invitations. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send emails:', error);
      alert('Failed to send survey invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => 
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]); // Deselect all
    } else {
      setSelectedUsers(filteredUsers); // Select all filtered users
    }
    setSelectAll(!selectAll); // Toggle Select All state
  };

  const addEmailInvite = () => {
    if (newEmail && !invitedEmails.includes(newEmail)) {
      setInvitedEmails([...invitedEmails, newEmail]);
      setNewEmail("");
    }
  };

  const removeEmailInvite = (email: string) => {
    setInvitedEmails(invitedEmails.filter(e => e !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newEmail) {
      addEmailInvite();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full p-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Share Survey</h2>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose} 
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Copy Link Section */}
        <div className="mb-6 border rounded-lg p-3">
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm text-gray-600 truncate flex-1">
              {surveyLink}
            </span>
            <button
              onClick={copyLink}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4 border-b">
          <button
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="h-4 w-4" />
            <span>Select Users</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 ${activeTab === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail className="h-4 w-4" />
            <span>Invite by Email</span>
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            {/* Search Users */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 p-2 border rounded-lg">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or department"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>

            {/* Select All Checkbox */}
            <div className="mb-4 flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span>Select All</span>
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto mb-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => toggleUserSelection(user)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onChange={() => toggleUserSelection(user)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div className="text-xs text-gray-400">{user.department}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Email Invitation */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addEmailInvite}
                  disabled={!newEmail}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Invited Emails List */}
            <div className="max-h-64 overflow-y-auto mb-4">
              {invitedEmails.map((email) => (
                <div key={email} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm">{email}</span>
                  <button
                    onClick={() => removeEmailInvite(email)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Send Button */}
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={sendSurveyEmails}
            disabled={isSending || (!selectedUsers.length && !invitedEmails.length)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-blue-300"
          >
            {isSending ? 'Sending...' : 'Send Survey'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
