import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

function App() {
  const [assetName, setAssetName] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('scout');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!assetName.trim()) return;
    
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_name: assetName }),
      });

      if (!response.ok) throw new Error('Failed to fetch institutional report');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPct = (val) => {
    if (val === undefined || val === null) return 0;
    return Math.round(val <= 1 ? val * 100 : val);
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    // Corporate Header
    doc.setFont("Courier", "Bold");
    doc.setFontSize(18);
    doc.setTextColor(31, 111, 235);
    doc.text("INVESTMENT AI SYNDICATE", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Institutional-Grade Multi-Agent Intelligence Platform", 20, 26);
    
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Asset Title & Confidence
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(`Target Asset: ${report.asset_name?.toUpperCase()}`, 20, 44);
    doc.text(`Overall Confidence: ${formatPct(report.risk_analysis.overall_confidence)}%`, 130, 44);

    // Scout Overview
    doc.setFontSize(12);
    doc.setTextColor(31, 111, 235);
    doc.text("1. Scout Agent - Business & Market Positioning", 20, 58);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const overviewLines = doc.splitTextToSize(report.scout_analysis.business_overview, 170);
    doc.text(overviewLines, 20, 66);

    // Quant Snapshot
    let currentY = 66 + (overviewLines.length * 5) + 10;
    doc.setFontSize(12);
    doc.setTextColor(31, 111, 235);
    doc.text("2. Quant Agent - Valuation & Multiples", 20, currentY);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const quantLines = doc.splitTextToSize(report.quant_analysis.valuation_multiples, 170);
    doc.text(quantLines, 20, currentY + 8);

    // Risk Assessment
    currentY += 8 + (quantLines.length * 5) + 10;
    doc.setFontSize(12);
    doc.setTextColor(218, 54, 51);
    doc.text("3. Risk Agent - Institutional Warning", 20, currentY);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const riskLines = doc.splitTextToSize(report.risk_analysis.risk_warning, 170);
    doc.text(riskLines, 20, currentY + 8);

    doc.save(`${report.asset_name}_Syndicate_Report.pdf`);
  };

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', minHeight: '100vh', padding: '30px 20px', fontFamily: 'Courier New, Courier, monospace' }}>
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#58a6ff', fontSize: '2.2rem', margin: '0 0 8px 0', letterSpacing: '1px' }}>INVESTMENT AI SYNDICATE</h1>
          <p style={{ color: '#8b949e', fontSize: '0.95rem', margin: 0 }}>Institutional-Grade Multi-Agent Intelligence Platform</p>
        </header>

        <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Enter asset ticker or fund name (e.g., RELIANCE, ONGC, NIFTY BEES)..."
            style={{ flex: 1, backgroundColor: '#161b22', border: '1px solid #30363d', color: '#58a6ff', padding: '14px 18px', fontSize: '1rem', borderRadius: '6px', outline: 'none', fontFamily: 'inherit' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#238636', color: 'white', border: 'none', padding: '14px 24px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'RUNNING AGENTS...' : 'RUN ANALYSIS'}
          </button>
        </form>

        {error && <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid #f85149', color: '#f85149', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>⚠️ {error}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#8b949e' }}>
            <p>⚡ Scout, Quant, and Risk agents executing live synthesis pipelines...</p>
          </div>
        )}

        {report && (
          <div style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '30px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '1.6rem' }}>{report.asset_name?.toUpperCase()}</h2>
                <button 
                  onClick={exportPDF}
                  style={{ background: '#1f6feb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  📥 EXPORT PDF REPORT
                </button>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #1f6feb', padding: '10px 20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 0 10px rgba(31,111,235,0.3)' }}>
                <div style={{ fontSize: '0.75rem', color: '#8b949e', textTransform: 'uppercase' }}>Syndicate Confidence</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#58a6ff' }}>
                  {formatPct(report.risk_analysis.overall_confidence)}%
                </div>
              </div>
            </div>

            {/* Confidence Gauges */}
            <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', padding: '18px', borderRadius: '6px', marginBottom: '25px' }}>
              <h3 style={{ color: '#58a6ff', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 15px 0' }}>
                📊 Multi-Factor Confidence Gauges
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                    Data Freshness: {formatPct(report.risk_analysis.confidence_breakdown.data_freshness)}%
                  </span>
                  <div style={{ background: '#30363d', height: '8px', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${formatPct(report.risk_analysis.confidence_breakdown.data_freshness)}%`, background: '#238636', height: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                    Financial Health: {formatPct(report.risk_analysis.confidence_breakdown.financial_health)}%
                  </span>
                  <div style={{ background: '#30363d', height: '8px', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${formatPct(report.risk_analysis.confidence_breakdown.financial_health)}%`, background: '#1f6feb', height: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                    Market Sentiment: {formatPct(report.risk_analysis.confidence_breakdown.market_sentiment)}%
                  </span>
                  <div style={{ background: '#30363d', height: '8px', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${formatPct(report.risk_analysis.confidence_breakdown.market_sentiment)}%`, background: '#d29922', height: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
              <button 
                onClick={() => setActiveTab('scout')} 
                style={{ background: activeTab === 'scout' ? '#1f6feb' : '#0d1117', color: activeTab === 'scout' ? '#fff' : '#8b949e', border: '1px solid #30363d', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}
              >
                🕵️ Scout Intel
              </button>
              <button 
                onClick={() => setActiveTab('quant')} 
                style={{ background: activeTab === 'quant' ? '#1f6feb' : '#0d1117', color: activeTab === 'quant' ? '#fff' : '#8b949e', border: '1px solid #30363d', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}
              >
                📐 Quant Snapshot & Peers
              </button>
              <button 
                onClick={() => setActiveTab('risk')} 
                style={{ background: activeTab === 'risk' ? '#f85149' : '#0d1117', color: activeTab === 'risk' ? '#fff' : '#8b949e', border: '1px solid #30363d', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}
              >
                🚨 Risk Assessment
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'scout' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                  <h3 style={{ color: '#8b949e', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Business Overview</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{report.scout_analysis.business_overview}</p>
                </div>
                <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                  <h3 style={{ color: '#8b949e', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Market Segment</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{report.scout_analysis.market_segment}</p>
                </div>
              </div>
            )}

            {activeTab === 'quant' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                    <h3 style={{ color: '#8b949e', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Valuation Multiples</h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{report.quant_analysis.valuation_multiples}</p>
                  </div>
                  <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                    <h3 style={{ color: '#8b949e', fontSize: '0.75rem', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Guardrail Metrics</h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{report.quant_analysis.live_metrics_summary}</p>
                  </div>
                </div>

                {/* Peer Comparison Matrix Table */}
                <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                  <h3 style={{ color: '#58a6ff', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 15px 0' }}>
                    🏛️ Sector Peer Comparison Matrix
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e' }}>
                        <th style={{ padding: '10px' }}>Competitor / Peer</th>
                        <th style={{ padding: '10px' }}>P/E Ratio</th>
                        <th style={{ padding: '10px' }}>Market Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.quant_analysis.peer_comparison?.map((peer, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #21262d' }}>
                          <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#c9d1d9' }}>{peer.peer_name}</td>
                          <td style={{ padding: '12px 10px', color: '#58a6ff' }}>{peer.pe_ratio}</td>
                          <td style={{ padding: '12px 10px', color: '#8b949e' }}>{peer.market_position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'risk' && (
              <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.08)', border: '1px solid #f85149', padding: '25px', borderRadius: '6px' }}>
                <h3 style={{ color: '#f85149', margin: '0 0 10px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🚨 Institutional Risk Warning (Risk Agent)
                </h3>
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: '#e6edf3' }}>{report.risk_analysis.risk_warning}</p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;