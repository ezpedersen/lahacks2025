import { useState} from 'react';
import Hero from './Hero';
import PromptInput from './PromptInput';
import QuickActions from './QuickActions';


function Landing() {
  // const [prompt, setPrompt] = useState<string>('https://www.youtube.com/watch?v=Ry2wUn4j1Vk');


  const [prompt, setPrompt] = useState<string>('https://www.youtube.com/watch?v=oTd9sv684mY');



  return (
    <div className="h-screen w-screen fixed overflow-hidden">
      {/* Background gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-orange-600/40">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-full h-[600px] bg-orange-500/20 rounded-full blur-[120px]" />
        </div>
      </div>
      
      <div className="relative z-10 h-full w-full flex flex-col">
        <main className="flex-1 w-full px-4 py-2 overflow-hidden flex flex-col">
          <div className="mt-24">
            <Hero />
            <PromptInput prompt={prompt} setPrompt={setPrompt} />
            <QuickActions />
            <div className="flex-1 overflow-hidden">
              {/* <CommunityProjects /> */}
              {/* <CartoonSpeechBubble>Dim down the glowing a bit and also click on the kdjfdlksfjlsd jfdk Dim down the glowing a</CartoonSpeechBubble> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Landing;
