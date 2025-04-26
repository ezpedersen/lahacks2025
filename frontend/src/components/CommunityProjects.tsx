import React from 'react';
import ProjectCard from './ProjectCard';
import { ChevronRight } from 'lucide-react';

const CommunityProjects: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: 'jason-the-ween',
      remixes: 3,
      image: 'https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      avatar: 'J',
      avatarColor: 'bg-orange-500'
    },
    {
      id: 2,
      title: 'eric-ou',
      remixes: 0,
      image: 'https://images.pexels.com/photos/4665064/pexels-photo-4665064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      avatar: 'E',
      avatarColor: 'bg-amber-600'
    },
    {
      id: 3,
      title: 'lebron-james',
      remixes: 284,
      image: 'https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      avatar: 'L',
      avatarColor: 'bg-blue-500'
    },
    {
      id: 4,
      title: 'chaewon-kim',
      remixes: 129,
      image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      avatar: 'C',
      avatarColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="mt-16 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-semibold">Trending Tutorials</h2>
        <button className="text-gray-300 hover:text-white flex items-center text-sm">
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default CommunityProjects;