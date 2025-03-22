import Header from '@/components/Header';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { 
  ArrowLeft, BookOpen, Search, ChevronRight, 
  Heart, BadgeAlert, Thermometer, Bandage, 
  Droplets, Pill, Stethoscope, X, ChevronDown
} from 'lucide-react';

interface FirstAidItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  steps: string[];
  warnings?: string[];
  symptoms?: string[];
  content?: string;
}

export default function FirstAidGuide() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<FirstAidItem | null>(null);
  
  const firstAidGuides: FirstAidItem[] = [
    {
      id: 'cpr',
      title: 'CPR',
      icon: Heart,
      color: 'text-red-500',
      steps: [
        'Check the scene for safety.',
        'Check responsiveness by tapping the person and shouting "Are you OK?"',
        'Call 911 or have someone else call.',
        'Place the person on their back on a firm, flat surface.',
        'Kneel beside the person\'s neck and shoulders.',
        'Place the heel of one hand on the center of the chest, then place your other hand on top and interlock your fingers.',
        'Position your shoulders directly over your hands, keeping your arms straight.',
        'Push hard and fast (about 100-120 compressions per minute). Allow the chest to return to its normal position after each compression.',
        'Continue until professional help arrives or the person starts breathing normally.',
      ],
      warnings: [
        'If you\'re not trained in CPR, perform hands-only CPR (compressions without breaths).',
        'If you\'re trained, you can provide 2 rescue breaths for every 30 compressions.',
        'Use an AED if available.'
      ],
      symptoms: [
        'Unconsciousness',
        'Not breathing or abnormal breathing',
        'No pulse',
      ],
    },
    {
      id: 'choking',
      title: 'Choking',
      icon: BadgeAlert,
      color: 'text-orange-500',
      steps: [
        'Ask "Are you choking? Can you speak?"',
        'If the person cannot speak or breathe, stand behind them and place one foot slightly forward for balance.',
        'Wrap your arms around their waist.',
        'Make a fist with one hand and place it just above the person\'s navel.',
        'Grasp your fist with your other hand.',
        'Press hard into the abdomen with quick, upward thrusts.',
        'Repeat until the object is expelled or the person becomes unconscious.',
        'If the person becomes unconscious, carefully lower them to the ground and begin CPR.',
      ],
      warnings: [
        'For pregnant women or obese individuals, place your hands at the base of the breastbone.',
        'For children under 1 year, use back blows and chest thrusts instead.',
        'Call 911 if the person doesn\'t recover quickly.',
      ],
      symptoms: [
        'Inability to talk, cough, or breathe',
        'Clutching the throat',
        'Panic',
        'Bluish color to lips, skin, nails',
      ],
    },
    {
      id: 'bleeding',
      title: 'Severe Bleeding',
      icon: Droplets,
      color: 'text-red-600',
      steps: [
        'Apply pressure directly on the wound using a sterile bandage, clean cloth, or piece of clothing.',
        'If blood soaks through, add more material without removing the original dressing.',
        'If possible, elevate the wounded area above the heart.',
        'If bleeding is from an arm or leg and cannot be controlled, apply a tourniquet if you have training.',
        'Secure the wound with bandages.',
        'If the wound is large or deep, seek immediate medical care.',
      ],
      warnings: [
        'Use a tourniquet only as a last resort when direct pressure isn\'t controlling the bleeding.',
        'Don\'t remove any embedded objects from the wound.',
        'Call 911 for severe bleeding that doesn\'t stop with direct pressure.',
      ],
    },
    {
      id: 'burns',
      title: 'Burns',
      icon: Thermometer,
      color: 'text-amber-500',
      steps: [
        'Stop the burning process by removing the source of heat.',
        'Remove any jewelry or tight items from the burned area before swelling occurs.',
        'Cool the burn with cool (not cold) running water for at least 10 minutes.',
        'Cover the burn with a sterile, non-stick bandage or clean cloth.',
        'Don\'t apply ice, butter, or ointments to the burn.',
        'For mild burns, take over-the-counter pain relievers if needed.',
      ],
      warnings: [
        'Seek medical attention for burns that are large, deep, or on the face, hands, feet, genitals, or major joints.',
        'For chemical burns, remove contaminated clothing and rinse the area with water for at least 20 minutes.',
        'For electrical burns, ensure the person is not in contact with the electricity source before touching them.',
      ],
      symptoms: [
        'Red, swollen skin',
        'Pain',
        'Blisters',
        'White or charred skin (severe burns)',
      ],
    },
    {
      id: 'fractures',
      title: 'Fractures',
      icon: Bandage,
      color: 'text-blue-500',
      steps: [
        'Keep the injured person still and calm.',
        'If the person is bleeding, apply pressure to the wound with a sterile bandage.',
        'Immobilize the injured area by keeping it still and supported.',
        'Apply ice packs wrapped in a towel to reduce swelling.',
        'Don\'t try to realign the bone or push a protruding bone back in.',
        'Treat for shock if necessary by having the person lie flat, elevating the feet if possible, and keeping them warm.',
      ],
      warnings: [
        'Don\'t move the person unless absolutely necessary, especially if you suspect a neck or back injury.',
        'Call 911 for any major fracture or if you\'re unsure.',
        'If a limb appears deformed or is very painful when moved, assume it\'s broken.',
      ],
      symptoms: [
        'Pain that increases with movement',
        'Swelling and bruising',
        'Deformity or abnormal alignment',
        'Inability to put weight on or use the affected area',
      ],
    },
    {
      id: 'seizures',
      title: 'Seizures',
      icon: Stethoscope,
      color: 'text-purple-500',
      steps: [
        'Ease the person to the floor if possible.',
        'Clear the area of anything hard or sharp.',
        'Put something soft and flat under their head.',
        'Remove eyeglasses and loosen tight neckwear.',
        'Turn the person gently onto one side to prevent choking.',
        'Time the seizure. If it lasts longer than 5 minutes, call 911.',
        'Stay with the person until the seizure ends and they are fully awake.',
        'After the seizure, help the person sit in a safe place and explain what happened.',
      ],
      warnings: [
        'Never put anything in the person\'s mouth during a seizure.',
        'Don\'t try to hold down or restrain the person.',
        'Call 911 if this is the person\'s first seizure, if the seizure lasts more than 5 minutes, if the person doesn\'t wake up afterward, or if the person is pregnant or has diabetes.',
      ],
    },
    {
      id: 'poisoning',
      title: 'Poisoning',
      icon: Pill,
      color: 'text-green-600',
      steps: [
        'Call the Poison Control Center at 1-800-222-1222 immediately.',
        'Follow their instructions exactly.',
        'If the person is unconscious, not breathing, or having convulsions, call 911.',
        'Try to determine what substance the person was exposed to, when, and how much.',
        'For swallowed poisons, don\'t give anything to drink unless advised by Poison Control.',
        'For poisons on the skin, remove contaminated clothing and rinse skin with running water for 15-20 minutes.',
        'For inhaled poisons, get the person to fresh air immediately.',
      ],
      warnings: [
        'Never induce vomiting unless specifically instructed by a medical professional.',
        'Keep all potential poisons out of reach of children and in their original containers.',
        'Even household products can be poisonous if swallowed, inhaled, or absorbed through the skin.',
      ],
      symptoms: [
        'Nausea or vomiting',
        'Dizziness or drowsiness',
        'Difficulty breathing',
        'Burns or redness around the mouth',
        'Chemical odor on breath',
        'Burns, stains, or odors on the person or clothing',
      ],
    },
  ];
  
  const filteredGuides = searchQuery
    ? firstAidGuides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guide.symptoms && guide.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : firstAidGuides;
  
  if (selectedGuide) {
    return (
      <>
        <Header 
          title={selectedGuide.title} 
          leftIcon={<ArrowLeft className="w-6 h-6" />}
          onLeftIconClick={() => setSelectedGuide(null)}
        />
        
        <main className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-5">
            <div className={`bg-${selectedGuide.color.split('-')[1]}-50 p-4 border-b border-${selectedGuide.color.split('-')[1]}-100 flex items-center`}>
              <div className={`${selectedGuide.color} mr-3`}>
                <selectedGuide.icon className="w-6 h-6 stroke-[2px]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{selectedGuide.title}</h2>
                <p className="text-sm text-gray-600">Follow these steps carefully</p>
              </div>
            </div>
            
            {selectedGuide.symptoms && (
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-800 mb-2">Symptoms to Look For</h3>
                <ul className="space-y-1">
                  {selectedGuide.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-red-500 mr-2">•</span>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-800 mb-2">Steps to Follow</h3>
              <ol className="space-y-3">
                {selectedGuide.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            {selectedGuide.warnings && (
              <div className="p-4 bg-amber-50">
                <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                  <BadgeAlert className="w-4 h-4 mr-1" />
                  Important Warnings
                </h3>
                <ul className="space-y-2">
                  {selectedGuide.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start text-sm text-amber-700">
                      <span className="text-amber-500 mr-2">⚠</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-4 border-t">
              <div className="bg-red-100 rounded-lg p-3 text-center">
                <p className="text-red-800 text-sm font-medium">
                  Call 911 immediately in life-threatening situations
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = 'tel:911'}
            className="w-full py-3 bg-red-600 rounded-lg text-white font-bold flex items-center justify-center mb-4"
          >
            Emergency Call (911)
          </button>
        </main>
      </>
    );
  }
  
  return (
    <>
      <Header 
        title="First Aid Guide" 
        leftIcon={<ArrowLeft className="w-6 h-6" />}
        onLeftIconClick={() => navigate('/')}
      />
      
      <main className="flex-1 p-4 overflow-auto">
        <div className="bg-amber-50 p-4 rounded-lg mb-5 flex items-center">
          <BookOpen className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            This guide provides basic first aid instructions. Always seek professional medical help in emergencies.
          </p>
        </div>
        
        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search symptoms or conditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-5">
          {filteredGuides.length > 0 ? (
            <div className="divide-y">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedGuide(guide)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`${guide.color} p-2 rounded-full mr-3`}>
                        <guide.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{guide.title}</h3>
                        {guide.symptoms && (
                          <p className="text-xs text-gray-500 mt-1">
                            {guide.symptoms.slice(0, 2).join(', ')}
                            {guide.symptoms.length > 2 && '...'}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No guides found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary-600 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-5">
          <details className="group">
            <summary className="p-4 flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-primary-500 mr-2" />
                <h3 className="font-medium text-gray-800">When to Call 911</h3>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 pt-0 border-t text-sm text-gray-600 space-y-2">
              <p>Call 911 immediately in these situations:</p>
              <ul className="space-y-1 list-disc pl-5">
                <li>Difficulty breathing or shortness of breath</li>
                <li>Chest or upper abdominal pain or pressure</li>
                <li>Fainting, sudden dizziness, or weakness</li>
                <li>Changes in vision</li>
                <li>Difficulty speaking</li>
                <li>Confusion or changes in mental status</li>
                <li>Any sudden or severe pain</li>
                <li>Uncontrolled bleeding</li>
                <li>Severe or persistent vomiting or diarrhea</li>
                <li>Coughing or vomiting blood</li>
                <li>Suicidal or homicidal feelings</li>
                <li>Suspected poisoning</li>
              </ul>
            </div>
          </details>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-red-800 mb-2">Emergency Disclaimer</h3>
          <p className="text-sm text-red-700">
            This guide is for informational purposes only and is not a substitute for professional medical advice, 
            diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions 
            you may have regarding a medical condition or emergency.
          </p>
        </div>
      </main>
    </>
  );
}