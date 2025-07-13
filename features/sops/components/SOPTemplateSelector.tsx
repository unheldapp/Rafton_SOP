import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Input } from "../../../shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { 
  ArrowLeft,
  Search,
  FileText,
  Shield,
  Cog,
  Users,
  Computer,
  DollarSign,
  Scale,
  Heart,
  Zap,
  Plus,
  Eye,
  Clock,
  Star,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  department: string;
  icon: any;
  color: string;
  gradient: string;
  estimatedTime: string;
  sections: number;
  content: string;
  popular: boolean;
}

interface SOPTemplateSelectorProps {
  onNavigate: (page: any, template?: Template, folderId?: string) => void;
  currentFolderId?: string | null;
}

export function SOPTemplateSelector({ onNavigate, currentFolderId }: SOPTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const templates: Template[] = [
    {
      id: 'safety-chemical',
      title: 'Chemical Handling Procedures',
      description: 'Comprehensive safety protocols for handling chemicals in laboratory and manufacturing environments.',
      department: 'Safety',
      icon: Shield,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-rose-600',
      estimatedTime: '15 min',
      sections: 8,
      popular: true,
      content: `# Chemical Handling Procedures

## 1. Purpose and Scope
This Standard Operating Procedure (SOP) establishes the requirements for safe handling, storage, and disposal of chemicals in our facility.

## 2. Responsibilities
- **Laboratory Personnel**: Follow all safety protocols
- **Safety Officer**: Conduct regular inspections and training
- **Supervisors**: Ensure compliance and provide resources

## 3. Personal Protective Equipment (PPE)
### Required PPE:
- Safety goggles or face shield
- Chemical-resistant gloves (nitrile or neoprene)
- Laboratory coat or chemical-resistant apron
- Closed-toe shoes with chemical-resistant soles
- Respiratory protection when required

## 4. Chemical Storage Requirements
- Store chemicals in designated areas only
- Keep incompatible chemicals separated
- Maintain proper temperature and humidity controls
- Ensure adequate ventilation
- Label all containers clearly with contents and hazard warnings

## 5. Handling Procedures
### Before Use:
1. Review Safety Data Sheet (SDS)
2. Inspect PPE for damage
3. Ensure proper ventilation
4. Have spill cleanup materials readily available

### During Use:
1. Work in designated areas only
2. Never eat, drink, or smoke in chemical areas
3. Use appropriate measuring devices
4. Report any spills immediately

## 6. Emergency Procedures
### In Case of Exposure:
1. Remove contaminated clothing immediately
2. Flush affected area with water for 15 minutes
3. Seek medical attention if required
4. Report incident to supervisor

### In Case of Spill:
1. Evacuate the area if necessary
2. Contain the spill using appropriate materials
3. Clean up according to SDS instructions
4. Dispose of cleanup materials properly

## 7. Waste Disposal
- Use appropriate waste containers
- Follow local regulations for chemical disposal
- Complete waste tracking forms
- Schedule regular waste pickup

## 8. Training and Documentation
- Complete initial chemical safety training
- Annual refresher training required
- Maintain training records
- Document all incidents and near-misses`
    },
    {
      id: 'operations-maintenance',
      title: 'Equipment Maintenance Protocol',
      description: 'Standard procedures for preventive and corrective maintenance of manufacturing equipment.',
      department: 'Operations',
      icon: Cog,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-600',
      estimatedTime: '12 min',
      sections: 6,
      popular: true,
      content: `# Equipment Maintenance Protocol

## 1. Purpose and Scope
This SOP defines the procedures for routine maintenance, inspection, and repair of manufacturing equipment.

## 2. Maintenance Categories
### Preventive Maintenance:
- Scheduled inspections
- Lubrication schedules
- Filter replacements
- Calibration checks

### Corrective Maintenance:
- Emergency repairs
- Component replacements
- Troubleshooting procedures

## 3. Pre-Maintenance Safety Check
1. Power down equipment completely
2. Implement Lock Out/Tag Out (LOTO) procedures
3. Verify zero energy state
4. Ensure proper PPE is worn
5. Review equipment-specific safety requirements

## 4. Inspection Checklist
### Daily Inspections:
- Visual inspection of wear components
- Check for unusual noises or vibrations
- Verify proper operation of safety systems
- Review operating parameters

### Weekly Inspections:
- Lubrication point check
- Belt tension verification
- Electrical connection inspection
- Coolant level check

### Monthly Inspections:
- Calibration of sensors and instruments
- Bearing inspection
- Alignment verification
- Performance testing

## 5. Maintenance Procedures
### Lubrication:
1. Use only specified lubricants
2. Follow manufacturer's schedule
3. Check for contamination
4. Record lubrication dates

### Component Replacement:
1. Use only approved replacement parts
2. Follow manufacturer's procedures
3. Torque specifications must be followed
4. Update equipment records

## 6. Documentation Requirements
- Complete maintenance logs for each task
- Record all findings and actions taken
- Update equipment history files
- Schedule next maintenance cycle
- Report any defects or concerns immediately`
    },
    {
      id: 'qa-control',
      title: 'Quality Control Standards',
      description: 'Quality assurance procedures for product testing and compliance verification.',
      department: 'QA',
      icon: Shield,
      color: 'bg-green-500',
      gradient: 'from-emerald-500 to-teal-600',
      estimatedTime: '18 min',
      sections: 7,
      popular: false,
      content: `# Quality Control Standards

## 1. Purpose and Scope
This SOP establishes quality control procedures for manufacturing processes to ensure product compliance and customer satisfaction.

## 2. Quality Control Framework
### Incoming Materials:
- Supplier qualification
- Certificate of analysis review
- Sample testing protocols
- Reject procedures

### In-Process Controls:
- Critical control points
- Statistical process control
- Real-time monitoring
- Corrective actions

## 3. Incoming Material Inspection
1. Verify supplier certifications
2. Conduct incoming inspection per specifications
3. Perform sample testing as required
4. Document inspection results
5. Quarantine non-conforming materials

## 4. In-Process Quality Checks
### Critical Control Points:
- Temperature monitoring
- Pressure verification
- Flow rate checks
- Composition analysis

### Statistical Process Control:
- Control chart maintenance
- Process capability studies
- Trend analysis
- Out-of-control investigations

## 5. Final Product Testing
### Required Tests:
- Performance validation
- Safety compliance testing
- Packaging integrity
- Shelf-life verification

### Testing Procedures:
1. Follow approved test methods
2. Use calibrated equipment
3. Document all results
4. Investigate out-of-specification results

## 6. Non-Conformance Handling
1. Identify and segregate non-conforming products
2. Investigate root cause
3. Implement corrective actions
4. Document disposition decisions
5. Verify effectiveness of corrections

## 7. Documentation and Records
- Maintain complete testing records
- Store samples according to requirements
- Generate quality reports
- Conduct management reviews
- Ensure traceability throughout process`
    },
    {
      id: 'hr-onboarding',
      title: 'Employee Onboarding Process',
      description: 'Complete guide for new employee orientation and integration procedures.',
      department: 'HR',
      icon: Users,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-violet-600',
      estimatedTime: '20 min',
      sections: 9,
      popular: false,
      content: `# Employee Onboarding Process

## 1. Purpose and Scope
This SOP outlines the comprehensive onboarding process for new employees to ensure smooth integration and compliance.

## 2. Pre-Arrival Preparation
### HR Responsibilities:
- Prepare workstation and equipment
- Create user accounts and access permissions
- Schedule orientation sessions
- Prepare welcome materials

### Manager Responsibilities:
- Plan first week activities
- Identify buddy/mentor
- Prepare job-specific training plan
- Review performance expectations

## 3. First Day Activities
### Morning (9:00 AM - 12:00 PM):
1. Welcome and facility tour
2. IT setup and security briefing
3. Complete required paperwork
4. Review employee handbook

### Afternoon (1:00 PM - 5:00 PM):
1. Department introduction
2. Meet team members
3. Begin job-specific training
4. Set up initial goals

## 4. First Week Checklist
- [ ] Complete all required training modules
- [ ] Attend safety orientation
- [ ] Review job description and expectations
- [ ] Complete emergency contact information
- [ ] Obtain necessary access cards/keys
- [ ] Set up direct deposit and benefits

## 5. Training Requirements
### Mandatory Training:
- Company policies and procedures
- Safety and emergency procedures
- IT security and data protection
- Harassment and discrimination prevention

### Job-Specific Training:
- Role-specific procedures
- Equipment operation
- Quality requirements
- Customer service standards

## 6. 30-Day Review
### Manager Evaluation:
- Performance assessment
- Goal achievement review
- Training effectiveness
- Areas for improvement

### Employee Feedback:
- Job satisfaction survey
- Training feedback
- Suggestion for improvements
- Questions or concerns

## 7. 90-Day Assessment
1. Comprehensive performance review
2. Goal adjustment if needed
3. Career development discussion
4. Benefits enrollment period
5. Probationary period evaluation

## 8. Documentation Requirements
- Maintain training records
- Document performance evaluations
- Store completed forms securely
- Update HRIS system regularly

## 9. Continuous Improvement
- Collect onboarding feedback
- Review and update procedures
- Benchmark against best practices
- Measure onboarding effectiveness`
    },
    {
      id: 'it-security',
      title: 'IT Security Procedures',
      description: 'Cybersecurity protocols and data protection measures for all IT systems.',
      department: 'IT',
      icon: Computer,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-blue-600',
      estimatedTime: '14 min',
      sections: 8,
      popular: true,
      content: `# IT Security Procedures

## 1. Purpose and Scope
This SOP establishes cybersecurity protocols and data protection measures for all IT systems and users.

## 2. Access Control Management
### User Account Management:
- Unique user accounts for each employee
- Role-based access permissions
- Regular access reviews
- Account deactivation procedures

### Password Requirements:
- Minimum 12 characters
- Combination of letters, numbers, and symbols
- Changed every 90 days
- No password reuse for last 12 passwords

## 3. Data Classification and Handling
### Classification Levels:
- **Public**: General information
- **Internal**: Business sensitive
- **Confidential**: Restricted access
- **Restricted**: Highly sensitive

### Handling Requirements:
- Appropriate labeling and marking
- Secure storage and transmission
- Authorized access only
- Proper disposal procedures

## 4. Network Security
### Firewall Configuration:
- Deny-all default policy
- Approved ports and protocols only
- Regular rule reviews
- Logging and monitoring

### Wireless Security:
- WPA3 encryption minimum
- Guest network isolation
- Regular password changes
- Access point monitoring

## 5. Email and Communication Security
### Email Guidelines:
- Verify sender identity
- Be cautious with attachments
- Use encryption for sensitive data
- Report suspicious emails

### Communication Tools:
- Approved platforms only
- Business use guidelines
- Data retention policies
- Privacy considerations

## 6. Incident Response
### Incident Categories:
- Malware infections
- Data breaches
- System compromises
- Unauthorized access

### Response Procedures:
1. Immediate containment
2. Assessment and analysis
3. Notification procedures
4. Recovery actions
5. Lessons learned

## 7. Backup and Recovery
### Backup Requirements:
- Daily incremental backups
- Weekly full backups
- Monthly offsite storage
- Quarterly recovery testing

### Recovery Procedures:
- Prioritized system restoration
- Data integrity verification
- Service restoration timeline
- Business continuity measures

## 8. Training and Awareness
- Annual security training
- Phishing simulation exercises
- Security awareness updates
- Incident reporting procedures`
    },
    {
      id: 'finance-expense',
      title: 'Expense Management Process',
      description: 'Guidelines for expense reporting, approval, and reimbursement procedures.',
      department: 'Finance',
      icon: DollarSign,
      color: 'bg-yellow-500',
      gradient: 'from-amber-500 to-orange-600',
      estimatedTime: '10 min',
      sections: 5,
      popular: false,
      content: `# Expense Management Process

## 1. Purpose and Scope
This SOP defines the procedures for expense reporting, approval, and reimbursement to ensure accurate financial reporting and compliance.

## 2. Expense Categories
### Reimbursable Expenses:
- Travel and accommodation
- Business meals and entertainment
- Training and education
- Office supplies and equipment
- Professional services

### Non-Reimbursable Expenses:
- Personal expenses
- Commuting costs
- Alcoholic beverages (unless client entertainment)
- Fines and penalties
- Unauthorized purchases

## 3. Expense Reporting Process
### Required Documentation:
- Original receipts for all expenses
- Completed expense report form
- Business purpose justification
- Approval signatures

### Submission Timeline:
- Submit within 30 days of expense
- Monthly submission preferred
- Late submissions require justification
- Year-end deadline: January 15th

## 4. Approval Process
### Approval Limits:
- Up to $500: Direct supervisor
- $501-$2,000: Department manager
- $2,001-$5,000: Director approval
- Over $5,000: Executive approval

### Review Criteria:
- Business necessity
- Policy compliance
- Documentation completeness
- Budget availability

## 5. Reimbursement Process
### Processing Timeline:
- Approved expenses processed within 10 business days
- Direct deposit to employee account
- Notification of payment sent via email
- Exception handling for urgent requests

### Tax Implications:
- Most business expenses are non-taxable
- Personal use items are taxable
- Proper documentation required
- Consult tax advisor for complex situations`
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || template.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(templates.map(t => t.department))];
  const popularTemplates = templates.filter(t => t.popular);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('sops', undefined, currentFolderId)}
            className="hover:bg-purple-100 text-purple-600 hover:text-purple-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SOPs
          </Button>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-violet-700 bg-clip-text text-transparent mb-3">
          Choose a Template
        </h1>
        <p className="text-gray-600 text-lg">
          Start with a pre-built template or create a blank SOP from scratch
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-purple-200 focus:border-violet-500 focus:ring-violet-500/20 bg-white shadow-sm"
            />
          </div>
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48 border-purple-200 bg-white shadow-sm">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Popular Templates Section */}
      {departmentFilter === 'all' && !searchTerm && (
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Popular Templates</h2>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              Most Used
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {popularTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card
                  key={template.id}
                  className="min-h-[320px] hover:shadow-xl hover:shadow-black/10 transition-all duration-300 border-0 overflow-hidden group"
                >
                  {/* Gradient Header */}
                  <div className={`h-20 bg-gradient-to-r ${template.gradient} relative`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 left-4">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                        <TrendingUp className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">Popular</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="flex flex-col flex-1 p-6 pt-4">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                          {template.department}
                        </Badge>
                        <div className="flex items-center space-x-3 text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{template.sections} sections</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-purple-200 hover:bg-purple-50"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className={`flex-1 bg-gradient-to-r ${template.gradient} hover:shadow-lg hover:scale-105 transition-all duration-200 text-white border-0`}
                          onClick={() => onNavigate('editor', template, currentFolderId)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {departmentFilter === 'all' && !searchTerm ? 'All Templates' : 'Templates'}
          </h2>
          <span className="text-gray-500 text-sm">
            ({filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blank Template Card */}
          <Card 
            className="min-h-[300px] border-2 border-dashed border-purple-300 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-purple-50 to-violet-50/50"
            onClick={() => onNavigate('editor', undefined, currentFolderId)}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Blank SOP</h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Start from scratch with a blank document and build your SOP from the ground up
              </p>
            </CardContent>
          </Card>

          {/* Template Cards */}
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card
                key={template.id}
                className="min-h-[300px] hover:shadow-lg hover:shadow-black/5 transition-all duration-300 border-purple-200 bg-white group"
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${template.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    {template.popular && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Popular</span>
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight text-gray-900">{template.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col flex-1 pt-0">
                  <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                    {template.description}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 font-medium">
                        {template.department}
                      </Badge>
                      <div className="flex items-center space-x-3 text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{template.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span className="font-medium">{template.sections} sections</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white hover:shadow-lg transition-all duration-200"
                        onClick={() => onNavigate('editor', template, currentFolderId)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && searchTerm && (
        <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search terms or filters.
          </p>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setDepartmentFilter('all');
            }}
            variant="outline"
            className="border-purple-300 hover:bg-purple-50"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-12 text-center bg-gradient-to-r from-purple-50 to-violet-100 rounded-2xl p-8 border border-purple-200">
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">
              {templates.length} templates available
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">
              {templates.filter(t => t.popular).length} popular templates
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">
              {departments.length} departments covered
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}