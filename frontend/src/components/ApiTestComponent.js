import React, { useState } from 'react';
import { runApiTests } from '../utils/apiTest';

export default function ApiTestComponent() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const testResults = await runApiTests();
      setResults(testResults);
    } catch (error) {
      console.error('Test execution failed:', error);
      setResults({
        passed: [],
        failed: [{ name: 'Test Execution', error: error.message }],
        total: 1,
        successRate: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">API Test Suite</h2>
      
      <div className="mb-6">
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run API Tests'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Test Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{results.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.passed.length}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{results.failed.length}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(results.successRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {results.failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Failed Tests</h3>
              <div className="space-y-2">
                {results.failed.map((error, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-red-200">
                    <div className="font-medium text-red-800">{error.name}</div>
                    <div className="text-sm text-red-600">{error.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.passed.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Passed Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.passed.map((test, index) => (
                  <div key={index} className="bg-white p-2 rounded border border-green-200">
                    <div className="text-sm text-green-800">✅ {test.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tests both public and authenticated endpoints</li>
          <li>• Verifies API connectivity and response formats</li>
          <li>• Checks authentication and authorization</li>
          <li>• Validates error handling and status codes</li>
          <li>• Results are logged to browser console for debugging</li>
        </ul>
      </div>
    </div>
  );
} 