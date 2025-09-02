import React, { useState, useMemo } from 'react';
import type { CalendarEvent } from '../types';
import { CalendarIcon, PlusIcon } from './Icons';

export const Scheduler: React.FC = () => {
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({
    [new Date().toISOString().split('T')[0]]: [{ id: '1', date: new Date().toISOString().split('T')[0], title: 'Apply fertilizer', description: 'Apply nitrogen-rich fertilizer to corn fields.'}]
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const selectedDayEvents = useMemo(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return events[dateString] || [];
  }, [events, selectedDate]);
  
  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const dateString = event.date;
    const newEvent = { ...event, id: Date.now().toString() };
    setEvents(prev => ({
      ...prev,
      [dateString]: [...(prev[dateString] || []), newEvent]
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Farming Scheduler</h2>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">Plan and track your agricultural tasks and get reminders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">Select Date</h3>
          <input 
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
           <button onClick={() => setIsModalOpen(true)} className="w-full mt-6 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 transition-colors">
            <PlusIcon className="w-5 h-5"/>
            Add New Task
          </button>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-xl mb-4">
            Tasks for: <span className="text-primary-600">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map(event => (
                <div key={event.id} className="p-4 border-l-4 border-primary-500 bg-primary-50 dark:bg-gray-700 rounded-r-lg">
                  <h4 className="font-bold">{event.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2"/>
                No tasks scheduled for this day.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isModalOpen && <AddEventModal today={today} onClose={() => setIsModalOpen(false)} onAddEvent={handleAddEvent} />}
    </div>
  );
};

const AddEventModal: React.FC<{onClose: () => void; onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void; today: string}> = ({ onClose, onAddEvent, today }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(today);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !date) return;
        onAddEvent({ title, description, date });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-2xl font-bold mb-6">Add New Task</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 resize-none"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Add Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};