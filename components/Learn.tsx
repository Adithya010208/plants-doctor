import React, { useState, useEffect } from 'react';
import { getLearningResources } from '../services/geminiService';
import type { LearningResource } from '../types';
import { BookOpenIcon, AlertTriangleIcon } from './Icons';

export const Learn: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getLearningResources();
        setResources(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Learning Hub</h2>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">Explore modern farming techniques and best practices.</p>
      </div>
      
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md flex items-center">
          <AlertTriangleIcon className="h-5 w-5 mr-3"/>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02]">
              <h3 className="text-xl font-bold text-primary-700 dark:text-primary-300 flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-3" />
                {resource.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4">{resource.summary}</p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">Key Techniques:</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                      {resource.techniques.map((tech, i) => <li key={i}>{tech}</li>)}
                  </ul>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-right">Source: {resource.source}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
