import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, AlertTriangle, Wand2, Send, RefreshCw, CheckCircle2, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // <-- NEW: Import Auth Context

export default function DraftBuilder() {
    const { token, user } = useAuth(); // <-- NEW: Grab user and token

    const [processingState, setProcessingState] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const [departments, setDepartments] = useState([]);
    const fileInputRef = useRef(null);

    const [draftData, setDraftData] = useState({
        title: '', category: '', priority: '', department: '', aiSummary: '', tags: '', rawText: '', source: '', confidenceScore: 0
    });

    // Fetch real departments on load (Secured)
    useEffect(() => {
        if (!token) return; // Wait until token is available

        fetch('http://localhost:5001/api/departments', {
            headers: { 'Authorization': `Bearer ${token}` } // <-- Attach Token
        })
            .then(res => res.json())
            .then(data => setDepartments(data))
            .catch(err => console.error("Failed to fetch departments", err));
    }, [token]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const uploadedFileName = file.name;
        setProcessingState('uploading');
        setProgress(30);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            setProgress(60);
            setProcessingState('analyzing');

            const response = await fetch('http://localhost:5001/api/incidents/ai-process', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // <-- Attach Token (No Content-Type needed for FormData)
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error && (result.error.includes('duplicate') || result.error.includes('E11000'))) {
                    throw new Error(`Duplicate Detected: A file or ticket with these exact identifiers already exists in the system.`);
                }
                throw new Error(result.message || result.error || 'Failed to process file with AI');
            }

            setProgress(100);
            setProcessingState('complete');

            setDraftData({
                title: result.extractedData.title || '',
                category: result.extractedData.category || '',
                priority: result.extractedData.priority || '',
                department: result.extractedData.department || '',
                aiSummary: result.extractedData.aiSummary || '',
                tags: result.extractedData.tags ? result.extractedData.tags.join(', ') : '',
                rawText: result.rawText || 'No readable text could be extracted. The file might be an image without text or an unsupported format.',
                source: uploadedFileName,
                confidenceScore: result.extractedData.confidenceScore || 0
            });

        } catch (err) {
            console.error(err);
            setError(err.message || 'AI Processing Failed. Ensure the backend is running.');
            setProcessingState('idle');
            setProgress(0);
        }
    };

    const handlePublish = async () => {
        setError('');
        try {
            const payload = {
                title: draftData.title,
                source: draftData.source,
                category: draftData.category,
                priority: draftData.priority,
                department: draftData.department,
                status: draftData.confidenceScore >= 85 ? 'Reviewed' : 'Draft',
                creator: user?.name || 'Manual Upload', // <-- Dynamically set creator based on logged-in user
                isBot: false,
                aiSummary: draftData.aiSummary,
                rawText: draftData.rawText,
                tags: draftData.tags.split(',').map(t => t.trim())
            };

            const res = await fetch('http://localhost:5001/api/incidents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <-- Attach Token
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();

            if (res.ok) {
                alert("Incident successfully published to Vault!");
                handleReset();
            } else {
                if (responseData.error && (responseData.error.includes('duplicate') || responseData.error.includes('E11000'))) {
                    setError('Duplicate Entry: This incident has already been saved to the database.');
                } else {
                    setError(`Server Error: ${responseData.message || 'Failed to save to database'}`);
                }
            }
        } catch (err) {
            setError("Failed to connect to the database.");
            console.error(err);
        }
    };

    const handleReset = () => {
        setProcessingState('idle');
        setProgress(0);
        setError('');
        setDraftData({ title: '', category: '', priority: '', department: '', aiSummary: '', tags: '', rawText: '', source: '', confidenceScore: 0 });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">AI Draft Builder</h1>
                    <p className="text-sm text-gray-500">Upload raw files. GPT-4o will OCR, summarize, and route the incident.</p>
                </div>
                {processingState === 'complete' && (
                    <button onClick={handleReset} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
                        <RefreshCw size={16} /><span>Process New File</span>
                    </button>
                )}
            </div>

            {error && (
                <div className={`p-4 rounded-lg border flex items-center shadow-sm ${error.includes('Duplicate') ? 'bg-yellow-50 text-yellow-800 border-yellow-300' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    <AlertTriangle className={`mr-3 flex-shrink-0 ${error.includes('Duplicate') ? 'text-yellow-600' : 'text-red-500'}`} size={24} />
                    <div>
                        <h4 className="font-bold text-sm">{error.includes('Duplicate') ? 'Duplicate Found' : 'Processing Error'}</h4>
                        <p className="text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Upload & Raw Source Viewer */}
                <div className="space-y-6 lg:col-span-5 flex flex-col h-full">

                    {/* Only show the big upload box if we aren't done processing */}
                    {processingState !== 'complete' && (
                        <div className={`bg-white rounded-xl shadow-sm border-2 border-dashed p-8 text-center transition-colors flex-1 flex flex-col items-center justify-center min-h-[300px] ${processingState !== 'idle' ? 'border-gray-200 opacity-60' : 'border-gray-300 hover:border-[#FFCC00] hover:bg-yellow-50/30'}`}>
                            <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-sm font-bold text-gray-700 mb-1">Upload Source Document</h3>
                            <p className="text-xs text-gray-500 mb-6">Accepts PDF, TXT, DOCX, or Images</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} disabled={processingState !== 'idle'} className="bg-gray-900 hover:bg-black text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:bg-gray-300">
                                Browse Files
                            </button>
                        </div>
                    )}

                    {/* Show the Raw Extracted Text Viewer once processing is complete */}
                    {processingState === 'complete' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 max-h-[700px] overflow-hidden animate-fade-in">
                            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
                                <div className="flex items-center space-x-2">
                                    <FileText size={18} className="text-blue-600" />
                                    <h3 className="font-bold text-gray-800 text-sm truncate max-w-[250px]">{draftData.source}</h3>
                                </div>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                                    <Server size={10} className="mr-1" /> Extracted
                                </span>
                            </div>
                            <div className="p-4 bg-gray-900 flex-1 overflow-y-auto">
                                <p className="text-xs text-gray-400 mb-2 font-mono border-b border-gray-700 pb-2">RAW OCR / PARSER OUTPUT:</p>
                                <pre className="text-green-400 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                    {draftData.rawText}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: AI Output & Editing */}
                <div className="lg:col-span-7">
                    {processingState !== 'complete' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center p-12 min-h-[400px]">
                            {processingState === 'idle' ? (
                                <div className="text-center text-gray-400">
                                    <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-sm font-medium">Awaiting file input for AI analysis...</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-md text-center space-y-4">
                                    <Wand2 size={48} className="mx-auto mb-4 text-blue-500 animate-pulse" />
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {processingState === 'uploading' ? 'Ingesting document...' : 'LLM processing unstructured data...'}
                                    </h3>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500">Extracting context, priority, and department mapping.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in h-full flex flex-col">

                            {/* Confidence Alert */}
                            {draftData.confidenceScore > 0 && draftData.confidenceScore < 85 && (
                                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm flex items-start space-x-3">
                                    <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-800">Low AI Confidence ({draftData.confidenceScore}%)</h4>
                                        <p className="text-xs text-orange-700 mt-1">The AI was unsure about this categorization. Please cross-reference the generated summary with the Raw Output on the left before publishing.</p>
                                    </div>
                                </div>
                            )}

                            {draftData.confidenceScore >= 85 && (
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl shadow-sm flex items-start space-x-3">
                                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-green-800">High Confidence Analysis ({draftData.confidenceScore}%)</h4>
                                        <p className="text-xs text-green-700 mt-1">The data was parsed successfully. Please review and publish.</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                                <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Wand2 size={18} className="text-blue-600" />
                                        <h3 className="font-bold text-gray-800 text-sm">AI Structured Output</h3>
                                    </div>
                                </div>

                                <div className="p-6 space-y-5 flex-1">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Generated Title</label>
                                        <input type="text" value={draftData.title} onChange={(e) => setDraftData({ ...draftData, title: e.target.value })} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-800 font-bold" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Category</label>
                                            <input type="text" value={draftData.category} onChange={(e) => setDraftData({ ...draftData, category: e.target.value })} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-800" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Priority Level</label>
                                            <select
                                                value={draftData.priority}
                                                onChange={(e) => setDraftData({ ...draftData, priority: e.target.value })}
                                                className={`w-full border border-gray-300 rounded-lg py-2 px-3 font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500 ${draftData.priority === 'Critical' ? 'text-red-600' : 'text-gray-800'}`}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Critical">Critical</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Executive Summary</label>
                                        <textarea rows="4" value={draftData.aiSummary} onChange={(e) => setDraftData({ ...draftData, aiSummary: e.target.value })} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 leading-relaxed"></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Routed Department</label>
                                            <select
                                                value={draftData.department}
                                                onChange={(e) => setDraftData({ ...draftData, department: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-800 bg-white font-medium"
                                            >
                                                <option value="">Select Department...</option>
                                                {departments.map(d => (
                                                    <option key={d._id} value={d.name}>{d.name}</option>
                                                ))}
                                                {!departments.find(d => d.name === draftData.department) && draftData.department && (
                                                    <option value={draftData.department}>{draftData.department} (AI Guess - Please Correct)</option>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Keywords / Tags</label>
                                            <input type="text" value={draftData.tags} onChange={(e) => setDraftData({ ...draftData, tags: e.target.value })} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
                                    <button onClick={handlePublish} className="flex items-center space-x-2 bg-[#D40511] hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors">
                                        <Send size={18} /><span>Publish to Vault</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}