'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { apiGet, apiPost } from '../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Plus,
  Menu,
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  FileText,
  Trash2,
  Edit3,
  MessageSquare,
  Clock,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  Zap,
  Shield,
  BookOpen,
  HelpCircle
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import './legal-aid.css';

export default function LegalAidPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Enhanced UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConversationMenu, setShowConversationMenu] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState('online');
  
  // Hardcoded categories for now
  const categories = [
    { value: "family", label: "Family Law", icon: Shield, color: "text-blue-400" },
    { value: "criminal", label: "Criminal Law", icon: Shield, color: "text-red-400" },
    { value: "civil", label: "Civil Law", icon: BookOpen, color: "text-green-400" },
    { value: "corporate", label: "Corporate Law", icon: FileText, color: "text-purple-400" },
    { value: "immigration", label: "Immigration Law", icon: HelpCircle, color: "text-yellow-400" },
    { value: "employment", label: "Employment Law", icon: Shield, color: "text-orange-400" },
    { value: "real_estate", label: "Real Estate Law", icon: FileText, color: "text-teal-400" },
    { value: "other", label: "Other", icon: HelpCircle, color: "text-gray-400" }
  ];
  
  // Message state
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // New conversation state
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    title: '',
    category: 'family' // Default to first category
  });
  const [creatingConversation, setCreatingConversation] = useState(false);
  
  // Share state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Filter conversations based on search and category
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || conv.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[7];
  };

  // Handle keyboard events for textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentConversation) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiPost(`/api/legal-aid/conversations/${currentConversation.id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show success message or update UI
      console.log('File uploaded successfully:', response);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchConversations();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchConversations() {
    try {
      const data = await apiGet('/api/legal-aid/conversations');
      setConversations(data);
      if (data.length > 0 && !currentConversation) {
        selectConversation(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(conversationId) {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const data = await apiGet(`/api/legal-aid/conversations/${conversationId}/messages`);
      console.log('Messages fetched:', data);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err.message);
    }
  }

  async function createConversation() {
    if (!newConversationData.title) return;

    console.log('Creating conversation with data:', newConversationData);
    setCreatingConversation(true);

    try {
      const conversation = await apiPost('/api/legal-aid/conversations', newConversationData);
      console.log('Conversation created:', conversation);
      setConversations([conversation, ...conversations]);
      selectConversation(conversation);
      setNewConversationData({ title: '', category: 'family' });
      setShowNewConversation(false);
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setError(err.message);
    } finally {
      setCreatingConversation(false);
    }
  }

  async function selectConversation(conversation) {
    console.log('Selecting conversation:', conversation);
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  }

  async function sendMessage() {
    if (!messageInput.trim() || !currentConversation) return;

    const userMessage = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);
    setIsTyping(true);

    try {
      const response = await apiPost(`/api/legal-aid/conversations/${currentConversation.id}/messages`, {
        content: userMessage
      });

      if (response.user_message && response.ai_message) {
        setMessages(prev => [...prev, response.user_message, response.ai_message]);
      } else if (response.user_message) {
        setMessages(prev => [...prev, response.user_message]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingMessage(false);
      setIsTyping(false);
      scrollToBottom();
    }
  }

  async function uploadFile(file) {
    if (!file || !currentConversation) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiPost(`/api/legal-aid/conversations/${currentConversation.id}/documents`, formData);
      await fetchMessages(currentConversation.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingFile(false);
    }
  }

  async function shareConversation() {
    if (!currentConversation) return;

    try {
      const response = await apiPost(`/api/legal-aid/conversations/${currentConversation.id}/share`, {
        allow_public: true
      });
      
      const shareUrl = `${window.location.origin}/legal-aid/${currentConversation.id}?share_token=${response.share_token}`;
      setShareLink(shareUrl);
      setShowShareDialog(false);
    } catch (err) {
      setError(err.message);
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">⚖️ Legalize</Link>
          <div className="navbar-links">
            {user ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/legal-aid">AI Legal Aid</Link>
                <Link href="/lawyers">Lawyers</Link>
                <Link href="/law-library">Law Library</Link>
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Legal Aid
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* New Conversation Button */}
            <div className="p-4 border-b border-gray-800">
              <Button
                onClick={() => setShowNewConversation(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                icon={<Plus className="w-4 h-4" />}
              >
                New Conversation
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'No conversations found' 
                      : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const categoryInfo = getCategoryInfo(conversation.category);
                  return (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        currentConversation?.id === conversation.id
                          ? 'bg-blue-600/20 border border-blue-500'
                          : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <categoryInfo.icon className={`w-4 h-4 ${categoryInfo.color}`} />
                            <h3 className="font-medium text-white truncate">
                              {conversation.title}
                            </h3>
                          </div>
                          <p className="text-gray-400 text-sm truncate">
                            {conversation.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.created_at).toLocaleDateString()}
                            </span>
                            {conversation.message_count > 0 && (
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                                {conversation.message_count} messages
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConversationMenu(showConversationMenu === conversation.id ? null : conversation.id);
                          }}
                          className="text-gray-400 hover:text-white transition-colors ml-2"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <Button
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  variant="outline"
                  className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
              {currentConversation ? (
                <>
                  <div>
                    <h1 className="text-xl font-semibold text-white">{currentConversation.title}</h1>
                    <p className="text-sm text-gray-400">
                      {currentConversation.category} • AI Legal Assistant
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    AI Legal Aid
                  </h1>
                  <p className="text-sm text-gray-400">Chat with our AI legal assistant</p>
                </div>
              )}
            </div>
            {currentConversation && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowShareDialog(true)}
                  variant="outline"
                  className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                  icon={<Share2 className="w-4 h-4" />}
                >
                  Share
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-20 h-20 text-blue-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Welcome to AI Legal Aid
                  </h2>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    Get instant legal guidance and information from our AI assistant. 
                    Start a conversation to discuss your legal matters with confidence.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Secure & Private</h3>
                      <p className="text-gray-400 text-sm">Your conversations are encrypted and confidential</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Instant Responses</h3>
                      <p className="text-gray-400 text-sm">Get AI-powered legal information immediately</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowNewConversation(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 px-8 py-3 text-lg"
                    icon={<Plus className="w-5 h-5" />}
                  >
                    Start Your First Conversation
                  </Button>
                </motion.div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-3 ${
                    message.message_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.message_type !== 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-3xl ${
                    message.message_type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-sm shadow-lg' 
                      : 'bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm shadow-lg'
                  } p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className={`font-medium text-sm ${
                        message.message_type === 'user' ? 'text-blue-100' : 'text-gray-300'
                      }`}>
                        {message.message_type === 'user' ? 'You' : 'AI Legal Assistant'}
                      </p>
                      {message.ai_confidence && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-400">
                            {Math.round(message.ai_confidence * 100)}% confidence
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className={`leading-relaxed ${
                      message.message_type === 'user' ? 'text-white' : 'text-gray-100'
                    }`}>
                      {message.content}
                    </p>
                    
                    {message.ai_sources && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-medium text-blue-400">Legal Sources</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {message.ai_sources}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        {message.message_type === 'user' && (
                          <button className="text-gray-400 hover:text-white transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {message.message_type === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm shadow-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-gray-400 text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        {currentConversation && (
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your legal situation..."
                  className="bg-gray-900 border-gray-600 text-white resize-none"
                  rows={1}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                  icon={<Paperclip className="w-4 h-4" />}
                >
                  {uploadingFile ? 'Uploading...' : 'Attach'}
                </Button>
                
                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  icon={sendingMessage ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            
            {/* Character count and suggestions */}
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{messageInput.length} characters</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{onlineStatus}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  Press Enter to send, Shift+Enter for new line
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-400" />
                  New Conversation
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewConversation(false)}
                  className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                  icon={<X className="w-4 h-4" />}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Conversation Title
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Divorce Proceedings, Business Contract"
                    value={newConversationData.title}
                    onChange={(e) => setNewConversationData({ ...newConversationData, title: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Legal Category
                  </label>
                  <Select
                    value={newConversationData.category}
                    onChange={(e) => setNewConversationData({ ...newConversationData, category: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                    options={categories}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewConversation(false)}
                  className="flex-1 text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createConversation}
                  disabled={!newConversationData.title.trim() || creatingConversation}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  icon={creatingConversation ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
                >
                  {creatingConversation ? 'Creating...' : 'Start Conversation'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Share Conversation
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                  className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                  icon={<X className="w-4 h-4" />}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-gray-900 border-gray-600 text-white"
                    />
                    <Button
                      onClick={copyShareLink}
                      className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                      icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium mb-1">Privacy Notice</h4>
                      <p className="text-gray-400 text-sm">
                        Shared conversations are read-only. Recipients can view messages but cannot 
                        edit or participate in the conversation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                  className="flex-1 text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  </>
  );
}
