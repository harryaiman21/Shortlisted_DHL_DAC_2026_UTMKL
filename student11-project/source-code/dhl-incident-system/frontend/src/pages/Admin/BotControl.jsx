import { useState } from 'react';
import {
    Play, StopCircle, RefreshCw, Terminal,
    Server, ShieldAlert, CheckCircle, Clock,
    Image as ImageIcon, Download, Settings, AlertTriangle, Activity
} from 'lucide-react';

export default function BotControl() {
    const [botState, setBotState] = useState('Idle'); // 'Idle', 'Running', 'Error'
    const [selectedLog, setSelectedLog] = useState(null);

    // ---> WIRE UP THE REAL BACKEND CALL <---
    const handleForceRun = async () => {
        setBotState('Running');

        try {
            // Call the backend controller you just built!
            const response = await fetch('http://localhost:5001/api/bot/run-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success! The bot is spinning up in Orchestrator
                alert('🚀 UiPath Bot successfully triggered in Orchestrator!');
                setBotState('Idle');

                // In a future phase, you could refetch live logs here!
            } else {
                // API responded, but UiPath rejected the credentials/job
                console.error("UiPath Error:", data.message);
                setBotState('Error');
                alert(`Failed to start bot: ${data.message}`);

                // Reset back to idle after a few seconds so they can try again
                setTimeout(() => setBotState('Idle'), 4000);
            }
        } catch (error) {
            // Node server is down or unreachable
            console.error('Error connecting to backend:', error);
            setBotState('Error');
            alert('Server connection failed. Is your Node.js backend running?');
            setTimeout(() => setBotState('Idle'), 4000);
        }
    };

    const handleStopBot = () => {
        // To actually stop a bot, you would create a /api/bot/stop endpoint 
        // using the UiPath OData StopJob API. For now, we just reset the UI.
        setBotState('Idle');
    };

    // Mock Data for UiPath Execution Logs
    const rpaLogs = [
        {
            id: 'JOB-9902',
            timestamp: 'Oct 24, 2026 - 09:40 AM',
            status: 'Success',
            filesProcessed: 14,
            duplicatesSkipped: 3,
            errors: 0,
            duration: '45s',
            logOutput: '10:40:01: Initiating Google Drive Scan...\n10:40:05: 17 new items found.\n10:40:08: Duplicate check: 3 files match hashes from last 14 days. Skipping.\n10:40:15: Pushing 14 files to Node API.\n10:40:45: Job completed successfully.'
        },
        {
            id: 'JOB-9901',
            timestamp: 'Oct 24, 2026 - 08:00 AM',
            status: 'Failed',
            filesProcessed: 2,
            duplicatesSkipped: 0,
            errors: 1,
            duration: '12s',
            errorScreenshot: 'https://via.placeholder.com/600x400/111827/ef4444?text=UiPath+SelectorNotFoundException',
            logOutput: '08:00:01: Initiating Google Drive Scan...\n08:00:05: 3 new items found.\n08:00:08: Processing file: corrupted_waybill.pdf\n08:00:12: SystemException: Could not read PDF layout.\n08:00:13: Try/Catch triggered. Taking screenshot.\n08:00:14: Emailing Admin Logs.\n08:00:14: Job Aborted.'
        },
        {
            id: 'JOB-9900',
            timestamp: 'Oct 23, 2026 - 18:30 PM',
            status: 'Success',
            filesProcessed: 8,
            duplicatesSkipped: 12,
            errors: 0,
            duration: '22s',
            logOutput: '18:30:01: Initiating Google Drive Scan...\n18:30:04: 20 new items found.\n18:30:07: Duplicate check: 12 files match hashes. Skipping.\n18:30:22: Job completed successfully.'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">RPA Orchestrator</h1>
                    <p className="text-sm text-gray-500">Manage UiPath bots, trigger manual runs, and view execution logs.</p>
                </div>
                <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition">
                    <Settings size={18} />
                    <span>Bot Settings</span>
                </button>
            </div>

            {/* Top Stats & Trigger Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">

                {/* Left Column: Live Telemetry */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col justify-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                            <p className="text-xs font-bold text-gray-500 uppercase">Target Environment</p>
                            <div className="flex items-center mt-2 space-x-2">
                                <Server size={16} className="text-blue-600" />
                                <span className="font-bold text-gray-900">Prod-Worker-01</span>
                            </div>
                        </div>
                        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                            <p className="text-xs font-bold text-gray-500 uppercase">Target Source</p>
                            <div className="flex items-center mt-2 space-x-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-4 h-4" />
                                <span className="font-bold text-gray-900 truncate">DHL_Ingest_Folder</span>
                            </div>
                        </div>
                        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                            <p className="text-xs font-bold text-gray-500 uppercase">Last Run Success</p>
                            <div className="flex items-center mt-2 space-x-2 text-green-600">
                                <CheckCircle size={16} />
                                <span className="font-bold">100%</span>
                            </div>
                        </div>
                        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                            <p className="text-xs font-bold text-gray-500 uppercase">Next Scheduled</p>
                            <div className="flex items-center mt-2 space-x-2 text-gray-700">
                                <Clock size={16} />
                                <span className="font-bold">in 15 mins</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Trigger Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden flex flex-col justify-between">
                    <div className={`absolute top-0 right-0 w-2 h-full transition-colors ${botState === 'Running' ? 'bg-blue-500 animate-pulse' :
                        botState === 'Error' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Execution Control</h3>
                        <div className="flex items-center space-x-2 mb-6">
                            <span className="relative flex h-3 w-3">
                                {botState === 'Running' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${botState === 'Running' ? 'bg-blue-500' :
                                    botState === 'Error' ? 'bg-red-500' : 'bg-gray-400'
                                    }`}></span>
                            </span>
                            <span className={`text-sm font-bold uppercase tracking-wider ${botState === 'Error' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                Status: {botState}
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        {botState === 'Idle' || botState === 'Error' ? (
                            <button
                                onClick={handleForceRun}
                                disabled={botState === 'Running'}
                                className="flex-1 flex items-center justify-center space-x-2 bg-[#D40511] hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Play size={18} fill="currentColor" />
                                <span>Force Start Job</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleStopBot}
                                className="flex-1 flex items-center justify-center space-x-2 bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-lg font-bold shadow-sm transition-colors"
                            >
                                <Activity size={18} className="animate-spin" />
                                <span>Running in Cloud...</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Logs Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left Side: Job History Table */}
                <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-gray-800">Job Execution History</h3>
                        <button className="text-gray-500 hover:text-blue-600 transition-colors"><RefreshCw size={16} /></button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {rpaLogs.map(log => (
                            <div
                                key={log.id}
                                onClick={() => setSelectedLog(log)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedLog?.id === log.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-gray-900">{log.id}</span>
                                    <span className={`py-1 px-3 rounded text-xs font-bold ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {log.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 flex justify-between">
                                    <span>{log.timestamp}</span>
                                    <span>{log.duration}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Log Details & Failsafe Screenshots */}
                <div className="w-full lg:w-1/2 flex flex-col bg-gray-900 text-gray-300">
                    {selectedLog ? (
                        <div className="flex flex-col h-full animate-fade-in">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black shrink-0">
                                <div className="flex items-center space-x-2">
                                    <Terminal size={18} className="text-green-400" />
                                    <span className="font-bold text-white text-sm">UiPath Console Output</span>
                                </div>
                                <button className="text-gray-400 hover:text-white"><Download size={16} /></button>
                            </div>

                            {/* Terminal Output */}
                            <div className="p-6 font-mono text-xs md:text-sm leading-relaxed overflow-y-auto flex-1">
                                {selectedLog.logOutput.split('\n').map((line, idx) => (
                                    <div key={idx} className={`${line.includes('Failed') || line.includes('Exception') ? 'text-red-400' : line.includes('Success') ? 'text-green-400' : 'text-gray-300'} mb-1`}>
                                        {line}
                                    </div>
                                ))}
                            </div>

                            {/* Requirement 5.2: Take Screenshot on Failures */}
                            {selectedLog.status === 'Failed' && selectedLog.errorScreenshot && (
                                <div className="p-4 bg-red-950/30 border-t border-red-900 shrink-0">
                                    <div className="flex items-center space-x-2 mb-3 text-red-400">
                                        <AlertTriangle size={16} />
                                        <span className="text-sm font-bold uppercase tracking-wider">Try/Catch: Error Screenshot Captured</span>
                                    </div>
                                    <div className="rounded-lg overflow-hidden border border-red-900 relative group cursor-pointer">
                                        <img src={selectedLog.errorScreenshot} alt="Error Exception" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center space-x-2 text-white bg-black/80 px-4 py-2 rounded-lg font-semibold text-sm">
                                                <ImageIcon size={16} /> <span>View Full Screenshot</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                            <Terminal size={48} className="mb-4 opacity-20" />
                            <p>Select a job execution to view terminal logs.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}