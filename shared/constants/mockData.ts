import { User, SOP, WorkingCopy } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'John Smith', 
    email: 'john@company.com', 
    role: 'admin', 
    lastActive: '2025-07-09', 
    status: 'active', 
    department: 'Safety' 
  },
  { 
    id: '2', 
    name: 'Sarah Johnson', 
    email: 'sarah@company.com', 
    role: 'employee', 
    lastActive: '2025-07-08', 
    status: 'active', 
    department: 'Operations' 
  },
  { 
    id: '3', 
    name: 'Mike Brown', 
    email: 'mike@auditor.com', 
    role: 'auditor', 
    lastActive: '2025-07-07', 
    status: 'active', 
    department: 'QA' 
  },
  { 
    id: '4', 
    name: 'Emily Davis', 
    email: 'emily@company.com', 
    role: 'employee', 
    lastActive: '2025-07-08', 
    status: 'active', 
    department: 'HR' 
  },
  { 
    id: '5', 
    name: 'James Wilson', 
    email: 'james@company.com', 
    role: 'employee', 
    lastActive: '2025-07-06', 
    status: 'active', 
    department: 'IT' 
  },
  { 
    id: '6', 
    name: 'Lisa Chen', 
    email: 'lisa@company.com', 
    role: 'employee', 
    lastActive: '2025-07-09', 
    status: 'active', 
    department: 'Finance' 
  },
];

export const MOCK_SOPS: SOP[] = [
  {
    id: '1',
    title: 'Chemical Handling Procedures',
    department: 'Safety',
    status: 'published',
    acknowledgedPercent: 85,
    lastUpdated: '2025-07-08',
    version: '2.0',
    content: `# Chemical Handling Procedures

## 1. Purpose and Scope
This Standard Operating Procedure (SOP) establishes the requirements for safe handling, storage, and disposal of chemicals in our facility.

## 2. Personal Protective Equipment (PPE)
### Required PPE:
- Safety goggles or face shield
- Chemical-resistant gloves (nitrile or neoprene)  
- Laboratory coat or chemical-resistant apron
- Closed-toe shoes with chemical-resistant soles

## 3. Storage Requirements
- Store chemicals in designated areas only
- Keep incompatible chemicals separated
- Maintain proper temperature and humidity controls
- Ensure adequate ventilation

## 4. Emergency Procedures
### In Case of Exposure:
1. Remove contaminated clothing immediately
2. Flush affected area with water for 15 minutes
3. Seek medical attention if required
4. Report incident to supervisor`,
    author: 'John Smith',
    assignedTo: ['sarah@company.com', 'mike@company.com']
  },
  {
    id: '2',
    title: 'Equipment Maintenance Protocol',
    department: 'Operations',
    status: 'pending-review',
    acknowledgedPercent: 0,
    lastUpdated: '2025-07-09',
    version: '1.0',
    content: `# Equipment Maintenance Protocol

## 1. Purpose and Scope
This SOP defines the procedures for routine maintenance, inspection, and repair of manufacturing equipment.

## 2. Pre-maintenance Safety Check
1. Power down equipment completely
2. Implement Lock Out/Tag Out (LOTO) procedures
3. Verify zero energy state
4. Ensure proper PPE is worn

## 3. Inspection Checklist
### Daily Inspections:
- Visual inspection of wear components
- Check for unusual noises or vibrations
- Verify proper operation of safety systems

## 4. Documentation
- Complete maintenance logs for each task
- Record all findings and actions taken
- Schedule next maintenance cycle`,
    author: 'Sarah Johnson',
    assignedTo: []
  },
  {
    id: '3',
    title: 'Quality Control Standards',
    department: 'QA',
    status: 'draft',
    acknowledgedPercent: 0,
    lastUpdated: '2025-07-07',
    version: '1.0',
    content: `# Quality Control Standards

## 1. Purpose and Scope
This SOP establishes quality control procedures for manufacturing processes.

## 2. Incoming Material Inspection
1. Verify supplier certifications
2. Conduct sample testing
3. Document inspection results

## 3. In-process Quality Checks
- Monitor critical control points
- Statistical process control
- Non-conformance handling`,
    author: 'John Smith',
    assignedTo: []
  },
  {
    id: '4',
    title: 'Emergency Response Plan',
    department: 'Safety',
    status: 'published',
    acknowledgedPercent: 92,
    lastUpdated: '2025-07-05',
    version: '3.0',
    content: 'Comprehensive emergency response procedures for workplace incidents.',
    author: 'John Smith',
    assignedTo: ['sarah@company.com', 'mike@company.com']
  },
  {
    id: '5',
    title: 'Data Backup Procedures',
    department: 'IT',
    status: 'published',
    acknowledgedPercent: 78,
    lastUpdated: '2025-07-06',
    version: '1.0',
    content: 'Daily and weekly backup procedures for critical business data.',
    author: 'Sarah Johnson',
    assignedTo: ['john@company.com']
  },
  {
    id: '6',
    title: 'Customer Service Guidelines',
    department: 'Finance',
    status: 'draft',
    acknowledgedPercent: 0,
    lastUpdated: '2025-07-04',
    version: '1.0',
    content: 'Standard procedures for customer interaction and service delivery.',
    author: 'Sarah Johnson',
    assignedTo: []
  }
];

export const MOCK_WORKING_COPIES: WorkingCopy[] = [
  {
    id: 'wc-1',
    originalSOPId: '1',
    title: 'Chemical Handling Procedures - Safety Update',
    content: `# Chemical Handling Procedures

## 1. Purpose and Scope
This Standard Operating Procedure (SOP) establishes the requirements for safe handling, storage, and disposal of chemicals in our facility.

## 2. Personal Protective Equipment (PPE)
### Required PPE:
- Safety goggles or face shield with anti-fog coating
- Chemical-resistant gloves (nitrile or neoprene recommended)
- Laboratory coat or chemical-resistant apron (flame-resistant material)
- Closed-toe shoes with chemical-resistant soles
- Respiratory protection when working with volatile compounds

## 3. Storage Requirements
- Store chemicals in designated areas only with proper signage
- Keep incompatible chemicals separated according to SDS requirements
- Maintain proper temperature and humidity controls with monitoring systems
- Ensure adequate ventilation with minimum 6 air changes per hour
- Install emergency eyewash stations within 10 seconds travel time

## 4. Emergency Procedures
### In Case of Exposure:
1. Remove contaminated clothing immediately and dispose properly
2. Flush affected area with water for 15 minutes minimum
3. Seek medical attention if required - call emergency services
4. Report incident to supervisor within 1 hour
5. Complete incident report form within 24 hours`,
    author: 'Sarah Johnson',
    createdDate: '2025-07-09',
    description: 'Updated PPE requirements and added emergency response improvements based on recent safety audit findings.',
    status: 'submitted',
    reviewer: 'John Smith',
    reviewComments: 'The PPE updates look comprehensive. Please add specific requirements for respiratory protection selection criteria.'
  }
];