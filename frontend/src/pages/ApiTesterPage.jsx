import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Play, Shield, ChevronRight, Terminal, Globe, Send, 
  Activity, ArrowLeft, RefreshCw, Key, User, FileText, 
  DollarSign, ClipboardList, Package, HelpCircle, Code, Calendar
} from 'lucide-react';

const ENDPOINTS = [
  // ── AUTH SERVICE ──
  {
    service: 'Auth Service',
    icon: Key,
    name: 'Login User',
    method: 'POST',
    path: '/auth/login',
    description: 'Authenticate user credentials and return a JWT access token.',
    defaultBody: JSON.stringify({
      username: 'priyanshjais123@gmail.com',
      password: '2401301024'
    }, null, 2),
    requiresAuth: false
  },
  {
    service: 'Auth Service',
    icon: Key,
    name: 'Register User',
    method: 'POST',
    path: '/auth/register',
    description: 'Create a new local patient user account.',
    defaultBody: JSON.stringify({
      fullName: 'Rahul Sharma',
      username: 'rahul.sharma@example.com',
      password: 'SecurePass@123',
      phone: '9876543210',
      role: 'PATIENT'
    }, null, 2),
    requiresAuth: false
  },
  {
    service: 'Auth Service',
    icon: Key,
    name: 'Verify Email OTP',
    method: 'POST',
    path: '/auth/verify-otp',
    description: 'Verify user registration OTP code.',
    params: [
      { key: 'username', value: 'rahul.sharma@example.com', description: 'User registration email' },
      { key: 'otp', value: '123456', description: 'One-time password received' }
    ],
    requiresAuth: false
  },
  // ── DOCTOR SERVICE ──
  {
    service: 'Doctor Service',
    icon: User,
    name: 'Public Doctors Search',
    method: 'GET',
    path: '/public/doctors',
    description: 'Search for active doctors with paging filter options.',
    params: [
      { key: 'name', value: '', description: 'Filter by doctor name' },
      { key: 'specialization', value: '', description: 'Filter by specialty (e.g. Cardiology)' },
      { key: 'page', value: '0', description: 'Page offset' },
      { key: 'size', value: '10', description: 'Page size limit' }
    ],
    requiresAuth: false
  },
  {
    service: 'Doctor Service',
    icon: User,
    name: 'Get All Departments',
    method: 'GET',
    path: '/public/departments',
    description: 'Fetch the list of all clinical departments.',
    requiresAuth: false
  },
  {
    service: 'Doctor Service',
    icon: User,
    name: 'Doctor Slots Lookup',
    method: 'GET',
    path: '/public/doctors/{doctorId}/slots',
    description: 'Retrieve free 30-min available time slots for a doctor on a specific date.',
    pathParams: [
      { key: 'doctorId', value: '1', description: 'ID of the doctor' }
    ],
    params: [
      { key: 'date', value: '2026-07-04', description: 'Target date (YYYY-MM-DD)' }
    ],
    requiresAuth: false
  },
  {
    service: 'Doctor Service',
    icon: User,
    name: 'Onboard Doctor (Admin)',
    method: 'POST',
    path: '/doctors',
    description: 'Create a new doctor profile and sync user credentials inside Auth service.',
    defaultBody: JSON.stringify({
      name: 'Dr. Arjun Nair',
      specialization: 'Orthopedics',
      email: 'arjun.nair@example.com',
      password: 'DoctorPass@123'
    }, null, 2),
    requiresAuth: true
  },
  // ── PATIENT SERVICE ──
  {
    service: 'Patient Service',
    icon: User,
    name: 'Create Patient Profile',
    method: 'POST',
    path: '/patients',
    description: 'Set up patient personal profile upon registration.',
    defaultBody: JSON.stringify({
      fullName: 'Rahul Sharma',
      birthDate: '1995-05-15',
      gender: 'MALE',
      bloodGroup: 'O_POSITIVE',
      height: 178,
      weight: 72,
      address: 'Vasant Kunj, Delhi'
    }, null, 2),
    requiresAuth: true
  },
  {
    service: 'Patient Service',
    icon: User,
    name: 'Get Logged In Profile',
    method: 'GET',
    path: '/patients/profile',
    description: 'Retrieve personal profile of the authenticated patient.',
    requiresAuth: true
  },
  {
    service: 'Patient Service',
    icon: User,
    name: 'Add Insurance Details',
    method: 'POST',
    path: '/patients/insurance',
    description: 'Link active medical insurance policy details to the patient profile.',
    defaultBody: JSON.stringify({
      providerName: 'Star Health Insurance',
      policyNumber: 'STAR-99281-229',
      coverageDetails: 'Up to 5 Lakhs cashless hospital coverage.',
      expiryDate: '2028-12-31'
    }, null, 2),
    requiresAuth: true
  },
  // ── APPOINTMENT SERVICE ──
  {
    service: 'Appointment Service',
    icon: Calendar,
    name: 'Book Appointment',
    method: 'POST',
    path: '/appointments',
    description: 'Schedule a session with a doctor at a designated slot.',
    defaultBody: JSON.stringify({
      doctorId: 1,
      appointmentTime: '2026-07-04T11:00:00',
      reason: 'Regular cardiology wellness checkup'
    }, null, 2),
    requiresAuth: true
  },
  {
    service: 'Appointment Service',
    icon: Calendar,
    name: 'Get Patient Appointments',
    method: 'GET',
    path: '/appointments/patient',
    description: 'List upcoming and historical appointments booked by logged-in patient.',
    requiresAuth: true
  },
  {
    service: 'Appointment Service',
    icon: Calendar,
    name: 'Cancel Appointment',
    method: 'PATCH',
    path: '/appointments/{id}/cancel',
    description: 'Cancel an existing scheduled appointment booking.',
    pathParams: [
      { key: 'id', value: '1', description: 'Appointment ID' }
    ],
    requiresAuth: true
  },
  // ── PHARMACY SERVICE ──
  {
    service: 'Pharmacy Service',
    icon: Package,
    name: 'Fetch Medicine Inventory',
    method: 'GET',
    path: '/medicines',
    description: 'Retrieve catalog list of stock medicines.',
    params: [
      { key: 'page', value: '0', description: 'Page offset' },
      { key: 'size', value: '20', description: 'Limit count' }
    ],
    requiresAuth: false
  },
  {
    service: 'Pharmacy Service',
    icon: Package,
    name: 'Add New Medicine (Admin)',
    method: 'POST',
    path: '/medicines',
    description: 'Restock or insert a new medicine entry into database inventory.',
    defaultBody: JSON.stringify({
      name: 'Amoxicillin 500mg',
      manufacturer: 'Abbott Labs',
      expiryDate: '2027-10-31',
      price: 120.50,
      stockQuantity: 150
    }, null, 2),
    requiresAuth: true
  },
  // ── CLINICAL SERVICE ──
  {
    service: 'Clinical Service',
    icon: FileText,
    name: 'Create Prescription (Doctor)',
    method: 'POST',
    path: '/prescriptions/{appointmentId}',
    description: 'Prescribe medicines and clinical diagnosis. Deducts stock and completes session.',
    pathParams: [
      { key: 'appointmentId', value: '1', description: 'ID of the completed appointment' }
    ],
    defaultBody: JSON.stringify({
      diagnosis: 'Mild hypertension and fever',
      notes: 'Take medicine after dinner and rest.',
      medicines: [
        { medicineId: 1, quantity: 10, instructions: '1 tablet daily' }
      ]
    }, null, 2),
    requiresAuth: true
  },
  {
    service: 'Clinical Service',
    icon: FileText,
    name: 'Download Prescription PDF',
    method: 'GET',
    path: '/prescriptions/{id}/download',
    description: 'Retrieve PDF format prescription output.',
    pathParams: [
      { key: 'id', value: '1', description: 'Prescription ID' }
    ],
    isPdf: true,
    requiresAuth: true
  },
  {
    service: 'Clinical Service',
    icon: FileText,
    name: 'Create Medical Record',
    method: 'POST',
    path: '/medical-records',
    description: 'Generate diagnostic medical report for patient chart.',
    defaultBody: JSON.stringify({
      patientId: 1,
      appointmentId: 1,
      diagnosis: 'Cardiac arrhythmia wellness consult',
      treatmentPlan: 'Maintain low sodium food diet and follow prescription.',
      notes: 'Follow-up consultation booked after 3 weeks.'
    }, null, 2),
    requiresAuth: true
  },
  // ── BILLING SERVICE ──
  {
    service: 'Billing Service',
    icon: DollarSign,
    name: 'Get Patient Invoices',
    method: 'GET',
    path: '/bills/patient',
    description: 'List billing accounts, receipts, and unpaid consultation invoices.',
    requiresAuth: true
  },
  {
    service: 'Billing Service',
    icon: DollarSign,
    name: 'Settle Invoice Payment',
    method: 'PATCH',
    path: '/bills/{id}/pay',
    description: 'Pay pending bills using patient profile balances.',
    pathParams: [
      { key: 'id', value: '1', description: 'Invoice ID' }
    ],
    requiresAuth: true
  },
  // ── ADMIN SERVICE ──
  {
    service: 'Admin Service',
    icon: Shield,
    name: 'Fetch Dashboard Metrics',
    method: 'GET',
    path: '/admin/dashboard/stats',
    description: 'Aggregates patient, doctor, and billing stats across microservices in real-time.',
    requiresAuth: true
  }
];

