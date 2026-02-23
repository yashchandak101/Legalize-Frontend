'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  X,
  Menu,
  Home,
  FileText,
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Shield,
  Zap
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { LoadingSpinner, PageLoader, InlineLoader } from '../../components/ui/LoadingSpinner';
import Notifications from '../../components/Notifications';
import GlobalSearch from '../../components/GlobalSearch';

export default function UIDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: ''
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', message: '', category: '' });
  };

  const mockUser = { id: '1', name: 'John Doe' };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized performance for seamless user experience",
      color: "text-yellow-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your peace of mind",
      color: "text-green-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Friendly",
      description: "Intuitive interface designed for everyone",
      color: "text-blue-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics Driven",
      description: "Data-driven insights to help you grow",
      color: "text-purple-500"
    }
  ];

  const stats = [
    { label: "Active Users", value: "10,234", icon: <Users className="w-5 h-5" /> },
    { label: "Success Rate", value: "98.5%", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Avg Response", value: "1.2s", icon: <Zap className="w-5 h-5" /> },
    { label: "Satisfaction", value: "4.9/5", icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <span className="font-bold text-xl">Legalize UI</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Components</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <GlobalSearch placeholder="Search components..." />
              <Notifications user={mockUser} />
              <Button variant="outline" size="sm" icon={<Settings className="w-4 h-4" />}>
                Settings
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Modern UI Components
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}for Legalize
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the new generation of user interface components with smooth animations, 
              modern design patterns, and exceptional accessibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setIsModalOpen(true)}
                icon={<CheckCircle className="w-5 h-5" />}
              >
                Try Interactive Demo
              </Button>
              <Button variant="outline" size="lg" icon={<FileText className="w-5 h-5" />}>
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600">Built with modern web technologies</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="text-center h-full">
                  <CardBody className="p-8">
                    <div className={`w-16 h-16 ${feature.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interactive Components</h2>
            <p className="text-lg text-gray-600">Try out our enhanced UI components</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Demo */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Form Components</h3>
              </CardHeader>
              <CardBody>
                <form className="space-y-4">
                  <Input
                    name="name"
                    label="Full Name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    icon={<User className="w-5 h-5 text-gray-400" />}
                  />
                  <Input
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={<MessageSquare className="w-5 h-5 text-gray-400" />}
                  />
                  <Select
                    name="category"
                    label="Category"
                    value={formData.category}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select a category' },
                      { value: 'general', label: 'General Inquiry' },
                      { value: 'support', label: 'Technical Support' },
                      { value: 'feedback', label: 'Feedback' }
                    ]}
                  />
                  <Textarea
                    name="message"
                    label="Message"
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </form>
              </CardBody>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  loading={loading}
                  icon={<CheckCircle className="w-5 h-5" />}
                >
                  {loading ? 'Submitting...' : 'Submit Form'}
                </Button>
              </CardFooter>
            </Card>

            {/* Button Variants Demo */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Button Variants</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Button Sizes</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Button Variants</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary">Primary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="warning">Warning</Button>
                      <Button variant="danger">Danger</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Loading States</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button loading>Loading</Button>
                      <InlineLoader message="Processing..." />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        {stat.icon}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalHeader>
          <h3 className="text-xl font-semibold text-gray-900">Interactive Demo Modal</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-600">
              This is an example of our enhanced modal component with smooth animations 
              and modern design. Try interacting with the elements below.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Feature Highlight</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    All components are built with accessibility in mind and include 
                    proper ARIA labels, keyboard navigation, and screen reader support.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LoadingSpinner />
              <span className="text-gray-600">Loading spinner example</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              icon={<X className="w-4 h-4" />}
            >
              Close
            </Button>
            <Button 
              onClick={() => setIsModalOpen(false)}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Got it!
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
