import React from 'react';
import { TrendTopic } from '../types';

interface TopicItemProps {
  topic: TrendTopic;
  index: number;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topic, index }) => {
  return (
    <article className="py-8 border-b border-ink-900/10 last:border-0 group">
      <div className="flex items-baseline space-x-3 mb-2">
        <span className="font-sans text-xs font-bold text-ink-900/40 uppercase tracking-wider">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="font-serif text-2xl font-semibold text-ink-900 leading-tight group-hover:text-ink-600 transition-colors duration-200">
          {topic.title}
        </h2>
      </div>
      
      <div className="pl-0 sm:pl-7">
        <p className="font-serif text-lg text-ink-800 leading-relaxed opacity-90">
          {topic.summary}
        </p>
        
        <div className="mt-3 flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ink-900/5 text-ink-600">
            Trending on {topic.platform}
          </span>
        </div>
      </div>
    </article>
  );
};
