import React, { useState } from 'react';

const PAY_MATRIX = {
  "Level 1 (1800 GP)": [18000, 18500, 19100, 19700, 20300, 20900, 21500, 22100, 22800, 23500, 24200, 24900, 25600, 26400, 27200, 28000, 28800, 29700, 30600, 31500, 32400, 33400, 34400, 35400, 36500, 37600, 38700, 39900, 41100, 42300, 43600, 44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900],
  "Level 2 (1900 GP)": [19900, 20500, 21100, 21700, 22400, 23100, 23800, 24500, 25200, 26000, 26800, 27600, 28400, 29300, 30200, 31100, 32000, 33000, 34000, 35000, 36100, 37200, 38300, 39400, 40600, 41800, 43100, 44400, 45700, 47100, 48500, 50000, 51500, 53000, 54600, 56200, 57900, 59600, 61400, 63200],
  "Level 3 (2000 GP)": [21700, 22400, 23100, 23800, 24500, 25200, 26000, 26800, 27600, 28400, 29300, 30200, 31100, 32000, 33000, 34000, 35000, 36100, 37200, 38300, 39400, 40600, 41800, 43100, 44400, 45700, 47100, 48500, 50000, 51500, 53000, 54600, 56200, 57900, 59600, 61400, 63200, 65100, 67100, 69100],
  "Level 4 (2400 GP)": [25500, 26300, 27100, 27900, 28700, 29600, 30500, 31400, 32300, 33300, 34300, 35300, 36400, 37500, 38600, 39800, 41000, 42200, 43500, 44800, 46100, 47500, 48900, 50400, 51900, 53500, 55100, 56800, 58500, 60300, 62100, 64000, 65900, 67900, 69900, 72000, 74200, 76400, 78700, 81100],
  "Level 5 (2800 GP)": [29200, 30100, 31000, 31900, 32900, 33900, 34900, 35900, 37000, 38100, 39200, 40400, 41600, 42800, 44100, 45400, 46800, 48200, 49600, 51100, 52600, 54200, 55800, 57500, 59200, 61000, 62800, 64700, 66600, 68600, 70700, 72800, 75000, 77300, 79600, 82000, 84500, 87000, 89600, 92300],
  "Level 6 (4200 GP)": [35400, 36500, 37600, 38700, 39900, 41100, 42300, 43600, 44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300, 76500, 78800, 81200, 83600, 86100, 88700, 91400, 94100, 96900, 99800, 102800, 105900, 109100, 112400]
};
const ALL_BASIC_PAYS = Array.from(new Set(Object.values(PAY_MATRIX).flat())).sort((a,b) => a-b);
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getAutoDa = (m, y) => {
  if (y <= 2020) return 17.0;
  if (y === 2021) return m < 7 ? 17.0 : 28.0;
  if (y === 2022) return m < 7 ? 34.0 : 38.0;
  if (y === 2023) return m < 7 ? 42.0 : 46.0;
  if (y === 2024) return m < 7 ? 50.0 : 53.0;
  if (y === 2025) return m < 7 ? 56.0 : 58.0;
  if (y === 2026) return m < 7 ? 60.0 : 63.0;
  return 0.0;
};

const AttendanceRoster = () => {
  const [activeTab, setActiveTab] = useState('master');
  const [ministry, setMinistry] = useState('');
  const [department, setDepartment] = useState('');
  const [office, setOffice] = useState('');
  const [nightHours, setNightHours] = useState(8);
  const [employees, setEmployees] = useState([]);
  
  const [newEmp, setNewEmp] = useState({
    empNo: '', name: '', post: '', level: 'Level 1 (1800 GP)', defaultBasicPay: PAY_MATRIX['Level 1 (1800 GP)'][0]
  });

  const [activeMonths, setActiveMonths] = useState([]);
  const [startMonth, setStartMonth] = useState(9);
  const [startYear, setStartYear] = useState(2026);
  const [fastEntryDays, setFastEntryDays] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmp.empNo || !newEmp.name) return alert("Please enter Emp No and Name!");
    setEmployees([...employees, { id: Date.now(), ...newEmp, attendance: {}, basicPayHistory: {} }]);
    setNewEmp({ ...newEmp, empNo: '', name: '', post: '' });
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setNewEmp({ ...newEmp, level: level, defaultBasicPay: PAY_MATRIX[level][0] });
  };

  const removeEmployee = (empId) => {
    setEmployees(employees.filter(emp => emp.id !== empId));
  };

  const startRegister = () => {
    if(activeMonths.length === 0) setActiveMonths([{ m: startMonth, y: startYear }]);
  };

  const addNextMonth = () => {
    const last = activeMonths[activeMonths.length - 1];
    let nextM = last.m + 1;
    let nextY = last.y;
    if (nextM > 12) { nextM = 1; nextY += 1; }
    setActiveMonths([...activeMonths, { m: nextM, y: nextY }]);
  };

  const toggleDuty = (empId, periodKey, day) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        const currentAtt = emp.attendance[periodKey] || {};
        return { ...emp, attendance: { ...emp.attendance, [periodKey]: { ...currentAtt, [day]: !currentAtt[day] } } };
      }
      return emp;
    }));
  };

  const updateBasicPay = (empId, periodKey, newValue) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, basicPayHistory: { ...emp.basicPayHistory, [periodKey]: parseInt(newValue) } };
      }
      return emp;
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        ministry, department, office, night_hours_per_duty: parseFloat(nightHours),
        months_data: activeMonths.map(period => {
          const periodKey = `${period.m}_${period.y}`;
          return {
            month: period.m,
            year: period.y,
            records: employees.filter(emp => emp.name.trim() !== '').map(emp => {
              const att = emp.attendance[periodKey] || {};
              const dutiesCount = Object.values(att).filter(Boolean).length;
              return {
                emp_no: String(emp.empNo),
                name: emp.name,
                post: emp.post,
                basic_pay: emp.basicPayHistory[periodKey] || emp.defaultBasicPay,
                total_duties: dutiesCount,
                attendance: att
              };
            })
          };
        })
      };

