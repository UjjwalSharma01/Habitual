'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export default function NewHabit() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily', // daily, weekly, specific-days
    specificDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    color: '#4F46E5', // default color
    startDate: new Date().toISOString().split('T')[0],
    reminderTime: '',
    motivation: '',
    trackingType: 'binary', // binary, numeric, progress
    targetValue: 1,
    unit: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/auth/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('specificDays.')) {
      const day = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specificDays: {
          ...prev.specificDays,
          [day]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    // For specific days, at least one day must be selected
    if (formData.frequency === 'specific-days' && !Object.values(formData.specificDays).some(v => v)) {
      setError('Please select at least one day for your habit');
      return;
    }

    // If tracking type is numeric or progress, need a valid target and unit
    if (formData.trackingType !== 'binary') {
      if (formData.targetValue <= 0) {
        setError('Please set a valid target value greater than 0');
        return;
      }
      if (!formData.unit.trim()) {
        setError('Please specify a unit for tracking (e.g., minutes, pages, etc.)');
        return;
      }
    }

    try {
      setSubmitting(true);

      // Prepare the habit document
      const habitData = {
        ...formData,
        userId: user.uid,
        active: true,
        createdAt: new Date(),
        lastUpdated: new Date(),
        checkIns: {}
      };

      // Add the document to Firestore
      await addDoc(collection(db, 'habits'), habitData);
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding habit:', error);
      setError('Failed to create habit. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              Create a New Habit
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Define your new habit with details to help you track consistently
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            <div className="pt-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Basic Information</h3>
                <p className="mt-1 text-sm text-gray-500">Define what habit you want to build</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Habit Name*
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., Read every day"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Describe your habit and why it's important to you"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      name="color"
                      id="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="h-8 w-8 rounded-md border border-gray-300 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-500">{formData.color}</span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Frequency & Tracking</h3>
                <p className="mt-1 text-sm text-gray-500">When and how do you want to track this habit</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <div className="mt-1">
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="specific-days">Specific Days</option>
                    </select>
                  </div>
                </div>

                {formData.frequency === 'specific-days' && (
                  <div className="sm:col-span-6">
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">Select Days</legend>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-7 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                          <div key={day} className="flex items-center">
                            <input
                              id={`day-${day}`}
                              name={`specificDays.${day}`}
                              type="checkbox"
                              checked={formData.specificDays[day]}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`day-${day}`} className="ml-2 text-sm text-gray-700 capitalize">
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                <div className="sm:col-span-3">
                  <label htmlFor="trackingType" className="block text-sm font-medium text-gray-700">
                    Tracking Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="trackingType"
                      name="trackingType"
                      value={formData.trackingType}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="binary">Yes/No (Done or Not Done)</option>
                      <option value="numeric">Numeric Value (e.g., minutes, pages)</option>
                      <option value="progress">Progress Bar (for multi-step habits)</option>
                    </select>
                  </div>
                </div>

                {formData.trackingType !== 'binary' && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700">
                        Target Value
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="targetValue"
                          id="targetValue"
                          min="1"
                          value={formData.targetValue}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                        Unit
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="unit"
                          id="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., minutes, pages, steps"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="sm:col-span-3">
                  <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700">
                    Reminder Time (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="time"
                      name="reminderTime"
                      id="reminderTime"
                      value={formData.reminderTime}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Motivation</h3>
                <p className="mt-1 text-sm text-gray-500">What's your purpose behind this habit?</p>
              </div>

              <div className="mt-6">
                <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
                  Your Motivation (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="motivation"
                    name="motivation"
                    rows={3}
                    value={formData.motivation}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Why is this habit important to you? How will it improve your life?"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {submitting ? 'Creating...' : 'Create Habit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
