import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../shared/components/ui/accordion";
import { Badge } from "../../../shared/components/ui/badge";
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageCircle, 
  ExternalLink,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  Shield,
  Users,
  Settings,
  Download,
  Eye,
  RefreshCcw
} from 'lucide-react';

interface HelpFAQPageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export function HelpFAQPage({ currentUser }: HelpFAQPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      id: 'acknowledgments',
      title: 'Document Acknowledgments',
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50',
      questions: [
        {
          id: 'what-is-acknowledgment',
          question: 'What does it mean to acknowledge a document?',
          answer: 'Acknowledging a document means you confirm that you have read, understood, and agree to follow the procedures or policies outlined in that document. This creates a record that you are aware of the current requirements and helps ensure compliance across the organization.'
        },
        {
          id: 'how-to-acknowledge',
          question: 'How do I acknowledge a document?',
          answer: 'To acknowledge a document: 1) Go to "Assigned to Me" in the navigation menu, 2) Click on the document you need to acknowledge, 3) Read through the entire document carefully, 4) Click the "Acknowledge Document" button at the bottom, 5) The document will be marked as acknowledged in your records.'
        },
        {
          id: 'missed-deadline',
          question: 'What happens if I miss an acknowledgment deadline?',
          answer: 'If you miss a deadline, the document will be marked as "Overdue" and your supervisor may be notified. You can still acknowledge overdue documents, but it\'s important to complete them as soon as possible to maintain compliance. Repeated missed deadlines may require additional training or follow-up.'
        },
        {
          id: 'acknowledge-again',
          question: 'Do I need to acknowledge documents again if they\'re updated?',
          answer: 'Yes, when a document is updated, you will need to acknowledge the new version. This ensures you are aware of any changes to procedures or policies that may affect your work. You\'ll receive a notification when a document you\'ve previously acknowledged has been updated.'
        }
      ]
    },
    {
      id: 'document-access',
      title: 'Document Access & Navigation',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      questions: [
        {
          id: 'find-documents',
          question: 'How do I find specific documents or SOPs?',
          answer: 'You can find documents in several ways: 1) Use the "All Documents" section to browse the complete library, 2) Use the search bar to find documents by title, department, or tags, 3) Filter documents by department, type, or tags, 4) Check "Assigned to Me" for documents requiring your acknowledgment.'
        },
        {
          id: 'access-old-documents',
          question: 'Can I access documents I\'ve already acknowledged?',
          answer: 'Yes! All acknowledged documents remain accessible in the "All Documents" section. You can view them anytime for reference, even after acknowledgment. The system maintains a complete history of all documents you\'ve accessed and acknowledged.'
        },
        {
          id: 'download-documents',
          question: 'Can I download documents for offline viewing?',
          answer: 'Yes, most documents can be downloaded as PDF files for offline viewing. Look for the "Download PDF" button when viewing a document. However, remember that downloaded versions may become outdated if the document is updated, so always check the online version for the most current information.'
        },
        {
          id: 'document-versions',
          question: 'How do I know if I\'m viewing the latest version of a document?',
          answer: 'The current version number is displayed prominently on each document. If you\'re viewing an older version, you\'ll see a notification directing you to the latest version. Always ensure you\'re acknowledging the most recent version of any document.'
        }
      ]
    },
    {
      id: 'deadlines-reminders',
      title: 'Deadlines & Reminders',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      questions: [
        {
          id: 'deadline-calculation',
          question: 'How are acknowledgment deadlines determined?',
          answer: 'Acknowledgment deadlines are set by your supervisor or compliance team when assigning documents. Deadlines typically range from 3-14 days depending on the document\'s priority and complexity. Critical safety documents may have shorter deadlines, while general policies may have longer ones.'
        },
        {
          id: 'reminder-frequency',
          question: 'When will I receive reminders about pending acknowledgments?',
          answer: 'You\'ll receive automatic reminders: 1) Initial notification when a document is assigned, 2) Reminder 2 days before the deadline, 3) Reminder on the day of the deadline, 4) Daily reminders after the deadline until acknowledged. You can also check your notifications page anytime for current status.'
        },
        {
          id: 'priority-levels',
          question: 'What do the different priority levels mean?',
          answer: 'Priority levels indicate urgency: Low (general information, flexible deadlines), Medium (standard procedures, normal deadlines), High (important policies, shorter deadlines), Critical/Urgent (safety-critical or time-sensitive information, immediate attention required). Higher priority documents typically have shorter acknowledgment deadlines.'
        }
      ]
    },
    {
      id: 'notifications-system',
      title: 'Notifications & Alerts',
      icon: AlertCircle,
      color: 'text-purple-600 bg-purple-50',
      questions: [
        {
          id: 'notification-types',
          question: 'What types of notifications will I receive?',
          answer: 'You\'ll receive notifications for: New document assignments, Acknowledgment reminders, Document updates requiring re-acknowledgment, Approaching deadlines, Overdue acknowledgments, System maintenance announcements, and General compliance updates. All notifications appear in your Notifications tab and may also be sent via email.'
        },
        {
          id: 'manage-notifications',
          question: 'How do I manage my notifications?',
          answer: 'In the Notifications page, you can: Mark individual notifications as read/unread, Filter notifications by type or status, Mark all notifications as read at once, Delete notifications you no longer need, and Click on notifications to go directly to the related document or action.'
        },
        {
          id: 'missed-notifications',
          question: 'What if I miss important notifications?',
          answer: 'All notifications are stored in your Notifications tab until you delete them. If you miss email notifications, you can always check the in-app notifications for complete history. Critical notifications may also be escalated to your supervisor if not addressed within the specified timeframe.'
        }
      ]
    },
    {
      id: 'technical-support',
      title: 'Technical Issues',
      icon: Settings,
      color: 'text-gray-600 bg-gray-50',
      questions: [
        {
          id: 'login-issues',
          question: 'I\'m having trouble logging in. What should I do?',
          answer: 'For login issues: 1) Verify your username and password are correct, 2) Check if Caps Lock is on, 3) Try clearing your browser cache and cookies, 4) Ensure you\'re using a supported browser (Chrome, Firefox, Safari, Edge), 5) Contact IT support if the problem persists. Your account may be temporarily locked after multiple failed attempts.'
        },
        {
          id: 'browser-compatibility',
          question: 'Which browsers are supported?',
          answer: 'The compliance platform works best with: Chrome (recommended), Firefox, Safari, and Microsoft Edge. We recommend using the latest version of your preferred browser. Internet Explorer is not supported. If you experience issues, try switching browsers or updating to the latest version.'
        },
        {
          id: 'mobile-access',
          question: 'Can I access the system from my mobile device?',
          answer: 'Yes! The platform is fully responsive and works on smartphones and tablets. You can acknowledge documents, view notifications, and browse the document library from any device with internet access. The mobile experience is optimized for quick actions and document review.'
        }
      ]
    }
  ];

  const contactInfo = {
    support: {
      email: 'compliance@rafton.com',
      phone: '+1 (555) 123-4567',
      hours: 'Monday - Friday, 8:00 AM - 6:00 PM EST'
    },
    emergency: {
      email: 'urgent@rafton.com',
      phone: '+1 (555) 911-HELP',
      description: 'For critical safety or compliance issues'
    },
    complianceOfficer: {
      name: 'Sarah Johnson',
      title: 'Chief Compliance Officer',
      email: 'sarah.johnson@rafton.com',
      phone: '+1 (555) 123-4501'
    }
  };

  const quickActions = [
    {
      title: 'View Assigned Documents',
      description: 'Check documents requiring acknowledgment',
      icon: FileText,
      action: 'assigned',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Browse Document Library',
      description: 'Access all available documents',
      icon: BookOpen,
      action: 'documents',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Check Notifications',
      description: 'View recent alerts and reminders',
      icon: AlertCircle,
      action: 'notifications',
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  // Filter FAQ items based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchTerm === '' || 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Help & FAQ</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about using the compliance platform, 
              acknowledging documents, and managing your compliance responsibilities.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.action} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6 mb-8">
          {filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.questions.length} questions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left hover:text-purple-600">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-sm max-w-none text-gray-700">
                            {faq.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Still Need Help?</CardTitle>
                <CardDescription>Get in touch with our support team or compliance officers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* General Support */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">General Support</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${contactInfo.support.email}`} className="text-blue-600 hover:underline">
                      {contactInfo.support.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{contactInfo.support.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{contactInfo.support.hours}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-gray-900">Emergency Contact</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${contactInfo.emergency.email}`} className="text-red-600 hover:underline">
                      {contactInfo.emergency.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{contactInfo.emergency.phone}</span>
                  </div>
                  <p className="text-xs text-gray-500">{contactInfo.emergency.description}</p>
                </div>
              </div>

              {/* Compliance Officer */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Compliance Officer</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-900">{contactInfo.complianceOfficer.name}</p>
                    <p className="text-xs text-gray-500">{contactInfo.complianceOfficer.title}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${contactInfo.complianceOfficer.email}`} className="text-purple-600 hover:underline">
                      {contactInfo.complianceOfficer.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{contactInfo.complianceOfficer.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h4 className="font-medium text-gray-900 mb-1">Additional Resources</h4>
                  <p className="text-sm text-gray-600">Access training materials and documentation</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Training Portal
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    User Guide
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Results */}
        {searchTerm && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find any FAQs matching "{searchTerm}". Try different keywords or contact support.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}