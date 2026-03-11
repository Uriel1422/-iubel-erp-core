import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2, Play } from 'lucide-react';

const AdminTerminal = () => {
    const [history, setHistory] = useState([
        { type: 'system', text: 'Iubel Kernel v4.2.0 - Stable Build 2026.03' },
        { type: 'system', text: 'Waiting for secure command input...' }
    ]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const executeCommand = (cmd) => {
        const c = cmd.toLowerCase().trim();
        let response = '';

        if (c.startsWith('/reset-tenant')) {
            response = `Confirming hard reset for tenant [${c.split(' ')[1] || 'ALL'}]. All contexts purged.`;
        } else if (c === '/health-check') {
            response = 'Core Infrastructure: OK | DB Nodes: 4/4 | AI Core: Operational | Network: 14ms Latency';
        } else if (c.startsWith('/kill-switch')) {
            response = 'ALERT: Global Kill-Switch sequence initiated. Standby for authorization token...';
        } else if (c === '/clear') {
            setHistory([]);
            return;
        } else {
            response = `Unrecognized command: ${c}. Type /help for available SA commands.`;
        }

        setHistory(prev => [...prev, { type: 'user', text: `> ${cmd}` }, { type: 'system', text: response }]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            executeCommand(input);
            setInput('');
        }
    };

    return (
        <div style={{ background: '#020617', color: '#10b981', fontFamily: 'monospace', borderRadius: '12px', height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ background: '#1e293b', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
                    <Terminal size={16} color="#6366f1" /> IUB-CORE TERMINAL [ROOT]
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Trash2 size={14} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => setHistory([])} />
                    <Copy size={14} style={{ cursor: 'pointer', opacity: 0.6 }} />
                </div>
            </div>
            
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                {history.map((line, i) => (
                    <div key={i} style={{ color: line.type === 'user' ? '#38bdf8' : '#10b981', lineBreak: 'anywhere' }}>
                        {line.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div style={{ padding: '1rem 1.5rem', background: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#6366f1', fontWeight: 800 }}>SA@IUBEL:~#</span>
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontFamily: 'monospace', fontSize: '0.9rem' }}
                    autoFocus
                />
                <Play size={16} style={{ cursor: 'pointer' }} onClick={() => { executeCommand(input); setInput(''); }} />
            </div>
        </div>
    );
};

export default AdminTerminal;
