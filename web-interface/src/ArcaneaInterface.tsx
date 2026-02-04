import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  Palette, 
  Zap, 
  Eye, 
  Settings, 
  Download,
  RefreshCw,
  Info,
  Dragon,
  Waves,
  Mountain,
  Circle
} from 'lucide-react';

// Guardian Agent definitions
const GUARDIAN_AGENTS = [
  {
    id: '@vision-artist',
    name: 'Vision Artist',
    element: 'wind',
    icon: Eye,
    color: '#98D8C8',
    description: 'Visual aesthetics and artistic composition'
  },
  {
    id: '@dragon-forge',
    name: 'Dragon Forge',
    element: 'fire',
    icon: Dragon,
    color: '#FF6B35',
    description: 'Bold transformation and creative destruction'
  },
  {
    id: '@crystal-architect',
    name: 'Crystal Architect',
    element: 'earth',
    icon: Mountain,
    color: '#4A5759',
    description: 'Systematic design and structural clarity'
  },
  {
    id: '@void-gazer',
    name: 'Void Gazer',
    element: 'void',
    icon: Circle,
    color: '#1A1A2E',
    description: 'Innovation and future possibilities'
  },
  {
    id: '@ocean-memory',
    name: 'Ocean Memory',
    element: 'water',
    icon: Waves,
    color: '#2E86AB',
    description: 'Deep wisdom and emotional intelligence'
  }
];

const VISUAL_STYLES = [
  { value: 'transcendent', label: 'Transcendent', description: 'Mythical depth with enterprise clarity' },
  { value: 'technical', label: 'Technical', description: 'Precision and accuracy focus' },
  { value: 'executive', label: 'Executive', description: 'C-suite presentation ready' }
];

const RESOLUTIONS = [
  { value: '4K', label: '4K Ultra HD', dimensions: '3840×2160' },
  { value: '1920x1080', label: 'Full HD', dimensions: '1920×1080' },
  { value: '2560x1440', label: 'QHD', dimensions: '2560×1440' }
];

const AUDIENCES = [
  { value: 'executive', label: 'Executive', icon: '👔' },
  { value: 'technical', label: 'Technical', icon: '🛠️' },
  { value: 'mixed', label: 'Mixed', icon: '👥' }
];

interface ImageMetadata {
  prompt?: string;
  model?: string;
  enhanced?: boolean;
  [key: string]: unknown;
}

interface GeneratedImage {
  url: string;
  description: string;
  guardian: string;
  element: string;
  style: string;
  resolution: string;
  timestamp: string;
  metadata?: ImageMetadata;
}

