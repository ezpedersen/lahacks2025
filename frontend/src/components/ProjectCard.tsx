import React from 'react';

interface ProjectProps {
  project: {
    id: number;
    title: string;
    remixes: number;
    image: string;
    avatar: string;
    avatarColor: string;
  };
}

const ProjectCard: React.FC<ProjectProps> = ({ project }) => {
  return (
    <div className="group relative flex flex-col overflow-hidden">
      {/* Project image */}
      <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video mb-3 hover:opacity-90 transition-opacity cursor-pointer">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Project info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`${project.avatarColor} w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium`}>
            {project.avatar}
          </div>
          <span className="text-white text-sm font-medium truncate">{project.title}</span>
        </div>
        <span className="text-gray-400 text-xs">{project.remixes} Remixes</span>
      </div>
    </div>
  );
};

export default ProjectCard;