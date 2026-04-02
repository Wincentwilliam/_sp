import { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Loading from '../components/common/Loading';
import Toast from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Clock, Trash2, CheckCircle, Plus } from 'lucide-react';

export default function CalendarPage() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [newEntry, setNewEntry] = useState({
    entry_type: 'meal',
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const response = await scheduleAPI.getSchedule({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
      setEntries(response.data.entries);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load calendar' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();

    try {
      await scheduleAPI.createEntry({
        ...newEntry,
        scheduled_date: newEntry.scheduled_date || selectedDate.toISOString().split('T')[0],
      });
      setToast({ type: 'success', message: 'Entry added!' });
      setShowModal(false);
      fetchEntries();
      setNewEntry({
        entry_type: 'meal',
        title: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 30,
      });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to add entry' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await scheduleAPI.completeEntry(id);
      setToast({ type: 'success', message: 'Marked as completed!' });
      fetchEntries();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await scheduleAPI.deleteEntry(id);
      setToast({ type: 'success', message: 'Entry deleted!' });
      fetchEntries();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete' });
    }
  };

  const getEntriesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter((entry) => entry.scheduled_date === dateStr);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'meal':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'workout':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reminder':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const selectedDateEntries = getEntriesForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">
            Plan your meals and workouts
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Entry
        </Button>
      </div>

      {loading && (
        <div className="py-12">
          <Loading text="Loading your schedule..." />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              tileContent={({ date }) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayEntries = entries.filter((e) => e.scheduled_date === dateStr);
                if (dayEntries.length > 0) {
                  return (
                    <div className="flex justify-center mt-1">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    </div>
                  );
                }
                return null;
              }}
              className="w-full border-none"
            />
          </Card>

          {/* Day's Entries */}
          <Card className="lg:col-span-2" title={`Schedule for ${selectedDate.toLocaleDateString()}`}>
            {selectedDateEntries.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No entries for this day</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowModal(true)}
                >
                  Add Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${getTypeColor(
                      entry.entry_type
                    )}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
                        {entry.entry_type === 'meal' ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{entry.title}</p>
                        {entry.description && (
                          <p className="text-sm opacity-75">{entry.description}</p>
                        )}
                        {entry.scheduled_time && (
                          <p className="text-xs mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {entry.scheduled_time}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!entry.completed && (
                        <button
                          onClick={() => handleComplete(entry.id)}
                          className="p-2 hover:bg-white/50 rounded-full transition-colors"
                          title="Mark as complete"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 hover:bg-white/50 rounded-full transition-colors text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Entry Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Schedule Entry"
        size="md"
      >
        <form onSubmit={handleAddEntry} className="space-y-4">
          <Select
            label="Type"
            name="entry_type"
            value={newEntry.entry_type}
            onChange={(e) =>
              setNewEntry({ ...newEntry, entry_type: e.target.value })
            }
            options={[
              { value: 'meal', label: 'Meal' },
              { value: 'workout', label: 'Workout' },
              { value: 'reminder', label: 'Reminder' },
            ]}
          />

          <Input
            label="Title"
            name="title"
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            placeholder="e.g., Breakfast, Gym Workout"
            required
          />

          <Input
            label="Description (optional)"
            name="description"
            value={newEntry.description}
            onChange={(e) =>
              setNewEntry({ ...newEntry, description: e.target.value })
            }
            placeholder="Details about this entry"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              name="scheduled_date"
              value={newEntry.scheduled_date}
              onChange={(e) =>
                setNewEntry({ ...newEntry, scheduled_date: e.target.value })
              }
            />
            <Input
              label="Time"
              type="time"
              name="scheduled_time"
              value={newEntry.scheduled_time}
              onChange={(e) =>
                setNewEntry({ ...newEntry, scheduled_time: e.target.value })
              }
            />
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            name="duration_minutes"
            value={newEntry.duration_minutes}
            onChange={(e) =>
              setNewEntry({ ...newEntry, duration_minutes: parseInt(e.target.value) })
            }
            placeholder="30"
          />

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