const ArcaneaInterface: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [selectedGuardian, setSelectedGuardian] = useState('');
  const [visualStyle, setVisualStyle] = useState('transcendent');
  const [resolution, setResolution] = useState('1920x1080');
  const [audience, setAudience] = useState('mixed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showGuardianInfo, setShowGuardianInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const generateImage = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // This would call the MCP server in real implementation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: topic,
          guardian: selectedGuardian,
          elemental: selectedGuardianData?.element,
          style: visualStyle,
          resolution,
          audience
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Generation failed with status ${response.status}`);
      }

      const result = await response.json();
      
      const newImage: GeneratedImage = {
        url: result.image?.url || `/api/mock-image?${Date.now()}`,
        description: topic,
        guardian: selectedGuardian || 'Multiple Guardians',
        element: selectedGuardianData?.element || 'void',
        style: visualStyle,
        resolution,
        timestamp: new Date().toISOString(),
        metadata: result.metadata
      };

      setGeneratedImages(prev => [newImage, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedGuardianData = GUARDIAN_AGENTS.find(g => g.id === selectedGuardian);

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `arcanea-${image.guardian.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-void-mystery via-earth-foundation to-dragon-fire text-white">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-accent-red rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold font-arcanea">Arcanea InfoGenius Pro</h1>
                  <p className="text-sm opacity-75">Guardian AI Enhanced Visual Generation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowGuardianInfo(!showGuardianInfo)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Toggle Guardian information"
                  title="Toggle Guardian information"
                >
                  <Info className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <Palette className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Topic Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Visual Concept
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe the architecture or visual you want to generate..."
                  className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-accent-red transition-colors resize-none"
                  rows={4}
                  maxLength={2000}
                  aria-label="Visual concept description"
                  aria-required="true"
                />
              </motion.div>

              {/* Guardian Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20, transitionDelay: "0.1s" }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <label className="block text-sm font-medium mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Guardian Enhancement
                </label>
                <div className="space-y-2">
                  {GUARDIAN_AGENTS.map((guardian) => (
                    <button
                      key={guardian.id}
                      onClick={() => setSelectedGuardian(selectedGuardian === guardian.id ? '' : guardian.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedGuardian === guardian.id
                          ? 'border-white/40 bg-white/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <guardian.icon className="w-5 h-5" style={{ color: guardian.color }} />
                          <span className="font-medium">{guardian.name}</span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded" 
                              style={{ backgroundColor: guardian.color + '20', color: guardian.color }}>
                          {guardian.element}
                        </span>
                      </div>
                      <p className="text-sm opacity-75 mt-1">{guardian.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Visual Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20, transitionDelay: "0.2s" }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <label className="block text-sm font-medium mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Visual Configuration
                </label>
                
                <div className="space-y-4">
                  {/* Visual Style */}
                  <div>
                    <label className="block text-sm mb-2">Style Level</label>
                    <select
                      value={visualStyle}
                      onChange={(e) => setVisualStyle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-accent-red"
                    >
                      {VISUAL_STYLES.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label} - {style.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resolution */}
                  <div>
                    <label className="block text-sm mb-2">Resolution</label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-accent-red"
                    >
                      {RESOLUTIONS.map(res => (
                        <option key={res.value} value={res.value}>
                          {res.label} ({res.dimensions})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Audience */}
                  <div>
                    <label className="block text-sm mb-2">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-accent-red"
                    >
                      {AUDIENCES.map(aud => (
                        <option key={aud.value} value={aud.value}>
                          {aud.icon} {aud.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateImage}
                disabled={!topic.trim() || isGenerating}
                className="w-full py-4 bg-gradient-to-r from-accent-red to-dragon-fire rounded-xl font-bold text-white border-2 border-transparent hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Guardian Enhancement in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Transcendent Visual</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {/* Selected Guardian Display */}
              {selectedGuardianData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                  style={{ borderColor: selectedGuardianData.color + '40' }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 border-2"
                         style={{ borderColor: selectedGuardianData.color }}>
                      <selectedGuardianData.icon className="w-8 h-8" style={{ color: selectedGuardianData.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedGuardianData.name}</h3>
                      <p className="opacity-75">{selectedGuardianData.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded font-medium"
                              style={{ backgroundColor: selectedGuardianData.color + '20', color: selectedGuardianData.color }}>
                          {selectedGuardianData.element} Elemental
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-accent-red/20 text-accent-red">
                          AI Enhanced
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-100"
                  >
                    <p className="font-medium">Generation Error</p>
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {generatedImages.map((image, index) => (
                    <motion.div
                      key={image.timestamp}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20"
                    >
                      <div className="aspect-video bg-black/20 relative">
                        <img
                          src={image.url}
                          alt={image.description}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => downloadImage(image)}
                            className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                            aria-label="Download image"
                            title="Download image"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-medium mb-2 truncate">{image.description}</h4>
                        <div className="flex items-center justify-between text-sm opacity-75">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 rounded bg-white/10">
                              {image.guardian}
                            </span>
                            <span className="px-2 py-1 rounded bg-white/10">
                              {image.style}
                            </span>
                          </div>
                          <span>{image.resolution}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty State */}
              {generatedImages.length === 0 && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 opacity-50" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Ready to Create Transcendent Visuals</h3>
                  <p className="opacity-75 max-w-md mx-auto">
                    Describe your concept and select a Guardian to enhance your creation with mystical intelligence
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArcaneaInterface;