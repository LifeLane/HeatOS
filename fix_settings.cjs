const fs = require('fs');

let content = fs.readFileSync('src/components/views/SettingsView.tsx', 'utf8');

// Add states
content = content.replace(
  `const [highDensityMode, setHighDensityMode] = useState<boolean>(true);`,
  `const [highDensityMode, setHighDensityMode] = useState<boolean>(true);\n  const [pushNotifications, setPushNotifications] = useState<boolean>(false);\n  const [exporting, setExporting] = useState<boolean>(false);\n\n  const handleExportData = () => {\n    setExporting(true);\n    try {\n      const rows = [\n        ['Timestamp', 'Heat Index (°C)', 'Air Quality (AQI)', 'Humidity (%)'],\n        [new Date(Date.now() - 3600000).toISOString(), '31.2', '45', '60'],\n        [new Date(Date.now() - 1800000).toISOString(), '31.8', '47', '58'],\n        [new Date(Date.now()).toISOString(), '32.5', '42', '56'],\n      ];\n      const csvContent = rows.map(e => e.join(",")).join("\\n");\n      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });\n      const url = URL.createObjectURL(blob);\n      const link = document.createElement('a');\n      link.setAttribute('href', url);\n      link.setAttribute('download', \`environmental_data_\${Date.now()}.csv\`);\n      document.body.appendChild(link);\n      link.click();\n      document.body.removeChild(link);\n    } catch (e) {\n      console.error(e);\n    } finally {\n      setTimeout(() => setExporting(false), 800);\n    }\n  };\n`
);

const additionalCards = `
          {/* Alerts & Notifications */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Alerts &amp; Notifications</h2>
                <p className="text-xs text-slate-500">Configure environmental push notifications</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Push Notifications</label>
                <p className="text-xs text-slate-500">Receive browser alerts for critical environmental events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifications} onChange={() => {
                  if (!pushNotifications) {
                    if ('Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                          setPushNotifications(true);
                          new Notification('FortyGuard Alerts Enabled', { body: 'You will now receive critical environmental alerts.' });
                        }
                      });
                    } else {
                      setPushNotifications(true);
                    }
                  } else {
                    setPushNotifications(false);
                  }
                }} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>
          </Card>

          {/* Data Management */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Data Management</h2>
                <p className="text-xs text-slate-500">Export and manage your local environmental data</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Export Telemetry Data</label>
                <p className="text-xs text-slate-500">Download historical Heat Index, AQI, and Humidity (CSV)</p>
              </div>
              <button type="button" onClick={handleExportData} disabled={exporting} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                <Save className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </Card>

          {/* Save Action Bar */}
`;

content = content.replace('          {/* Save Action Bar */}', additionalCards);

fs.writeFileSync('src/components/views/SettingsView.tsx', content);
