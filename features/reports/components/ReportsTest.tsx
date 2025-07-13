import React, { useState, useEffect } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { reportService } from '../../../shared/services/reportService';
import { useAuth } from '../../../shared/context/AuthContext';

export function ReportsTest() {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testReportEndpoints = async () => {
    if (!currentUser?.company_id) {
      setError('No company ID found');
      return;
    }

    setLoading(true);
    setError(null);
    const results = [];

    const testFilters = {
      dateRange: 'last-30-days',
      status: 'all',
      department: 'all',
      priority: 'all',
      documentType: 'all',
      user: 'all'
    };

    const testPagination = {
      page: 1,
      itemsPerPage: 5,
      search: ''
    };

    // Test Acknowledgment Report
    try {
      console.log('Testing Acknowledgment Report...');
      const acknowledgmentData = await reportService.getAcknowledgmentReport(
        currentUser.company_id,
        testFilters,
        testPagination
      );
      results.push({
        report: 'Acknowledgment',
        status: 'success',
        data: acknowledgmentData.data.length,
        total: acknowledgmentData.total,
        stats: acknowledgmentData.stats
      });
      console.log('Acknowledgment Report:', acknowledgmentData);
    } catch (err) {
      console.error('Acknowledgment Report Error:', err);
      results.push({
        report: 'Acknowledgment',
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Test SOP Review Report
    try {
      console.log('Testing SOP Review Report...');
      const sopReviewData = await reportService.getSOPReviewReport(
        currentUser.company_id,
        testFilters,
        testPagination
      );
      results.push({
        report: 'SOP Review',
        status: 'success',
        data: sopReviewData.data.length,
        total: sopReviewData.total,
        stats: sopReviewData.stats
      });
      console.log('SOP Review Report:', sopReviewData);
    } catch (err) {
      console.error('SOP Review Report Error:', err);
      results.push({
        report: 'SOP Review',
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Test User Activity Report
    try {
      console.log('Testing User Activity Report...');
      const userActivityData = await reportService.getUserActivityReport(
        currentUser.company_id,
        testFilters,
        testPagination
      );
      results.push({
        report: 'User Activity',
        status: 'success',
        data: userActivityData.data.length,
        total: userActivityData.total,
        stats: userActivityData.stats
      });
      console.log('User Activity Report:', userActivityData);
    } catch (err) {
      console.error('User Activity Report Error:', err);
      results.push({
        report: 'User Activity',
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Test Compliance Summary Report
    try {
      console.log('Testing Compliance Summary Report...');
      const complianceData = await reportService.getComplianceSummaryReport(
        currentUser.company_id,
        testFilters,
        testPagination
      );
      results.push({
        report: 'Compliance Summary',
        status: 'success',
        data: complianceData.data.length,
        total: complianceData.total,
        stats: complianceData.stats
      });
      console.log('Compliance Summary Report:', complianceData);
    } catch (err) {
      console.error('Compliance Summary Report Error:', err);
      results.push({
        report: 'Compliance Summary',
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Test Audit Trail Report
    try {
      console.log('Testing Audit Trail Report...');
      const auditData = await reportService.getAuditTrailReport(
        currentUser.company_id,
        testFilters,
        testPagination
      );
      results.push({
        report: 'Audit Trail',
        status: 'success',
        data: auditData.data.length,
        total: auditData.total,
        stats: auditData.stats
      });
      console.log('Audit Trail Report:', auditData);
    } catch (err) {
      console.error('Audit Trail Report Error:', err);
      results.push({
        report: 'Audit Trail',
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Reports Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={testReportEndpoints}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test All Report Endpoints'}
            </Button>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded">
                Error: {error}
              </div>
            )}

            {testResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong>{result.report}</strong>
                        <div className="text-sm text-gray-600">
                          Status: {result.status}
                        </div>
                        {result.status === 'success' && (
                          <div className="text-sm text-gray-600">
                            Data: {result.data} items, Total: {result.total}
                          </div>
                        )}
                        {result.status === 'error' && (
                          <div className="text-sm text-red-600">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        result.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 