export default function ApiTesterPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState(selectedEndpoint.defaultBody || '');
  const [pathParams, setPathParams] = useState(selectedEndpoint.pathParams || []);
  const [queryParams, setQueryParams] = useState(selectedEndpoint.params || []);
  const [responseState, setResponseState] = useState({
    loading: false,
    status: null,
    time: null,
    headers: null,
    data: null,
    isError: false
  });

  const selectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || '');
    setPathParams(ep.pathParams ? ep.pathParams.map(p => ({ ...p })) : []);
    setQueryParams(ep.params ? ep.params.map(q => ({ ...q })) : []);
    setResponseState({ loading: false, status: null, time: null, headers: null, data: null, isError: false });
  };

  const handlePathParamChange = (idx, value) => {
    const updated = [...pathParams];
    updated[idx].value = value;
    setPathParams(updated);
  };

  const handleQueryParamChange = (idx, value) => {
    const updated = [...queryParams];
    updated[idx].value = value;
    setQueryParams(updated);
  };

  const executeApi = async () => {
    setResponseState({ loading: true, status: null, time: null, headers: null, data: null, isError: false });
    
    // Resolve dynamic path params
    let resolvedPath = selectedEndpoint.path;
    pathParams.forEach(param => {
      resolvedPath = resolvedPath.replace(`{${param.key}}`, param.value);
    });

    // Build query params object
    const paramsObj = {};
    queryParams.forEach(q => {
      if (q.value) paramsObj[q.key] = q.value;
    });

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const startTime = Date.now();
    
    try {
      const config = {
        method: selectedEndpoint.method,
        url: `http://localhost:8000/api/v1${resolvedPath}`,
        headers,
        params: paramsObj,
        responseType: selectedEndpoint.isPdf ? 'blob' : 'json'
      };

      if (selectedEndpoint.method !== 'GET' && requestBody) {
        config.data = JSON.parse(requestBody);
      }

      const response = await axios(config);
      const latency = Date.now() - startTime;

      if (selectedEndpoint.isPdf) {
        // Handle PDF blob preview
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
        setResponseState({
          loading: false,
          status: response.status,
          time: latency,
          headers: response.headers,
          data: { 
            message: 'PDF File Generated Successfully.',
            previewUrl: fileURL
          },
          isError: false
        });
      } else {
        setResponseState({
          loading: false,
          status: response.status,
          time: latency,
          headers: response.headers,
          data: response.data,
          isError: false
        });

        // Auto-save auth token to localStorage if executing login
        if (selectedEndpoint.path === '/auth/login' && response.data?.token) {
          localStorage.setItem('token', response.data.token);
          // Sync local storage state to trigger auth headers updates
        }
      }
    } catch (err) {
      const latency = Date.now() - startTime;
      console.error(err);
      
      let errorData = err.response?.data || err.message;
      if (err.response?.data instanceof Blob) {
        // Read blob as text
        const reader = new FileReader();
        reader.onload = () => {
          setResponseState({
            loading: false,
            status: err.response?.status || 500,
            time: latency,
            headers: err.response?.headers,
            data: JSON.parse(reader.result),
            isError: true
          });
        };
        reader.readAsText(err.response.data);
      } else {
        setResponseState({
          loading: false,
          status: err.response?.status || 500,
          time: latency,
          headers: err.response?.headers,
          data: errorData,
          isError: true
        });
      }
    }
  };

  // Group endpoints by service
  const services = ENDPOINTS.reduce((acc, ep) => {
    if (!acc[ep.service]) acc[ep.service] = [];
    acc[ep.service].push(ep);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="bg-slate-950 border-b border-slate-800 h-16 shrink-0 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <Link to="/landing" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white tracking-tight">
              P
            </div>
            <span className="font-extrabold text-white text-md tracking-tight">Priyansh Care</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-xs font-mono bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            Microservices Gateway: http://localhost:8000/api/v1
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/landing" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* ── BODY WRAPPER ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
        <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 border-b border-slate-850">
            <h2 className="text-xs uppercase font-extrabold text-blue-500 tracking-wider">Clinical Services Endpoints</h2>
            <p className="text-[10px] text-slate-500 mt-1">Select an endpoint to execute live requests.</p>
          </div>
          
          <div className="p-3 space-y-6 flex-1">
            {Object.keys(services).map(serviceName => (
              <div key={serviceName} className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2">
                  {serviceName}
                </div>
                <div className="space-y-0.5">
                  {services[serviceName].map(ep => {
                    const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
                    const methodColors = {
                      GET: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                      POST: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                      PATCH: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                      PUT: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                      DELETE: 'text-red-500 bg-red-500/10 border-red-500/20',
                    };
                    return (
                      <button
                        key={`${ep.method}-${ep.path}`}
                        onClick={() => selectEndpoint(ep)}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-all border ${
                          isSelected 
                            ? 'bg-blue-600/10 border-blue-500 text-white' 
                            : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className={`text-[9px] font-black tracking-wide px-1.5 py-0.5 rounded border ${methodColors[ep.method]}`}>
                          {ep.method}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate leading-tight">{ep.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{ep.path}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── WORKSPACE ──────────────────────────────────────────────────── */}
        <main className="flex-1 bg-slate-900 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
          
          {/* ── REQUEST MODULE ────────────────────────────────────────────── */}
          <div className="flex-1 space-y-6">
            
            {/* Endpoint Info */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black tracking-wide px-2 py-0.5 rounded border ${
                  selectedEndpoint.method === 'GET' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                  selectedEndpoint.method === 'POST' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                  'text-amber-500 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">{selectedEndpoint.path}</span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedEndpoint.name}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedEndpoint.description}</p>
              
              {selectedEndpoint.requiresAuth && (
                <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-md">
                  <Shield className="w-3.5 h-3.5" /> Requires JWT Authentication header (Will auto-inject token from local storage)
                </div>
              )}
            </div>

            {/* Input Variables Form */}
            {(pathParams.length > 0 || queryParams.length > 0) && (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-blue-500 tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Parameters
                </h3>
                
                <div className="space-y-4">
                  {/* Path Variables */}
                  {pathParams.map((param, idx) => (
                    <div key={`path-${param.key}`} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                      <label className="text-xs font-semibold text-slate-400">
                        {param.key} <span className="text-[10px] text-blue-500">(Path)</span>
                      </label>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handlePathParamChange(idx, e.target.value)}
                        className="sm:col-span-2 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 outline-none rounded-lg p-2 text-xs font-mono text-white transition-colors"
                      />
                    </div>
                  ))}

                  {/* Query Parameters */}
                  {queryParams.map((param, idx) => (
                    <div key={`query-${param.key}`} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                      <label className="text-xs font-semibold text-slate-400">
                        {param.key} <span className="text-[10px] text-emerald-500">(Query)</span>
                      </label>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleQueryParamChange(idx, e.target.value)}
                        className="sm:col-span-2 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 outline-none rounded-lg p-2 text-xs font-mono text-white transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body Editor */}
            {selectedEndpoint.method !== 'GET' && (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs uppercase font-extrabold text-blue-500 tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" /> Request Payload Body
                  </h3>
                  <span className="text-[10px] text-slate-500">JSON Format</span>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-500 outline-none rounded-lg p-3 text-xs font-mono text-slate-200 leading-relaxed transition-colors shadow-inner"
                />
              </div>
            )}

            {/* Execution Trigger */}
            <button
              onClick={executeApi}
              disabled={responseState.loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              {responseState.loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Executing REST Call...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Request / Execute API
                </>
              )}
            </button>

          </div>

          {/* ── RESPONSE MODULE ───────────────────────────────────────────── */}
          <div className="flex-1 space-y-6">
            
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1 flex flex-col h-full min-h-[400px]">
              
              {/* Header metrics bar */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-4 shrink-0">
                <h3 className="text-xs uppercase font-extrabold text-blue-500 tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4" /> API Response Console
                </h3>
                
                {responseState.status && (
                  <div className="flex gap-4 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Status:</span>
                      <span className={`font-bold ${responseState.isError ? 'text-red-500' : 'text-emerald-500'}`}>
                        {responseState.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Latency:</span>
                      <span className="font-bold text-slate-200">{responseState.time} ms</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Data Panel */}
              <div className="flex-1 pt-4 font-mono text-xs overflow-auto">
                {responseState.loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span>Awaiting microservice response packet...</span>
                  </div>
                ) : responseState.data ? (
                  <div className="space-y-4">
                    {responseState.data.previewUrl ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
                          {responseState.data.message}
                        </div>
                        <a 
                          href={responseState.data.previewUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition"
                        >
                          👁 Open Generated PDF Document
                        </a>
                      </div>
                    ) : (
                      <pre className="text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-850 max-h-[500px] overflow-auto">
                        {JSON.stringify(responseState.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-20">
                    <HelpCircle className="w-12 h-12 text-slate-750 mb-2" />
                    <span>No request executed yet.</span>
                    <span className="text-[10px] text-slate-500 mt-1 max-w-xs">Select any endpoint from the left sidebar and trigger a live execution request.</span>
                  </div>
                )}
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
