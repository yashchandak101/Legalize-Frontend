'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, FileText, User, Calendar, Clock, Filter } from 'lucide-react';
import { apiGet } from '../lib/api-client';
import { useRouter } from 'next/navigation';
import { Input } from './ui/Input';
import { LoadingSpinner } from './ui/LoadingSpinner';

export default function GlobalSearch({ placeholder = "Search cases, lawyers, documents..." }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // all, cases, lawyers, documents, appointments
    status: '',
    date_range: ''
  });
  
  const router = useRouter();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch();
    }, 300);
  }, [query, filters]);

  async function performSearch() {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        type: filters.type,
        ...(filters.status && { status: filters.status }),
        ...(filters.date_range && { date_range: filters.date_range })
      });

      const data = await apiGet(`/api/search?${params.toString()}`);
      setResults(Array.isArray(data) ? data : data.results || []);
      setIsOpen(true);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleResultClick(result) {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'case':
        router.push(`/cases/${result.id}`);
        break;
      case 'lawyer':
        router.push(`/lawyers?highlight=${result.id}`);
        break;
      case 'appointment':
        router.push(`/dashboard?appointment=${result.id}`);
        break;
      case 'document':
        router.push(`/cases/${result.case_id}#document-${result.id}`);
        break;
      default:
        console.log('Unknown result type:', result.type);
    }
  }

  function getResultIcon(type) {
    switch (type) {
      case 'case': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'lawyer': return <User className="w-5 h-5 text-green-500" />;
      case 'appointment': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'document': return <FileText className="w-5 h-5 text-orange-500" />;
      default: return <Search className="w-5 h-5 text-gray-500" />;
    }
  }

  function getResultTypeLabel(type) {
    switch (type) {
      case 'case': return 'Case';
      case 'lawyer': return 'Lawyer';
      case 'appointment': return 'Appointment';
      case 'document': return 'Document';
      default: return 'Result';
    }
  }

  function highlightText(text, highlight) {
    if (!text || !highlight) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} style={{ backgroundColor: 'var(--warning)', padding: '1px 2px' }}>{part}</mark> : 
        part
    );
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-32">
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          icon={<Search className="w-5 h-5 text-gray-400" />}
          style={{ 
            paddingRight: '56px', 
            minHeight: '44px',
            height: '44px',
            boxSizing: 'border-box',
            verticalAlign: 'middle',
            marginTop: '20px'
          }}
        />
        
        <div style={{ position: 'absolute', right: '12px', top: '65%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
        
        {loading && (
          <div style={{ position: 'absolute', right: '48px', top: '50%', transform: 'translateY(-50%)' }}>
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="cases">Cases</option>
                  <option value="lawyers">Lawyers</option>
                  <option value="appointments">Appointments</option>
                  <option value="documents">Documents</option>
                </select>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
                
                <select
                  value={filters.date_range}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_range: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="mt-2 text-gray-600">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-900 font-medium">No results found</p>
                <p className="text-gray-500 text-sm mt-1">for "{query}"</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try different keywords or adjust filters
                </p>
              </div>
            ) : (
              <div>
                {results.map((result, index) => (
                  <motion.div
                    key={`${result.type}-${result.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result)}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-900 truncate">
                            {highlightText(result.title || result.name || 'Untitled', query)}
                          </div>
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            {getResultTypeLabel(result.type)}
                          </span>
                        </div>
                        
                        {result.description && (
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {highlightText(result.description, query)}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          {result.status && (
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              result.status === 'open' ? 'bg-blue-100 text-blue-700' :
                              result.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                              result.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                              result.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              result.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {result.status}
                            </span>
                          )}
                          {result.created_at && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(result.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="p-3 text-center bg-gray-50 text-sm text-gray-600">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
