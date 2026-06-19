import React, { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './SecurityDashboard.css';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

const SecurityDashboard: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('summary');
  const [fillProgress, setFillProgress] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    // Trigger animated bars on load
    const timeout = setTimeout(() => setFillProgress(true), 100);
    
    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  // Risks Donut Data
  const riskData = {
    labels: ['Severe', 'Major', 'Moderate', 'Minor', 'Insignificant'],
    datasets: [
      {
        data: [12, 19, 28, 45, 15],
        backgroundColor: ['#ff3b3b', '#ff8c00', '#ffb800', '#00d4ff', '#2a3a55'],
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 15,
        cutout: '75%'
      },
    ],
  };

  const riskOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d1629',
        titleColor: '#e2e8f0',
        bodyColor: '#c8d6e8',
        borderColor: '#1a2540',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart' as const
    }
  };

  // Action Plan Donut Data
  const actionData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ['#00e676', '#ffb800', '#ff3b3b'],
        borderColor: 'transparent',
        borderWidth: 0,
        cutout: '80%'
      },
    ],
  };

  // Top 5 Entities Bar Data
  const entitiesData = {
    labels: ['Cloud SQL', 'Node Master', 'Storage-A', 'Auth Service', 'External GW'],
    datasets: [
      {
        label: 'Threat Count',
        data: [52, 42, 38, 25, 18],
        backgroundColor: ['#ff3b3b', '#ff8c00', '#ffb800', '#00d4ff', '#00e676'],
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const entitiesOptions = {
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d1629',
        titleColor: '#e2e8f0',
        bodyColor: '#c8d6e8',
        borderColor: '#1a2540',
        borderWidth: 1,
      }
    },
    scales: {
      x: { 
        grid: { color: '#1a2540', drawTicks: false },
        ticks: { color: '#7a8ba8', font: { size: 10 } }
      },
      y: { 
        grid: { display: false },
        ticks: { color: '#e2e8f0', font: { size: 12, weight: 'bold' } }
      }
    },
    maintainAspectRatio: false,
    animation: { duration: 1500 }
  };

  return (
    <div className="security-dashboard">
      {/* Sidebar */}
      <aside className="sd-sidebar">
        <div className="sd-logo-container">
          <div className="w-10 h-10 bg-[#00d4ff] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
             <i className="ti ti-shield-lock text-white text-xl"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tight">LDP SECURE</span>
            <span className="text-[9px] font-extrabold text-[#00d4ff] uppercase tracking-[2px]">Logistics Force</span>
          </div>
        </div>

        <div className="sd-sidebar-nav">
          <p className="sd-nav-label">Main</p>
          <a href="#" className={`sd-nav-item ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
            <i className="ti ti-layout-dashboard text-lg"></i>
            <span>Overview</span>
          </a>
          <a href="#" className="sd-nav-item">
            <i className="ti ti-activity text-lg"></i>
            <span>Live Monitor</span>
          </a>
          
          <p className="sd-nav-label">Monitor</p>
          <a href="#" className="sd-nav-item">
            <i className="ti ti-users text-lg"></i>
            <span>User Intelligence</span>
            <span className="sd-nav-badge">14</span>
          </a>
          <a href="#" className="sd-nav-item sd-admin-item">
            <i className="ti ti-adjustments text-lg"></i>
            <span>Admin Portal</span>
          </a>
          <a href="#" className="sd-nav-item">
            <i className="ti ti-camera text-lg"></i>
            <span>Screenshots</span>
          </a>

          <p className="sd-nav-label">System</p>
          <a href="#" className="sd-nav-item">
            <i className="ti ti-settings text-lg"></i>
            <span>Global Config</span>
          </a>
        </div>

        <div className="sd-sidebar-footer">
          <div className="sd-connection-status">
            <div className="sd-status-dot"></div>
            <div className="flex flex-col">
              <span className="sd-status-text">SECURE CONNECTION</span>
              <span className="text-[9px] text-[#7a8ba8] font-bold">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sd-main">
        {/* Topbar */}
        <header className="sd-topbar">
          <div className="sd-live-info">
            <div className="sd-clock">{time}</div>
            <div className="sd-connection-badge">
              <div className="sd-pulse-cyan"></div>
              <span className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest">Live Sync Active</span>
            </div>
          </div>

          <div className="sd-user-profile">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[12px] font-bold text-white uppercase">Arbaz Ahmed Khan</span>
              <span className="text-[9px] font-bold text-[#7a8ba8] uppercase tracking-wider">Security Executive</span>
            </div>
            <div className="sd-avatar">AK</div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="sd-content">
          {/* Stats Grid */}
          <div className="sd-stats-grid">
            <div className="sd-stat-card cyan">
              <i className="ti ti-current-location sd-stat-icon text-2xl"></i>
              <p className="sd-stat-label">System Health</p>
              <h2 className="sd-stat-value">98.2%</h2>
              <div className="sd-stat-progress-bg">
                <div className="sd-stat-progress-fill bg-[#00d4ff]" style={{ width: fillProgress ? '98.2%' : '0%' }}></div>
              </div>
              <p className="sd-stat-subtext">Across 24 global nodes</p>
            </div>
            <div className="sd-stat-card red">
              <i className="ti ti-alert-triangle sd-stat-icon text-2xl"></i>
              <p className="sd-stat-label">Active Threats</p>
              <h2 className="sd-stat-value">12</h2>
              <div className="sd-stat-progress-bg">
                <div className="sd-stat-progress-fill bg-[#ff3b3b]" style={{ width: fillProgress ? '35%' : '0%' }}></div>
              </div>
              <p className="sd-stat-subtext">4 critical alerts detected</p>
            </div>
            <div className="sd-stat-card orange">
              <i className="ti ti-shield-check sd-stat-icon text-2xl"></i>
              <p className="sd-stat-label">Blocked Hijacks</p>
              <h2 className="sd-stat-value">1,402</h2>
              <div className="sd-stat-progress-bg">
                <div className="sd-stat-progress-fill bg-[#ff8c00]" style={{ width: fillProgress ? '72%' : '0%' }}></div>
              </div>
              <p className="sd-stat-subtext">+12% from last 24h</p>
            </div>
            <div className="sd-stat-card green">
              <i className="ti ti-lock sd-stat-icon text-2xl"></i>
              <p className="sd-stat-label">Encrypted Data</p>
              <h2 className="sd-stat-value">4.2 PB</h2>
              <div className="sd-stat-progress-bg">
                <div className="sd-stat-progress-fill bg-[#00e676]" style={{ width: fillProgress ? '85%' : '0%' }}></div>
              </div>
              <p className="sd-stat-subtext">Zero data leakages reported</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="sd-charts-row">
            {/* Risk Rating */}
            <div className="sd-panel">
              <div className="sd-panel-header">
                <h3 className="sd-panel-title">Risk Rating Breakdown</h3>
                <i className="ti ti-chart-donut text-[#7a8ba8]"></i>
              </div>
              <div className="sd-chart-container">
                <Doughnut data={riskData} options={riskOptions} />
                <div className="sd-donut-center">
                  <div className="sd-donut-value">89</div>
                  <div className="sd-donut-label">Total Risks</div>
                </div>
              </div>
              <div className="sd-legend">
                <div className="sd-legend-item"><div className="sd-legend-dot" style={{backgroundColor: '#ff3b3b'}}></div><span className="sd-legend-label">Severe: 12</span></div>
                <div className="sd-legend-item"><div className="sd-legend-dot" style={{backgroundColor: '#ff8c00'}}></div><span className="sd-legend-label">Major: 19</span></div>
                <div className="sd-legend-item"><div className="sd-legend-dot" style={{backgroundColor: '#ffb800'}}></div><span className="sd-legend-label">Moderate: 28</span></div>
                <div className="sd-legend-item"><div className="sd-legend-dot" style={{backgroundColor: '#00d4ff'}}></div><span className="sd-legend-label">Minor: 45</span></div>
                <div className="sd-legend-item"><div className="sd-legend-dot" style={{backgroundColor: '#2a3a55'}}></div><span className="sd-legend-label">Insignificant: 15</span></div>
              </div>
            </div>

            {/* Risk Heart Map */}
            <div className="sd-panel">
              <div className="sd-panel-header">
                <h3 className="sd-panel-title">Asset Vulnerability Matrix</h3>
                <i className="ti ti-grid-dots text-[#7a8ba8]"></i>
              </div>
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Severe</th>
                    <th>Major</th>
                    <th>Moderate</th>
                    <th>Minor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Production DB</td>
                    <td><span className="sd-pill red">Critical</span></td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>API Gateway</td>
                    <td>—</td>
                    <td><span className="sd-pill orange">High</span></td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Frontend Cache</td>
                    <td>—</td>
                    <td>—</td>
                    <td><span className="sd-pill yellow">Medium</span></td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Internal S3</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td><span className="sd-pill cyan">Low</span></td>
                  </tr>
                  <tr>
                    <td>Dev Sandbox</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td><span className="sd-pill gray">None</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="sd-charts-row">
            {/* Action Plan */}
            <div className="sd-panel">
              <div className="sd-panel-header">
                <h3 className="sd-panel-title">Action Plan Completion</h3>
                <div className="flex gap-4">
                   <span className="text-[10px] font-bold text-[#00e676] uppercase">65% Progress</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 items-center">
                <div className="sd-chart-container" style={{height: '200px'}}>
                   <Doughnut data={actionData} options={riskOptions} />
                   <div className="sd-donut-center">
                      <div className="text-xl font-black">65%</div>
                   </div>
                </div>
                <div className="sd-progress-stack">
                   <div className="sd-progress-item">
                      <div className="sd-progress-label-row"><span>Completed</span><span>65%</span></div>
                      <div className="sd-stat-progress-bg bg-opacity-10"><div className="sd-stat-progress-fill bg-[#00e676]" style={{width: fillProgress ? '65%' : '0%'}}></div></div>
                   </div>
                   <div className="sd-progress-item">
                      <div className="sd-progress-label-row"><span>In Progress</span><span>25%</span></div>
                      <div className="sd-stat-progress-bg bg-opacity-10"><div className="sd-stat-progress-fill bg-[#ffb800]" style={{width: fillProgress ? '25%' : '0%'}}></div></div>
                   </div>
                   <div className="sd-progress-item">
                      <div className="sd-progress-label-row"><span>Pending</span><span>10%</span></div>
                      <div className="sd-stat-progress-bg bg-opacity-10"><div className="sd-stat-progress-fill bg-[#ff3b3b]" style={{width: fillProgress ? '10%' : '0%'}}></div></div>
                   </div>
                </div>
              </div>
            </div>

            {/* Top Entities */}
            <div className="sd-panel">
              <div className="sd-panel-header">
                <h3 className="sd-panel-title">Threat Exposure by Entity</h3>
                <i className="ti ti-chart-bar text-[#7a8ba8]"></i>
              </div>
              <div className="sd-chart-container">
                <Bar data={entitiesData} options={entitiesOptions} />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="sd-charts-row" style={{gridTemplateColumns: 'minmax(0, 1fr) 400px'}}>
             <div className="sd-panel overflow-hidden">
                <div className="sd-panel-header">
                   <h3 className="sd-panel-title">Asset Security Coverage</h3>
                </div>
                <div className="grid grid-cols-5 gap-4">
                   {[...Array(20)].map((_, i) => (
                      <div key={i} className="h-2 rounded-full bg-[#1a2540] relative overflow-hidden group">
                         <div className={`absolute inset-0 transition-all duration-1000 ${i % 4 === 0 ? 'bg-[#ff3b3b]' : 'bg-[#00e676]'}`} style={{width: fillProgress ? '100%' : '0%', transitionDelay: `${i * 50}ms`}}></div>
                         <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity cursor-pointer"></div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Live Activity Feed */}
             <div className="sd-panel">
               <div className="sd-panel-header">
                 <h3 className="sd-panel-title">Live Activity Feed</h3>
                 <div className="sd-pulse-cyan"></div>
               </div>
               <div className="sd-activity-list">
                 <div className="sd-activity-item">
                    <div className="sd-activity-dot" style={{backgroundColor: '#ff3b3b', boxShadow: '0 0 10px #ff3b3b'}}></div>
                    <div className="sd-activity-info">
                       <span className="sd-activity-user">root_admin</span>
                       <span className="sd-activity-action">blocked login attempt</span>
                       <span className="sd-activity-time">2s ago</span>
                    </div>
                    <div className="sd-activity-badge alert">ALERT</div>
                 </div>
                 <div className="sd-activity-item">
                    <div className="sd-activity-dot" style={{backgroundColor: '#ffb800'}}></div>
                    <div className="sd-activity-info">
                       <span className="sd-activity-user">system_daemon</span>
                       <span className="sd-activity-action">detected unusual traffic</span>
                       <span className="sd-activity-time">12m ago</span>
                    </div>
                    <div className="sd-activity-badge warn">WARN</div>
                 </div>
                 <div className="sd-activity-item">
                    <div className="sd-activity-dot" style={{backgroundColor: '#00e676'}}></div>
                    <div className="sd-activity-info">
                       <span className="sd-activity-user">security_bot</span>
                       <span className="sd-activity-action">vault scan complete</span>
                       <span className="sd-activity-time">1h ago</span>
                    </div>
                    <div className="sd-activity-badge ok">OK</div>
                 </div>
                 <div className="sd-activity-item">
                    <div className="sd-activity-dot" style={{backgroundColor: '#00e676'}}></div>
                    <div className="sd-activity-info">
                       <span className="sd-activity-user">akhan</span>
                       <span className="sd-activity-action">authorized MFA reset</span>
                       <span className="sd-activity-time">3h ago</span>
                    </div>
                    <div className="sd-activity-badge ok">OK</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityDashboard;