const response = await fetch('https://nda-api.onrender.com/generate-reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `NDA_Reports.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        alert("⚠️ Backend Error! Check VS Code Terminal.");
      }
    } catch (error) {
      alert("❌ Cannot connect to Backend!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      
      {/* 🧭 TABS */}
      <div className="flex space-x-2 border-b-2 border-gray-200 mb-6 pb-2">
        <button onClick={() => setActiveTab('master')} className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'master' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>🏛️ 1. Employee Master</button>
        <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>📅 2. Mark Attendance</button>
        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>📊 3. Generate Reports</button>
      </div>

      {/* 🏛️ TAB 1: MASTER */}
      {activeTab === 'master' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">🏢 Office Details (For Report Header)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Ministry (e.g. Defence)" className="p-2 border rounded outline-none" value={ministry} onChange={(e) => setMinistry(e.target.value)} />
              <input type="text" placeholder="Department" className="p-2 border rounded outline-none" value={department} onChange={(e) => setDepartment(e.target.value)} />
              <input type="text" placeholder="Office Name" className="p-2 border rounded outline-none" value={office} onChange={(e) => setOffice(e.target.value)} />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">👥 Add New Employee</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <input type="text" placeholder="Emp No" className="p-2 border rounded outline-none" value={newEmp.empNo} onChange={e => setNewEmp({...newEmp, empNo: e.target.value})} />
              <input type="text" placeholder="Full Name" className="col-span-2 p-2 border rounded outline-none" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
              <input type="text" placeholder="Post" className="p-2 border rounded outline-none" value={newEmp.post} onChange={e => setNewEmp({...newEmp, post: e.target.value})} />
              <select className="p-2 border rounded outline-none bg-white font-medium" value={newEmp.level} onChange={handleLevelChange}>
                {Object.keys(PAY_MATRIX).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
              <select className="p-2 border rounded outline-none bg-white font-medium" value={newEmp.defaultBasicPay} onChange={e => setNewEmp({...newEmp, defaultBasicPay: e.target.value})}>
                {PAY_MATRIX[newEmp.level].map(pay => <option key={pay} value={pay}>₹ {pay}</option>)}
              </select>
            </div>
            <button onClick={handleAddEmployee} type="button" className="mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 w-full md:w-auto">➕ Add</button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left border-collapse bg-white">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border-b">Emp No</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Post</th>
                  <th className="p-3 border-b">Level</th>
                  <th className="p-3 border-b">Basic Pay</th>
                  <th className="p-3 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? <tr><td colSpan="6" className="p-4 text-center text-gray-500">No employees added yet.</td></tr> : null}
                {employees.map(emp => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{emp.empNo}</td>
                    <td className="p-3">{emp.name}</td>
                    <td className="p-3">{emp.post}</td>
                    <td className="p-3 text-sm text-gray-600">{emp.level}</td>
                    <td className="p-3 font-bold">₹ {emp.defaultBasicPay}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => removeEmployee(emp.id)} className="text-red-500 hover:text-red-700 font-bold">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right">
            <button onClick={() => setActiveTab('attendance')} className="bg-gray-800 text-white font-bold py-2 px-6 rounded hover:bg-gray-700">Next: Mark Attendance ➡️</button>
          </div>
        </div>
      )}

      {/* 📅 TAB 2: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          {employees.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border">⚠️ Add employees in Tab 1 first.</div>
          ) : activeMonths.length === 0 ? (
            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-bold text-blue-800">Select Start Month:</h3>
              <select className="p-2 border rounded font-semibold bg-white" value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))}>
                {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <input type="number" className="p-2 border rounded font-semibold bg-white w-24" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} />
              <button onClick={startRegister} className="bg-green-600 text-white font-bold py-2 px-6 rounded">🚀 Start Register</button>
            </div>
          ) : (
            <div>
              {activeMonths.map((period, index) => {
                const periodKey = `${period.m}_${period.y}`;
                const daysInMonth = new Date(period.y, period.m, 0).getDate();
                const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                const currDayIdx = fastEntryDays[periodKey] || 0;
                const da = getAutoDa(period.m, period.y);

                return (
                  <div key={periodKey} className="mb-8 border-b-2 border-gray-300 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-bold text-gray-800">📅 {MONTH_NAMES[period.m - 1]} {period.y}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">Auto DA: {da}%</span>
                    </div>

                    <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">⚡ Daily Duty Roster (Fast Entry)</h4>
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <select className="p-2 border rounded font-medium bg-gray-50 outline-none w-48"
                          value={daysArray[currDayIdx]}
                          onChange={(e) => setFastEntryDays({...fastEntryDays, [periodKey]: daysArray.indexOf(Number(e.target.value))})}
                        >
                          {daysArray.map(day => <option key={day} value={day}>{day} {new Date(period.y, period.m - 1, day).toLocaleDateString('en-US', { weekday: 'short' })}</option>)}
                        </select>
                        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-2">
                          {employees.map(emp => {
                            const isChecked = !!(emp.attendance[periodKey]?.[daysArray[currDayIdx]]);
                            return (
                              <label key={emp.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${isChecked ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}>
                                <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={isChecked} onChange={() => toggleDuty(emp.id, periodKey, daysArray[currDayIdx])} />
                                <span className="text-sm font-semibold text-gray-700 truncate">🧑‍💼 {emp.empNo} - {emp.name.split(' ')[0]}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button onClick={() => {
                          if (currDayIdx < daysArray.length - 1) setFastEntryDays({...fastEntryDays, [periodKey]: currDayIdx + 1});
                          else alert("End of month!");
                        }} className="bg-red-500 text-white font-bold py-2 px-6 rounded">➡️ Next Day</button>
                      </div>
                    </div>

                    <div className="overflow-x-auto bg-gray-50 rounded-lg border shadow-inner pb-2" style={{ maxWidth: '100vw' }}>
                      <table className="w-full text-left border-collapse" style={{ minWidth: 'max-content' }}>
                        <thead>
                          <tr className="bg-gray-200 text-gray-700">
                            <th className="p-3 border-r font-bold sticky left-0 bg-gray-200 z-10 w-[220px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Emp No & Name</th>
                            <th className="p-3 border-r border-gray-400 font-bold sticky left-[220px] bg-gray-200 z-10 w-[140px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Basic Pay (₹) ✏️</th>
                            {daysArray.map(day => <th key={day} className="p-2 border-r font-bold text-center min-w-[45px]">{day}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-blue-50 border-b bg-white">
                              <td className="p-2 border-r font-medium text-sm sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] truncate" title={`${emp.empNo} - ${emp.name}`}>
                                {emp.empNo} - {emp.name}
                              </td>
                              <td className="p-1 border-r border-gray-400 font-bold text-gray-700 sticky left-[220px] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <select 
                                  className="w-full p-1 border rounded outline-none bg-yellow-50 focus:bg-white"
                                  value={emp.basicPayHistory[periodKey] || emp.defaultBasicPay}
                                  onChange={(e) => updateBasicPay(emp.id, periodKey, e.target.value)}
                                >
                                  {ALL_BASIC_PAYS.map(bp => <option key={bp} value={bp}>₹ {bp}</option>)}
                                </select>
                              </td>
                              {daysArray.map(day => (
                                <td key={day} className="p-1 border-r text-center">
                                  <button onClick={() => toggleDuty(emp.id, periodKey, day)} className={`w-8 h-8 rounded font-bold transition-all ${emp.attendance[periodKey]?.[day] ? 'bg-blue-600 text-white shadow scale-110' : 'bg-gray-100 text-transparent hover:bg-gray-200'}`}>✓</button>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-4 mt-6">
                <button onClick={addNextMonth} className="flex-1 bg-gray-100 border border-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-200 transition">
                  ➕ Add Next Month
                </button>
                <button onClick={() => setActiveMonths([])} className="bg-red-100 border border-red-300 text-red-800 font-bold py-3 px-6 rounded-lg hover:bg-red-200 transition">
                  🗑️ Reset Register
                </button>
              </div>

              <div className="text-right mt-6">
                <button onClick={() => setActiveTab('reports')} className="bg-gray-800 text-white font-bold py-2 px-6 rounded hover:bg-gray-700">Next: Generate Reports ➡️</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📊 TAB 3: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gray-50 p-6 rounded-lg border text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🚀 Ready to Generate Final Bill</h3>
            <p className="text-gray-600 mb-6">Backend will process DA and generate full PDF/Word/Excel reports.</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <label className="font-bold text-gray-700">Actual Night Hours per Shift:</label>
              <input type="number" step="0.5" className="p-2 border rounded w-24 text-center font-bold text-blue-600" value={nightHours} onChange={(e) => setNightHours(e.target.value)} />
            </div>
            <button onClick={handleGenerateReport} disabled={isGenerating || employees.length === 0} className={`font-bold py-4 px-10 rounded-lg text-lg shadow-lg ${isGenerating ? 'bg-gray-400 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              {isGenerating ? '⏳ Generating...' : '🚀 Generate NDA Reports (Excel/PDF/Word)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AttendanceRoster;