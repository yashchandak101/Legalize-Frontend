'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { apiGet, apiPost } from '../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  FileText,
  Trash2,
  Menu,
  X
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function LegalChatPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Chat creation state
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatData, setNewChatData] = useState({
    title: '',
    category: ''
  });
  
  // Message state
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Lawyer request state
  const [showLawyerRequest, setShowLawyerRequest] = useState(false);
  const [lawyerRequestReason, setLawyerRequestReason] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchChats();
      fetchCategories();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchChats() {
    try {
      const data = await apiGet('/api/legal-chat/chats');
      setChats(data);
      if (data.length > 0 && !currentChat) {
        selectChat(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const data = await apiGet('/api/legal-chat/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }

  async function fetchMessages(chatId) {
    try {
      const data = await apiGet(`/api/legal-chat/chats/${chatId}/messages`);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createChat() {
    if (!newChatData.title || !newChatData.category) return;

    try {
      const chat = await apiPost('/api/legal-chat/chats', newChatData);
      setChats([chat, ...chats]);
      selectChat(chat);
      setNewChatData({ title: '', category: '' });
      setShowNewChat(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function selectChat(chat) {
    setCurrentChat(chat);
    await fetchMessages(chat.id);
  }

  async function sendMessage() {
    if (!messageInput.trim() || !currentChat) return;

    setSendingMessage(true);
    try {
      const response = await apiPost(`/api/legal-chat/chats/${currentChat.id}/messages`, {
        content: messageInput.trim()
      });
      
      setMessages([...messages, response.user_message, response.ai_message]);
      setMessageInput('');
      
      // Update chat in list
      setChats(chats.map(chat => 
        chat.id === currentChat.id 
          ? { ...chat, last_message: response.ai_message, updated_at: new Date().toISOString() }
          : chat
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingMessage(false);
    }
  }

  async function uploadFile(file) {
    if (!file || !currentChat) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiPost(`/api/legal-chat/chats/${currentChat.id}/documents`, formData);
      // Refresh messages to get system message about document
      await fetchMessages(currentChat.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingFile(false);
    }
  }

  async function requestLawyer() {
    if (!lawyerRequestReason.trim() || !currentChat) return;

    try {
      const updatedChat = await apiPost(`/api/legal-chat/chats/${currentChat.id}/request-lawyer`, {
        reason: lawyerRequestReason.trim()
      });
      
      setCurrentChat(updatedChat);
      setChats(chats.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));
      
      setShowLawyerRequest(false);
      setLawyerRequestReason('');
      await fetchMessages(currentChat.id);
    } catch (err) {
      setError(err.message);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'active':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'lawyer_requested':
        return <UserCheck className="w-4 h-4 text-yellow-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Legal Chats</h2>
            <Button
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => setShowNewChat(true)}
            className="w-full"
            icon={<Plus className="w-4 h-4" />}
          >
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No chats yet</p>
              <p className="text-sm text-gray-500">Start your first legal consultation</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                    currentChat?.id === chat.id 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
                        {getStatusIcon(chat.status)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.last_message?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chat.category} • {formatTime(chat.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <Button
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  variant="outline"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
              {currentChat ? (
                <>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{currentChat.title}</h1>
                    <p className="text-sm text-gray-600 capitalize">{currentChat.category} • {currentChat.status.replace('_', ' ')}</p>
                  </div>
                </>
              ) : (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">AI Legal Assistant</h1>
                  <p className="text-sm text-gray-600">Start a new conversation</p>
                </div>
              )}
            </div>
            {currentChat && !currentChat.lawyer_requested && (
              <Button
                onClick={() => setShowLawyerRequest(true)}
                variant="outline"
                icon={<UserCheck className="w-4 h-4" />}
              >
                Request Lawyer
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentChat ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Legal Assistant</h3>
              <p className="text-gray-600 mb-6">Start a new chat to get legal guidance and information</p>
              <Button onClick={() => setShowNewChat(true)}>
                Start New Chat
              </Button>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-3 ${
                    message.message_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.message_type !== 'user' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {message.message_type === 'ai' ? (
                        <Bot className="w-4 h-4 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-2xl ${
                    message.message_type === 'user' 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                      : 'bg-white border border-gray-200 rounded-2xl rounded-bl-sm'
                  } p-4`}>
                    <p className={message.message_type === 'user' ? 'text-white' : 'text-gray-900'}>
                      {message.content}
                    </p>
                    
                    {message.ai_sources && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Sources:</strong> {message.ai_sources}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <p className={`text-xs ${
                        message.message_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                      {message.ai_confidence && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          message.message_type === 'user' 
                            ? 'bg-blue-700 text-blue-100' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {Math.round(message.ai_confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {message.message_type === 'user' && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        {currentChat && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
                accept=".txt,.pdf,.doc,.docx"
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current.click()}
                loading={uploadingFile}
                disabled={sendingMessage}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ask about your legal situation..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={sendingMessage}
                className="flex-1"
              />
              
              <Button
                onClick={sendMessage}
                loading={sendingMessage}
                disabled={!messageInput.trim() || sendingMessage}
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Start Legal Chat</h2>
              
              <div className="space-y-4">
                <Input
                  label="Chat Title"
                  value={newChatData.title}
                  onChange={(e) => setNewChatData({ ...newChatData, title: e.target.value })}
                  placeholder="Brief description of your legal issue"
                  required
                />

                <Select
                  label="Legal Category"
                  value={newChatData.category}
                  onChange={(e) => setNewChatData({ ...newChatData, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={createChat}
                  className="flex-1"
                  disabled={!newChatData.title || !newChatData.category}
                >
                  Start Chat
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewChat(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lawyer Request Modal */}
      {showLawyerRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Request Legal Representation</h2>
              <p className="text-gray-600 mb-4">
                Explain why you need to speak with a qualified attorney for this matter.
              </p>
              
              <Textarea
                label="Reason for Lawyer Request"
                value={lawyerRequestReason}
                onChange={(e) => setLawyerRequestReason(e.target.value)}
                placeholder="Please describe why you need legal representation..."
                rows={4}
                required
              />

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={requestLawyer}
                  className="flex-1"
                  disabled={!lawyerRequestReason.trim()}
                >
                  Submit Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLawyerRequest(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
