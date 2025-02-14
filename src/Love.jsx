import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LoveGenerator = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    yourName: '',
    lovedName: '',
    character: ''
  });
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const yourName = searchParams.get('yourName');
    const lovedName = searchParams.get('lovedName');
    const character = searchParams.get('character');
    
    if (yourName && lovedName && character) {
      generateMessage(yourName, lovedName, character);
      setShowForm(false);
    }
  }, [searchParams]);

  const generateMessage = (yourName, lovedName, character) => {
    // Replace this with actual LLM API call
    const generatedMessage = `My dearest ${lovedName},\n\nFrom the moment I met you, I knew there was something special about your ${character} nature. Your ${character} qualities have filled my life with joy and meaning. Every day with you feels like a blessing, ${yourName}.\n\nForever yours,\n${yourName}`;
    setMessage(generatedMessage);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(formData);
    navigate(`?${params.toString()}`);
    setShowForm(false);
  };

  const shareLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const whatsappShare = () => {
    const text = `Check out this love message for you: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (!showForm) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${
        darkMode ? 'bg-gradient-to-br from-gray-900 to-purple-900' : 'bg-gradient-to-br from-pink-500 to-red-500'
      }`}>
        {/* Controls */}
        <div className="fixed top-4 right-4 flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-white rounded-full shadow-lg"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Animated Hearts */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ y: '100vh', x: Math.random() * 100 - 50 + '%' }}
              animate={{ 
                y: '-100vh',
                rotate: 360,
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              ❤️
            </motion.div>
          ))}
        </div>

        {/* Message Card */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4 text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer mb-6"
          >
            {isOpen ? '💌' : '✉️'}
          </motion.div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap text-pink-600"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={shareLink}
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
            >
              Copy Link
            </button>
            <button
              onClick={whatsappShare}
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
            >
              Share via WhatsApp
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-br from-gray-900 to-purple-900' : 'bg-gradient-to-br from-pink-500 to-red-500'
    }`}>
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-pink-600">
          Create Your Love Message 💖
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Your Name</label>
            <input
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
              value={formData.yourName}
              onChange={(e) => setFormData({...formData, yourName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Your Loved One's Name</label>
            <input
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
              value={formData.lovedName}
              onChange={(e) => setFormData({...formData, lovedName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Their Special Qualities</label>
            <textarea
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
              rows="4"
              value={formData.character}
              onChange={(e) => setFormData({...formData, character: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded-full hover:bg-pink-700 transition"
          >
            Generate Love Message ✨
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default LoveGenerator;