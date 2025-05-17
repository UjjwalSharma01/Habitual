'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HabitForm({ initialData = {}, onSubmit, submitButtonText = "Save Habit", showCancel = false, onCancel }) {
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
    routine: '',
    trackingType: 'binary', // binary, numeric, progress
    targetValue: 1,
    unit: '',
    steps: [], // For progress tracking
    ...initialData
  });
  
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  const colorOptions = [
    { value: '#4F46E5', label: 'Blue' },
    { value: '#10B981', label: 'Green' },
    { value: '#EF4444', label: 'Red' },
    { value: '#F59E0B', label: 'Orange' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#6B7280', label: 'Gray' },
  ];

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

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    let isValid = true;
    let errorMsg = '';

    if (!formData.name.trim()) {
      isValid = false;
      errorMsg = 'Habit name is required';
    } else if (formData.frequency === 'specific-days' && !Object.values(formData.specificDays).some(v => v)) {
      isValid = false;
      errorMsg = 'Please select at least one day for your habit';
    } else if (formData.trackingType === 'numeric') {
      if (formData.targetValue <= 0) {
        isValid = false;
        errorMsg = 'Please set a valid target value greater than 0';
      } else if (!formData.unit.trim()) {
        isValid = false;
        errorMsg = 'Please specify a unit for tracking (e.g., minutes, pages, etc.)';
      }
    } else if (formData.trackingType === 'progress') {
      // Mark steps as touched for validation
      setTouched(prev => ({...prev, steps: true}));
      
      if (formData.steps.length === 0) {
        isValid = false;
        errorMsg = 'Please add at least one step for progress tracking';
      } else if (formData.steps.some(step => !step.trim())) {
        isValid = false;
        errorMsg = 'All steps must have a description';
      }
    }

    setError(errorMsg);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit} 
      className="space-y-8 divide-y divide-border"
    >
      <div className="space-y-8 divide-y divide-border">
        <div className="pt-4">
          <div>
            <h3 className="text-lg font-medium leading-6 text-foreground">Basic Information</h3>
            <p className="mt-1 text-sm text-muted-foreground">Define what habit you want to build</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Habit Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                  placeholder="e.g., Morning Meditation, Daily Reading"
                />
              </div>
              {touched.name && !formData.name && (
                <p className="mt-1 text-xs text-red-500">Habit name is required</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                  placeholder="Add details about your habit..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-foreground">Motivation & Integration</h3>
            <p className="mt-1 text-sm text-muted-foreground">Understanding your &apos;why&apos; boosts consistency</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="motivation" className="block text-sm font-medium text-foreground">
                Your Motivation (Recommended)
              </label>
              <div className="mt-1">
                <textarea
                  id="motivation"
                  name="motivation"
                  rows={3}
                  value={formData.motivation}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                  placeholder="Why is this habit important to you?"
                ></textarea>
                <p className="mt-1 text-xs text-muted-foreground">
                  This helps you stay committed when motivation dips.
                </p>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="routine" className="block text-sm font-medium text-foreground">
                Link to Existing Routine (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="routine"
                  id="routine"
                  value={formData.routine}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                  placeholder="e.g., After morning coffee, Before bed"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Habit stacking: &quot;After/Before I [existing habit], I will [new habit]&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-foreground">Scheduling</h3>
            <p className="mt-1 text-sm text-muted-foreground">When will you practice this habit?</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="frequency" className="block text-sm font-medium text-foreground">
                Frequency <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="specific-days">Specific Days</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.startDate}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                />
              </div>
            </div>

            {formData.frequency === 'specific-days' && (
              <div className="sm:col-span-6">
                <fieldset>
                  <legend className="block text-sm font-medium text-foreground mb-2">Select Days <span className="text-red-500">*</span></legend>
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center">
                        <input
                          id={`day-${day}`}
                          name={`specificDays.${day}`}
                          type="checkbox"
                          checked={formData.specificDays[day]}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                        <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-foreground capitalize">
                          {day.slice(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
                {formData.frequency === 'specific-days' && 
                 touched.frequency && 
                 !Object.values(formData.specificDays).some(v => v) && (
                  <p className="mt-1 text-xs text-red-500">Please select at least one day</p>
                )}
              </div>
            )}

            <div className="sm:col-span-3">
              <label htmlFor="reminderTime" className="block text-sm font-medium text-foreground">
                Reminder Time (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="time"
                  name="reminderTime"
                  id="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="color" className="block text-sm font-medium text-foreground">
                Color
              </label>
              <div className="mt-1">
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                >
                  {colorOptions.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-foreground">Tracking</h3>
            <p className="mt-1 text-sm text-muted-foreground">How would you like to track this habit?</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="trackingType" className="block text-sm font-medium text-foreground">
                Tracking Type
              </label>
              <div className="mt-1">
                <select
                  id="trackingType"
                  name="trackingType"
                  value={formData.trackingType}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                >
                  <option value="binary">Yes/No (Did it or didn&apos;t)</option>
                  <option value="numeric">Numeric (e.g., minutes, pages)</option>
                  <option value="progress">Progress Bar (multi-step goals)</option>
                </select>
              </div>
            </div>

            {formData.trackingType === 'numeric' && (
              <>
                <div className="sm:col-span-1">
                  <label htmlFor="targetValue" className="block text-sm font-medium text-foreground">
                    Target <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      min="1"
                      name="targetValue"
                      id="targetValue"
                      value={formData.targetValue}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                    />
                  </div>
                  {touched.targetValue && formData.targetValue <= 0 && (
                    <p className="mt-1 text-xs text-red-500">Value must be greater than 0</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="unit" className="block text-sm font-medium text-foreground">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="unit"
                      id="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                      placeholder="e.g., minutes, pages, steps"
                    />
                  </div>
                  {touched.unit && !formData.unit && (
                    <p className="mt-1 text-xs text-red-500">Unit is required</p>
                  )}
                </div>
              </>
            )}

            {formData.trackingType === 'progress' && (
              <div className="sm:col-span-6">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-foreground">
                    Steps <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newSteps = [...formData.steps, ''];
                      setFormData(prev => ({...prev, steps: newSteps}))
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Add Step
                  </button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {formData.steps.length === 0 && (
                    <p className="text-sm text-muted-foreground">Add steps to track progress through your habit</p>
                  )}
                  
                  {formData.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index] = e.target.value;
                            setFormData(prev => ({...prev, steps: newSteps}))
                          }}
                          placeholder={`Step ${index+1}`}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = [...formData.steps];
                          newSteps.splice(index, 1);
                          setFormData(prev => ({...prev, steps: newSteps}))
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                {touched.steps && formData.steps.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">At least one step is required</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="pt-5">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-5">
        <div className="flex justify-end gap-3">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150"
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
