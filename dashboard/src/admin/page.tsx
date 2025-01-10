'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Download, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import { PlayerData } from '../../types/game';
import ExcelJS from 'exceljs';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ADMIN_VIEW_PASSWORD = import.meta.env.VITE_ADMIN_VIEW_PASSWORD;

export default function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/players/all`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    if (isAuthenticated) {
      fetchPlayers();
      const interval = setInterval(fetchPlayers, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = () => {
    if (password === ADMIN_VIEW_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const exportFileName = eventName.trim()
    ? `${eventName.toLowerCase().replace(/\s+/g, '-')}-attendees.csv`
    : '';

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AttendeeView';
    const worksheetName = eventName.trim() || 'Attendees';
    const worksheet = workbook.addWorksheet(worksheetName);

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Job Title', key: 'job_title', width: 20 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Consent', key: 'consent', width: 10 },
    ];

    // Add data
    players.forEach((player) => {
      worksheet.addRow({
        name: player.name,
        company: player.company,
        job_title: player.job_title || 'N/A',
        phone: player.phone || 'N/A',
        email: player.email,
        consent: player.consent ? 'Yes' : 'No',
      });
    });

    // Export to CSV
    const fileName = `${eventName.trim() ? eventName.trim().replace(/\s+/g, '-') : 'export'}-attendees.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to delete all player data?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/players/delete`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete all players');
        setPlayers([]);
      } catch (error) {
        console.error('Error deleting all players:', error);
        alert('Failed to delete all players.');
      }
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/players/delete/${playerId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete player');
        setPlayers((prev) => prev.filter((player) => player.id !== playerId));
      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete the player.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Admin Access</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordSubmit();
            }}
          >
            <Input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />
            <Button
              type="submit"
              variant="default"
              className="w-full"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    );
  }  

  return (
    <div className="min-h-screen bg-white p-8 font-corporate">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-slate-50/80">
          <div className="flex items-center justify-between mb-6">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Participating Attendees
            </CardTitle>
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Clear All Data
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Export Configuration Required
                  </h3>
                  <p className="text-sm text-slate-600">
                    Please enter an event name below. This will be used to generate your CSV export
                    filename. Use a descriptive name that helps identify this particular attendee
                    dataset.
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="eventName"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Event Name
                  </label>
                  <div className="flex gap-4">
                    <Input
                      id="eventName"
                      placeholder="e.g., Summer Tournament 2025"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="font-corporate max-w-md text-base"
                    />
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 min-w-[140px]"
                      disabled={!eventName.trim()}
                      title={
                        !eventName.trim() ? 'Please enter an event name first' : 'Export to CSV'
                      }
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4" />
                      Export to CSV
                    </Button>
                  </div>
                </div>

                {exportFileName && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                    <span className="font-medium">Export filename:</span>
                    <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      {exportFileName}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-100 text-slate-600">
                    <th className="px-6 py-4 text-left font-semibold tracking-tight">Name</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-tight">Company</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-tight">Job Title</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-tight">Phone</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-tight">Email</th>
                    <th className="px-6 py-4 text-center font-semibold tracking-tight">Consent</th>
                    <th className="px-6 py-4 text-center font-semibold tracking-tight">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {players.map((player, index) => (
                    <tr
                      key={player.id}
                      className={`
                        transition-colors hover:bg-slate-50/80
                        ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                      `}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">{player.name}</td>
                      <td className="px-6 py-4 text-slate-600">{player.company}</td>
                      <td className="px-6 py-4 text-slate-600">{player.job_title || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600">{player.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600">{player.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {player.consent ? (
                            <Check className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => handleDeletePlayer(player.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
