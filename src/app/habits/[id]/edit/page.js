'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { use } from 'react';

export default function EditHabit({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [habit, setHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trackingType: 'binary',
    targetValue: 1,
    unit: '',
    steps: [''],
    active: true
  });
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch the habit
    const fetchHabit = async () => {
      if (!user || !params.id) return;
      
      try {
        const habitRef = doc(db, 'habits', params.id);
        const habitSnap = await getDoc(habitRef);
        
        if (!habitSnap.exists()) {
          setError('Habit not found.');
          setLoadingData(false);
          return;
        }
        
        const habitData = {
          id: habitSnap.id,
          ...habitSnap.data()
        };
        
        // Check if this habit belongs to the current user
        if (habitData.userId !== user.uid) {
          setError('You do not have permission to edit this habit.');
          setLoadingData(false);
          return;
        }
        
        setHabit(habitData);
        setFormData({
          name: habitData.name || '',
          description: habitData.description || '',
          trackingType: habitData.trackingType || 'binary',
          targetValue: habitData.targetValue || 1,
          unit: habitData.unit || '',
          steps: habitData.steps || [''],
          active: habitData.active !== undefined ? habitData.active : true
        });
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching habit:', error);
        setError('Failed to load habit data. Please try again later.');
        setLoadingData(false);
      }
    };
    
    if (user) {
      fetchHabit();
    }
  }, [user, loading, params.id, router]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };
  
  const addStep = () => {
    setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };
  
  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, steps: newSteps.length ? newSteps : [''] }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const habitRef = doc(db, 'habits', params.id);
      
      const updatedHabit = {
        name: formData.name,
        description: formData.description,
        trackingType: formData.trackingType,
        targetValue: formData.trackingType === 'numeric' ? Number(formData.targetValue) : null,
        unit: formData.trackingType === 'numeric' ? formData.unit : null,
        steps: formData.trackingType === 'progress' ? formData.steps.filter(step => step.trim()) : null,
        active: formData.active,
        lastUpdated: new Date()
      };
      
      await updateDoc(habitRef, updatedHabit);
      
      // Navigate back to habit detail
      router.push(`/habits/${params.id}`);
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Failed to update habit. Please try again.');
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }
    
    try {
      setSubmitting(true);
      const habitRef = doc(db, 'habits', params.id);
      await deleteDoc(habitRef);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Failed to delete habit. Please try again.');
      setSubmitting(false);
    }
  };
  
  if (loading || loadingData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Go back to dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!habit) return null;
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push(`/habits/${params.id}`)}
            className="mr-3 p-1 rounded-full hover:bg-muted text-foreground"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold leading-7 text-foreground sm:text-2xl">
            Edit Habit
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Habit Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="e.g., Morning Meditation"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="What's this habit about?"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground">
              Tracking Type
            </label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="radio"
                  id="binary"
                  name="trackingType"
                  value="binary"
                  checked={formData.trackingType === 'binary'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <label
                  htmlFor="binary"
                  className={`block w-full p-3 text-center border rounded-md cursor-pointer text-sm
                    ${formData.trackingType === 'binary' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-border hover:bg-muted'}`}
                >
                  Yes/No
                </label>
              </div>
              
              <div>
                <input
                  type="radio"
                  id="numeric"
                  name="trackingType"
                  value="numeric"
                  checked={formData.trackingType === 'numeric'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <label
                  htmlFor="numeric"
                  className={`block w-full p-3 text-center border rounded-md cursor-pointer text-sm
                    ${formData.trackingType === 'numeric' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-border hover:bg-muted'}`}
                >
                  Numeric
                </label>
              </div>
              
              <div>
                <input
                  type="radio"
                  id="progress"
                  name="trackingType"
                  value="progress"
                  checked={formData.trackingType === 'progress'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <label
                  htmlFor="progress"
                  className={`block w-full p-3 text-center border rounded-md cursor-pointer text-sm
                    ${formData.trackingType === 'progress' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-border hover:bg-muted'}`}
                >
                  Progress Steps
                </label>
              </div>
            </div>
          </div>
          
          {formData.trackingType === 'numeric' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetValue" className="block text-sm font-medium text-foreground">
                  Target Value
                </label>
                <input
                  type="number"
                  name="targetValue"
                  id="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  min="0"
                  step="any"
                  required
                  className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-foreground">
                  Unit (optional)
                </label>
                <input
                  type="text"
                  name="unit"
                  id="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="e.g., minutes, pages"
                />
              </div>
            </div>
          )}
          
          {formData.trackingType === 'progress' && (
            <div>
              <label className="block text-sm font-medium text-foreground">
                Progress Steps
              </label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Define the steps needed to complete this habit
              </p>
              
              <div className="space-y-2">
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      className="block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder={`Step ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700"
                      disabled={formData.steps.length <= 1}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addStep}
                className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Step
              </button>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-foreground">
              Active habit (uncheck if completed or no longer tracking)
            </label>
          </div>
          
          <div className="flex justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleDelete}
              className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                ${showDeleteConfirmation
                  ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'text-red-700 bg-white border-red-300 hover:bg-red-50 focus:ring-red-500'}`}
              disabled={submitting}
            >
              {showDeleteConfirmation ? 'Confirm Delete' : 'Delete Habit'}
            </button>
            
            <div className="space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/habits/${params.id}`)}
                className="py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
